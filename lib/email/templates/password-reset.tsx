// lib/email/templates/password-reset.tsx
import { Button, Html, Text } from '@react-email/components';
import * as React from 'react';

interface EmailProps {
  name: string;
  actionUrl: string;
}

const templates = {
  en: {
    subject: 'Reset your password',
    EmailComponent: ({ name, actionUrl }: EmailProps) => (
      <Html>
        <Text>Hi {name},</Text>
        <Text>Someone requested a password reset for your account. If this was you, click the button below to set a new password. If not, you can safely ignore this email.</Text>
        <Button href={actionUrl}>Reset Password</Button>
      </Html>
    ),
  },
  de: {
    subject: 'Setzen Sie Ihr Passwort zurück',
    EmailComponent: ({ name, actionUrl }: EmailProps) => (
      <Html>
        <Text>Hallo {name},</Text>
        <Text>Jemand hat eine Passwortzurücksetzung für Ihr Konto angefordert. Wenn Sie das waren, klicken Sie auf die Schaltfläche unten, um ein neues Passwort festzulegen. Wenn nicht, können Sie diese E-Mail ignorieren.</Text>
        <Button href={actionUrl}>Passwort zurücksetzen</Button>
      </Html>
    ),
  },
  fr: {
    subject: 'Réinitialisez votre mot de passe',
    EmailComponent: ({ name, actionUrl }: EmailProps) => (
      <Html>
        <Text>Bonjour {name},</Text>
        <Text>Quelqu&apos;un a demandé une réinitialisation de mot de passe pour votre compte. Si c&apos;était vous, cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Sinon, vous pouvez ignorer cet e-mail en toute sécurité.</Text>
        <Button href={actionUrl}>Réinitialiser le mot de passe</Button>
      </Html>
    ),
  },
};

export default templates;