// lib/email/email.service.ts
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { getTranslations, type Locale } from '@/lib/i18n';
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { VerificationEmail } from './templates/VerificationEmail';
import { render } from '@react-email/render';

// --- Environment Configuration ---
const fromEmail = process.env.EMAIL_FROM;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const isDevelopment = process.env.NODE_ENV === 'development';

if (!fromEmail) {
  throw new Error('EMAIL_FROM environment variable is not set. Emails cannot be sent.');
}
if (!appUrl) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set. Email links will be broken.');
}

// --- Define the Email Service Interface ---
interface EmailProvider {
  sendVerificationEmail(to: string, name: string, token: string, locale: Locale): Promise<void>;
  sendPasswordResetEmail(to: string, name: string, token: string, locale: Locale): Promise<void>;
}

// --- Provider 1: Nodemailer for Local Development (MailHog) ---
const mailhogTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 1025),
  secure: false,
});

const mailhogProvider: EmailProvider = {
  async sendVerificationEmail(to, name, token, locale) {
    const t = getTranslations(locale);
    const verificationLink = `${appUrl}/${locale}/verify?token=${token}`;

    // *** FIX: Await the render function to get the final string ***
    const htmlBody = await render(
      VerificationEmail({
        name: name || 'User',
        actionUrl: verificationLink,
        messages: t.emails.verification,
      })
    );

    console.log(`\n[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${t.emails.verification.subject}`);
    console.log(`[DEV EMAIL] Verification Link: ${verificationLink}\n`);

    await mailhogTransporter.sendMail({ from: fromEmail, to, subject: t.emails.verification.subject, html: htmlBody });
  },

  async sendPasswordResetEmail(to, name, token, locale) {
    const t = getTranslations(locale);
    const resetLink = `${appUrl}/${locale}/password-reset/${token}`;

    // *** FIX: Await the render function to get the final string ***
    const htmlBody = await render(
      PasswordResetEmail({
        name: name || 'User',
        actionUrl: resetLink,
        messages: t.emails.passwordReset,
      })
    );

    console.log(`\n[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${t.emails.passwordReset.subject}`);
    console.log(`[DEV EMAIL] Password Reset Link: ${resetLink}\n`);

    await mailhogTransporter.sendMail({ from: fromEmail, to, subject: t.emails.passwordReset.subject, html: htmlBody });
  },
};

// --- Provider 2: Resend for Production ---
const resendClient = new Resend(process.env.RESEND_API_KEY);

const resendProvider: EmailProvider = {
  async sendVerificationEmail(to, name, token, locale) {
    const t = getTranslations(locale);
    const verificationLink = `${appUrl}/${locale}/verify?token=${token}`;

    await resendClient.emails.send({
      from: fromEmail,
      to,
      subject: t.emails.verification.subject,
      react: VerificationEmail({
        name: name || 'User',
        actionUrl: verificationLink,
        messages: t.emails.verification,
      }),
    });
  },

  async sendPasswordResetEmail(to, name, token, locale) {
    const t = getTranslations(locale);
    const resetLink = `${appUrl}/${locale}/password-reset/${token}`;

    await resendClient.emails.send({
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

// --- Export the correct service based on the environment ---
export const emailService = isDevelopment ? mailhogProvider : resendProvider;