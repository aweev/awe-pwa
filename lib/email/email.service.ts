// lib/email/email.service.ts
import { Resend } from 'resend';
import { render } from '@react-email/render'; // This is now an async function
import VerificationEmailTemplates from './templates/verification';
import PasswordResetEmailTemplates from './templates/password-reset';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM;

type Locale = 'en' | 'de' | 'fr';

export const emailService = {
  async sendVerificationEmail(to: string, name: string, token: string, locale: Locale = 'en') {
    if (!fromEmail) throw new Error("EMAIL_FROM is not set.");
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
    
    const template = VerificationEmailTemplates[locale] || VerificationEmailTemplates['en'];
    
    // --- FIX: Add 'await' here ---
    const emailHtml = await render(React.createElement(template.EmailComponent, { name, actionUrl: verificationUrl }));

    await resend.emails.send({
      from: fromEmail,
      to,
      subject: template.subject,
      html: emailHtml, // Now emailHtml is a string, not a Promise<string>
    });
  },

  async sendPasswordResetEmail(to: string, name: string, token: string, locale: Locale = 'en') {
    if (!fromEmail) throw new Error("EMAIL_FROM is not set.");
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/password-reset/confirm?token=${token}`;
    
    const template = PasswordResetEmailTemplates[locale] || PasswordResetEmailTemplates['en'];
    
    // --- FIX: Add 'await' here as well ---
    const emailHtml = await render(React.createElement(template.EmailComponent, { name, actionUrl: resetUrl }));
    
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: template.subject,
      html: emailHtml,
    });
  },
};