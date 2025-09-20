// lib/email/email.service.ts
import { Resend } from 'resend';
import { getTranslations, type Locale } from '@/lib/i18n'; 
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { VerificationEmail } from './templates/VerificationEmail';

// --- Configuration ---
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!fromEmail) {
  throw new Error('EMAIL_FROM environment variable is not set. Emails cannot be sent.');
}
if (!appUrl) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set. Email links will be broken.');
}

export const emailService = {
  /**
   * Sends an email to a new user to verify their email address.
   * This is typically called by a background job (e.g., Inngest) after registration.
   * @param to The recipient's email address.
   * @param name The recipient's first name (or a fallback like 'User').
   * @param token The unique verification token.
   * @param locale The locale for the email template ('en', 'de', 'fr').
   */
  async sendVerificationEmail(to: string, name: string, token: string, locale: Locale) {
    const t = getTranslations(locale);
    const verificationLink = `${appUrl}/${locale}/verify?token=${token}`;
    
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: t.emails.verification.subject,
      // Use Resend's `react` property for seamless integration
      react: VerificationEmail({
        name: name || 'User',
        actionUrl: verificationLink,
        messages: t.emails.verification,
      }),
    });
  },

  /**
   * Sends an email to a user with a link to reset their password.
   * This is typically called by a background job after a user requests a password reset.
   * @param to The recipient's email address.
   * @param name The recipient's first name.
   * @param token The unique password reset token.
   * @param locale The locale for the email template.
   */
  async sendPasswordResetEmail(to: string, name: string, token: string, locale: Locale) {
    const t = getTranslations(locale);
    const resetLink = `${appUrl}/${locale}/password-reset/${token}`;
    
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: t.emails.passwordReset.subject,
      react: PasswordResetEmail({
        name: name || 'User',
        actionUrl: resetLink,
        messages: t.emails.passwordReset,
      }),
    });
  },
};