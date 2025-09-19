// lib/email/templates/verification.tsx
import { Button, Html, Text } from '@react-email/components';
import * as React from 'react';

interface EmailProps {
  name: string;
  actionUrl: string;
}

const templates = {
  en: {
    subject: 'Verify your email address',
    EmailComponent: ({ name, actionUrl }: EmailProps) => (
      <Html>
        <Text>Hi {name},</Text>
        <Text>Welcome! Please click the button below to verify your email address and complete your registration.</Text>
        <Button href={actionUrl}>Verify Email</Button>
      </Html>
    ),
  },
  de: {
    subject: 'Bestätigen Sie Ihre E-Mail-Adresse',
    EmailComponent: ({ name, actionUrl }: EmailProps) => (
      <Html>
        <Text>Hallo {name},</Text>
        <Text>Willkommen! Bitte klicken Sie auf die Schaltfläche unten, um Ihre E-Mail-Adresse zu bestätigen und Ihre Registrierung abzuschließen.</Text>
        <Button href={actionUrl}>E-Mail bestätigen</Button>
      </Html>
    ),
  },
  fr: {
    subject: 'Vérifiez votre adresse e-mail',
    EmailComponent: ({ name, actionUrl }: EmailProps) => (
      <Html>
        <Text>Bonjour {name},</Text>
        <Text>Bienvenue ! Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse e-mail et finaliser votre inscription.</Text>
        <Button href={actionUrl}>Vérifier l&apos;e-mail</Button>
      </Html>
    ),
  },
};

export default templates;