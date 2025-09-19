// lib/auth/mailer/mailer.ts
import sgMail from "@sendgrid/mail";
import FormData from "form-data";
import fetch from "node-fetch";

const MAIL_PROVIDER = process.env.MAIL_PROVIDER || "sendgrid";
const MAIL_FROM = process.env.MAIL_FROM || "AWE e.V. <noreply@yourdomain.org>";

if (MAIL_PROVIDER === "sendgrid" && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendMail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  if (MAIL_PROVIDER === "sendgrid") {
    if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not configured");
    const msg: sgMail.MailDataRequired = {
      to,
      from: MAIL_FROM,
      subject,
      ...(html ? { html } : { text: text || "" }),
    };
    return sgMail.send(msg);
  }

  if (MAIL_PROVIDER === "mailgun") {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) throw new Error("MAILGUN env missing");
    const form = new FormData();
    form.append("from", MAIL_FROM);
    form.append("to", to);
    form.append("subject", subject);
    if (text) form.append("text", text);
    if (html) form.append("html", html);
    const auth = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64");
    return fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: form,
    }).then(r => {
      if (!r.ok) throw new Error(`Mailgun error: ${r.status} ${r.statusText}`);
      return r.json();
    });
  }

  throw new Error(`Unsupported mail provider: ${MAIL_PROVIDER}`);
}
