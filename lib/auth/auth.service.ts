// lib/auth/auth.service.ts

import { prisma } from "@/lib/db";
import { passwordService } from "./password/password.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./tokens/jwt.service";
import { sessionService } from "./sessions/session.service";
import { auditLog } from "./security/audit.logger";
import { verifyTotpToken } from "./mfa/totp.service";
import { AccountExistsError, AuthError, InvalidCredentialsError, InvalidTokenError } from "./auth.errors";
import type { AuthResponse, AuthUser, AccessTokenPayload } from "./auth.types";
import { Role, User } from "@prisma/client";
import { rbacService } from "./rbac.service";
import { inngest } from "@/inngest/client";
import { emailService } from "../email/email.service";
import { onboardingService } from "../onboarding/onboarding.service";
import type { Locale } from "../i18n";
import crypto from 'crypto';
import { add } from 'date-fns';
import { NextRequest } from "next/server";
import { getIpFromRequest, getLocaleFromRequest } from "../utils/request";
import { z } from "zod";
import { signUpSchema } from "./auth.schemas";

type SignUpCredentials = z.infer<typeof signUpSchema>;

async function finalizeLogin(user: User, ip?: string, userAgent?: string): Promise<AuthResponse> {
  const permissions = await rbacService.getPermissionsForRoles(user.roles);
  const session = await sessionService.create(user.id, ip, userAgent);

  const onboarding = await onboardingService.getOrCreate(user.id);

  const accessTokenPayload: Omit<AccessTokenPayload, "type"> = {
    sub: user.id,
    roles: user.roles,
    permissions: Array.from(permissions),
    isImpersonating: false,
  };

  const accessToken = await signAccessToken(accessTokenPayload);
  const refreshToken = await signRefreshToken({ sub: user.id, jti: session.id });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await auditLog("login_success", user.id, { ip });

  return {
    user: toAuthUser(user),
    accessToken,
    refreshToken,
    onboardingCompleted: onboarding.isCompleted,
  };
}

/**
 * Converts a Prisma User object to a safe, client-facing AuthUser object.
 * @param user The full User object from Prisma.
 * @returns An AuthUser object stripped of sensitive information.
 */
function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    mfaEnabled: user.mfaEnabled,
    // Add any other non-sensitive fields you want available on the client
  };
}

/**
 * The central service for all authentication-related business logic.
 * This service is the "brain" and should be called by API route handlers.
 * It is designed to be environment-agnostic (contains no req/res objects).
 */
export const authService = {
  /**
   * Registers a new user, hashes their password, and dispatches an event
   * to Inngest to send a verification email.
   */
  async register(credentials: SignUpCredentials, ip?: string, locale?: Locale): Promise<User> {
    const { email, password, firstName, lastName } = credentials;


    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AccountExistsError();

    const hashedPassword = await passwordService.hash(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        roles: [Role.ACTIVE_VOLUNTEER], // A sensible default role
      },
    });

    // DECOUPLE: Send an event to a background job queue. 
    // This makes the API response instant and email delivery reliable.
    await inngest.send({
      name: 'auth/user.registered',
      data: { email: newUser.email, locale },
    });

    await auditLog('signup_success', newUser.id, { ip });
    return newUser;
  },

  /**
   * Logs in a user with their password. Checks if their email is verified and
   * triggers the MFA flow if it's enabled.
   */
  async loginWithPassword(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthResponse | { mfaRequired: true; mfaToken: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword) {
      await auditLog("login_failed", undefined, { ip, email, reason: "account_not_found" });
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await passwordService.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      await auditLog("login_failed", user.id, { ip, reason: "invalid_password" });
      throw new InvalidCredentialsError();
    }

    if (!user.isVerified) {
      await auditLog("login_failed", user.id, { ip, reason: "email_not_verified" });
      // To help the user, re-send the verification email in the background.
      await this.createAndSendVerificationToken(user.email, 'en'); // Default to 'en' or detect locale
      throw new AuthError("Your account is not verified. We've sent a new verification link to your email.");
    }

    if (user.mfaEnabled) {
      const mfaToken = await signAccessToken({ sub: user.id, roles: [], permissions: [], isImpersonating: false });
      await auditLog("login_mfa_required", user.id, { ip });
      // Return a specific shape that the API handler and client can understand
      return { mfaRequired: true, mfaToken };
    }

    return finalizeLogin(user, ip, userAgent);
  },

  /**
   * Verifies an MFA code and, if valid, finalizes the login process.
   */
  async verifyMfaAndLogin(userId: string, code: string, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaEnabled || !user.mfaSecret) {
      throw new InvalidCredentialsError("MFA not set up for this user.");
    }

    if (!verifyTotpToken(user.mfaSecret, code)) {
      await auditLog("login_mfa_failed", user.id, { ip });
      throw new InvalidCredentialsError("Invalid MFA code.");
    }

    return finalizeLogin(user, ip, userAgent);
  },

  /**
   * Verifies an email verification token, marks the user as verified,
   * and deletes the token to prevent reuse.
   */
  async verifyEmail(token: string): Promise<void> {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expires < new Date()) {
      throw new InvalidTokenError('Token is invalid or has expired.');
    }

    // Use a transaction to ensure both operations succeed or fail together.
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { isVerified: true, emailVerified: new Date() },
      });
      await tx.verificationToken.delete({ where: { id: record.id } });
    });

    await auditLog("email_verified", record.userId);
  },

  /**
   * Dispatches an event to Inngest to send a password reset email.
   * Fails silently if the user does not exist to prevent email enumeration.
   */
  async requestPasswordReset(email: string, locale: Locale): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // SECURITY: Do not throw error.

    await inngest.send({
      name: 'auth/password.reset_requested',
      data: { email: user.email, locale },
    });
  },

  /**
   * Resets a user's password after they've clicked the link in their email.
   * Invalidates the token upon successful use.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await prisma.passwordReset.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new InvalidTokenError("Password reset token is invalid or has expired.");
    }

    const newHashedPassword = await passwordService.hash(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { hashedPassword: newHashedPassword }
      });
      // For security, delete all of the user's active sessions
      await tx.userSession.deleteMany({ where: { userId: record.userId } });
      // Delete the used token
      await tx.passwordReset.delete({ where: { id: record.id } });
    });

    await auditLog("password_reset_success", record.userId);
  },

  /**
   * Refreshes an access token using a valid refresh token.
   * Implements refresh token rotation for enhanced security.
   */
  async refresh(rawRefreshToken: string, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const { sub: userId, jti: sessionId } = await verifyRefreshToken(rawRefreshToken);

    // Use a transaction to perform rotation safely
    const session = await prisma.$transaction(async (tx) => {
      const currentSession = await tx.userSession.findUnique({ where: { id: sessionId } });

      // If session doesn't exist or is expired, it may be a replayed token
      if (!currentSession || currentSession.expiresAt < new Date()) {
        await auditLog("refresh_token_reuse_or_invalid", undefined, { attemptedUserId: userId, ip });
        // SECURITY: Invalidate all sessions for this user as a precaution
        await tx.userSession.deleteMany({ where: { userId } });
        throw new InvalidTokenError("Invalid session.");
      }

      // Invalidate the old session
      await tx.userSession.delete({ where: { id: sessionId } });
      return currentSession;
    });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new InvalidTokenError("User not found.");

    // Finalize login to issue a new set of tokens and a new session
    return finalizeLogin(user, ip, userAgent);
  },

  /**
   * Logs a user out by deleting their current session from the database.
   */
  async logout(rawRefreshToken: string): Promise<void> {
    try {
      const { jti: sessionId, sub: userId } = await verifyRefreshToken(rawRefreshToken);
      await sessionService.delete(sessionId);
      await auditLog("logout_success", userId);
    } catch (error) {
      // If the token is already invalid, we don't need to do anything.
      if (error instanceof InvalidTokenError) return;
      throw error;
    }
  },

  // --- METHODS CALLED BY INNGEST ---

  /**
   * [For Inngest] Creates a verification token and calls the email service.
   */
  async createAndSendVerificationToken(email: string, locale: Locale) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) return;

    const token = crypto.randomInt(100000, 999999).toString();
    const expires = add(new Date(), { hours: 24 });

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.create({ data: { userId: user.id, token, expires } })
    ]);

    await emailService.sendVerificationEmail(user.email, user.firstName || 'User', token, locale);
  },

  /**
   * [For Inngest] Creates a password reset token and calls the email service.
   */
  async createAndSendPasswordResetToken(email: string, locale: Locale) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = add(new Date(), { hours: 1 });

    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
      prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } })
    ]);

    await emailService.sendPasswordResetEmail(user.email, user.firstName || 'User', token, locale);
  },
};