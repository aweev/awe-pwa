// lib/auth/verification/email.verification.ts
import { prisma } from "@/lib/db";
import { generateRandomToken, hashTokenForDb } from "../auth.utils";
import { sendMail } from "../mailer/mailer";
import { verificationEmailTemplate, passwordResetTemplate } from "./verification.templates";
import { add } from "date-fns";
import { auditLog } from "../security/audit.logger";

/**
 * createEmailVerificationToken:
 * - creates a hashed token in DB for a user
 * - sends a verification email using configured mail provider
 */
export async function createEmailVerificationToken(userId: string, userEmail: string, baseUrl: string, name?: string) {
  const raw = generateRandomToken(24);
  const tokenHash = hashTokenForDb(raw);
  const expiresAt = add(new Date(), { hours: 24 });

  await prisma.emailVerification.create({
    data: { userId, tokenHash, expiresAt },
  });

  const verifyUrl = `${baseUrl}/verify?token=${raw}`;
  const { html, text, subject } = verificationEmailTemplate({ name, verifyUrl });

  await sendMail({ to: userEmail, subject, html, text });

  auditLog("email_verification_sent", userId, { email: userEmail });
  return raw; // raw token is returned so caller (or tests) can use it
}

/**
 * verifyEmailToken:
 * - given the raw token, mark verification used and return success + user
 */
export async function verifyEmailToken(raw: string) {
  const tokenHash = hashTokenForDb(raw);
  const rec = await prisma.emailVerification.findUnique({ where: { tokenHash } });
  if (!rec) return { ok: false, reason: "not_found" };
  if (rec.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (rec.used) return { ok: false, reason: "used" };

  // mark used and optionally mark user as verified (if you have user.verified)
  await prisma.emailVerification.update({ where: { id: rec.id }, data: { used: true } });

  // optional: update user.verified flag
  try {
    await prisma.user.update({ where: { id: rec.userId }, data: { /* verified: true */ } });
  } catch (e) {
    // ignore if user model doesn't have verified field
  }

  auditLog("email_verified", rec.userId, {});
  return { ok: true, userId: rec.userId };
}

/**
 * Password reset flow:
 * - createPasswordResetToken
 * - send password reset email
 * - verify token and mark used in confirm-reset route
 */
export async function createAndSendPasswordReset(userId: string, userEmail: string, baseUrl: string, name?: string) {
  const raw = generateRandomToken(24);
  const tokenHash = hashTokenForDb(raw);
  const expiresAt = add(new Date(), { hours: 2 });

  await prisma.passwordReset.create({
    data: { userId, tokenHash, expiresAt },
  });

  const resetUrl = `${baseUrl}/password/reset?token=${raw}`;
  const { html, text, subject } = passwordResetTemplate({ name, resetUrl });
  await sendMail({ to: userEmail, subject, html, text });
  auditLog("password_reset_sent", userId, { email: userEmail });
  return raw;
}

export async function confirmPasswordReset(raw: string, newPasswordHash: string) {
  const tokenHash = hashTokenForDb(raw);
  const rec = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!rec) return { ok: false, reason: "not_found" };
  if (rec.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (rec.used) return { ok: false, reason: "used" };

  // set new password on user
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: newPasswordHash } });
  await prisma.passwordReset.update({ where: { id: rec.id }, data: { used: true } });
  auditLog("password_reset_confirmed", rec.userId, {});
  return { ok: true };
}
