// lib/auth/auth.service.ts
import { prisma } from "@/lib/db";
import { passwordService } from "./password/password.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./tokens/jwt.service";
import { sessionService } from "./sessions/session.service";
import { auditLog } from "./security/audit.logger";
import { generateTotpSecret, getTotpUri, verifyTotpToken } from "./mfa/totp.service";
import { AccountExistsError, AuthError, InvalidCredentialsError, InvalidTokenError, MfaRequiredError } from "./auth.errors";
import type { AuthResponse, AuthUser, AccessTokenPayload } from "./auth.types";
import { Role, User } from "@prisma/client";
import { createEmailVerificationToken } from "./verification/email.verification";
import { rbacService } from "./rbac.service";
import { inngest } from "@/app/api/auth/inngest/route";
import { emailService } from "../email/email.service";
import { Locale } from "../i18n";
import { onboardingService } from "../onboarding/onboarding.service";

// REFINEMENT: Updated helper to correctly handle the `roles: Role[]` array from Prisma.
function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || "",
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    memberType: user.memberType,
    roles: user.roles, // The `roles` array is already in the correct format (string enums)
    mfaEnabled: user.mfaEnabled,
  };
}

export const authService = {
  /** REGISTER a new user with email and password. */
  async register(data: { email: string; password?: string; firstName?: string; lastName?: string }, locale: Locale = 'en'): Promise<User> {
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email: data.email } });
      if (existing) throw new AccountExistsError();

    const hashedPassword = data.password ? await passwordService.hash(data.password) : null;
      const newUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          roles: [Role.ACTIVE_VOLUNTEER],
        },
      });

      await inngest.send({
        name: 'auth/user.registered',
        data: { email: newUser.email, locale },
        user: { email: newUser.email },
      });

      return newUser;
    });

    await auditLog("register", user.id);
    return user;
  },

  /** LOGIN with password. Handles MFA step if enabled. */
  async loginWithPassword(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.hashedPassword) throw new InvalidCredentialsError();

    const isPasswordValid = await passwordService.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      await auditLog("login_failed", user.id, { ip, reason: "invalid_password" });
      throw new InvalidCredentialsError();
    }

    // --- PRODUCTION CHECK: Ensure user is verified before allowing login ---
    if (!user.isVerified) {
      await auditLog("login_failed", user.id, { ip, reason: "email_not_verified" });
      // To prevent account enumeration, we send a generic error.
      // But we can re-send the verification email to help the user.
      await this.createAndSendVerificationToken(user.email || ''); 
      throw new AuthError("Your account is not verified. We've sent a new verification link to your email.");
    }

    // --- MFA Check ---
    if (user.mfaEnabled && user.mfaSecret) {
      const mfaTokenPayload: Omit<AccessTokenPayload, 'type'> = {
        sub: user.id,
        roles: [], // No roles/permissions in a temporary MFA token
        permissions: [],
        isImpersonating: false
      };
      const mfaToken = await signAccessToken(mfaTokenPayload);
      await auditLog("login_mfa_required", user.id, { ip });
      throw new MfaRequiredError(mfaToken);
    }
    
    return this.finalizeLogin(user, ip, userAgent);
  },

  /** VERIFY EMAIL: Called by the link in the verification email. */
  async verifyEmail(token: string): Promise<User> {
    const verificationToken = await prisma.verificationToken.findUnique({ where: { token } });

    if (!verificationToken || new Date(verificationToken.expires) < new Date()) {
      throw new InvalidTokenError("Verification token is invalid or has expired.");
    }
    
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true, emailVerified: new Date() },
      });
      await tx.verificationToken.delete({ where: { id: verificationToken.id } });
      return updatedUser;
    });

    await auditLog("email_verified", user.id);
    return user;
  },

  /** REQUEST PASSWORD RESET: Sends an event to queue for password reset email. */
  async requestPasswordReset(email: string, locale: Locale = 'en'): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // SECURITY: Do not throw an error. Fail silently to prevent email enumeration.
      return; 
    }

    await inngest.send({
        name: 'auth/password.reset_requested',
        data: { email: user.email, locale },
        user: { email: user.email },
    });
  },
  
  /** RESET PASSWORD: Called by the form after clicking the reset link. */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await prisma.passwordReset.findUnique({ where: { tokenHash: token } });

    if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
        throw new InvalidTokenError("Password reset token is invalid or has expired.");
    }

    const newHashedPassword = await passwordService.hash(newPassword);

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: resetToken.userId },
            data: { hashedPassword: newHashedPassword }
        });
        // Invalidate all sessions for security
        await sessionService.delete(resetToken.userId);
        // Delete the used token
        await tx.passwordReset.delete({ where: { id: resetToken.id } });
    });

    await auditLog("password_reset_success", resetToken.userId);
  },

  // --- Background Job Helpers ---
  async createAndSendVerificationToken(email: string, locale: Locale = 'en') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) return;

    const token = crypto.getRandomValues(new Uint32Array(1))[0].toString(16).padStart(8, '0');
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.create({ data: { userId: user.id, token, expires } })
    ]);

    await emailService.sendVerificationEmail(user.email || '', user.firstName || 'User', token, locale);
  },

  async createAndSendPasswordResetToken(email: string, locale: Locale = 'en') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return; // Should not happen if called correctly

      const token = crypto.getRandomValues(new Uint32Array(1))[0].toString(16).padStart(8, '0');
      const expires = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour

      await prisma.$transaction([
          prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
          prisma.passwordReset.create({ data: { userId: user.id, tokenHash: token, expiresAt: expires } })
      ]);

      await emailService.sendPasswordResetEmail(user.email || '', user.firstName || 'User', token, locale);
  },

  /** Finalize login after all checks (password, MFA) are passed. */
  async finalizeLogin(user: User, ip?: string, userAgent?: string): Promise<AuthResponse> {
    let effectiveUser = user;
    let isImpersonating = false;

    // --- Impersonation Logic ---
    if (user.impersonatingUserId) {
      // FIX: Ensure the target user is fetched correctly
      const targetUser = await prisma.user.findUnique({ where: { id: user.impersonatingUserId } });
      if (targetUser) {
        effectiveUser = targetUser;
        isImpersonating = true;
      }
    }

    // Fetch the user with their onboarding status in one go.
    const userWithOnboarding = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        onboarding: true, // This assumes you named the relation 'onboarding'
      },
    });

    // If for some reason the user record was deleted mid-flow
    if (!userWithOnboarding) throw new InvalidTokenError("User not found.");

    let onboardingCompleted: boolean;

    // The onboarding process needs to be started for brand new OAuth users
    if (userWithOnboarding.onboarding) {
      onboardingCompleted = userWithOnboarding.onboarding.isCompleted;
    } else {
        await onboardingService.start(user.id);
        onboardingCompleted = false;
    }

    // REFINEMENT: The `effectiveUser` object now contains the roles array directly.
    const permissions = await rbacService.getPermissionsForRoles(effectiveUser.roles);
    const session = await sessionService.create(user.id, ip, userAgent);

    const accessTokenPayload: Omit<AccessTokenPayload, 'type'> = {
      sub: user.id,
      actAsSub: isImpersonating ? effectiveUser.id : undefined,
      roles: effectiveUser.roles,
      permissions: Array.from(permissions),
      isImpersonating,
    };
    const accessToken = await signAccessToken(accessTokenPayload);

    const refreshToken = await signRefreshToken({
      sub: user.id, // Refresh token is always for the real user
      jti: session.id,
    });

    // REFINEMENT: Update last login only for the real user
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await auditLog("login_success", user.id, { ip, impersonatedUserId: isImpersonating ? effectiveUser.id : undefined });

    return {
      user: toAuthUser(effectiveUser), // Return the profile of the user being acted as
      accessToken,
      refreshToken,
      onboardingCompleted, 
    };
  },

  /** Verify MFA token and complete the login process. */
  async verifyMfaAndLogin(userId: string, code: string, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new InvalidCredentialsError("MFA not set up for this user.");
    }

    const isCodeValid = verifyTotpToken(user.mfaSecret, code);
    if (!isCodeValid) {
      await auditLog("login_mfa_failed", user.id, { ip });
      throw new InvalidCredentialsError("Invalid MFA code.");
    }

    return this.finalizeLogin(user, ip, userAgent);
  },

  /** REFRESH access token using a refresh token. Implements session rotation. */
  async refresh(rawRefreshToken: string, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const payload = await verifyRefreshToken(rawRefreshToken);
    const { sub: userId, jti: sessionId } = payload;

    const session = await sessionService.getById(sessionId);
    if (!session || session.userId !== userId) {
      await auditLog("refresh_token_reuse_or_invalid", undefined, { attemptedUserId: userId, ip });
      throw new InvalidTokenError("Invalid session.");
    }
    
    // REFINEMENT: The session rotation logic is already handled inside sessionService and finalizeLogin.
    // We just need to fetch the real user and re-run the finalization process.
    
    // FIX: Get the actual user associated with the valid session
    const realUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!realUser) {
      // This case means the user was deleted since the session was created
      await sessionService.delete(sessionId); // Clean up the orphaned session
      throw new InvalidTokenError("User associated with session not found.");
    }

    // CRITICAL: Re-running finalizeLogin re-evaluates impersonation status and permissions
    return this.finalizeLogin(realUser, ip, userAgent);
  },

  /** LOGOUT by invalidating the current session. */
  async logout(rawRefreshToken: string): Promise<void> {
    try {
      const payload = await verifyRefreshToken(rawRefreshToken);
      await sessionService.delete(payload.jti);
      await auditLog("logout_success", payload.sub);
    } catch (error) {
      if (error instanceof InvalidTokenError) return;
      throw error;
    }
  },

  // --- MFA Management ---
  async generateMfaSetup(userId: string, userEmail: string) {
    const secret = generateTotpSecret();
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false }
    });
    const uri = getTotpUri(secret, userEmail);
    // You'd typically return the URI or a QR code data URL for the frontend
    return { secret, uri };
  },

  async enableMfa(userId: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new Error("MFA setup has not been initiated.");
    }
    if (!verifyTotpToken(user.mfaSecret, code)) {
      throw new InvalidCredentialsError("Invalid verification code.");
    }
    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true }
    });
    await auditLog("mfa_enabled", userId);
  },

  // ... other methods like getUserById, requestPasswordReset, etc. are largely fine, just ensure they fetch the user correctly.
  
  /** GET CURRENT USER (used by /api/auth/me) */
  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return toAuthUser(user);
  },

  /** EMAIL VERIFICATION */
  async sendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    const baseUrl = process.env.BASE_URL ?? "";
    await createEmailVerificationToken(user.id, email, baseUrl, user.username ?? undefined);
  },
};