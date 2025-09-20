// emails/templates/PasswordResetEmail.tsx
import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';
import type { Messages } from '@/lib/i18n';

interface PasswordResetEmailProps {
  name: string;
  actionUrl: string;
  messages: Messages['emails']['passwordReset']; // Strongly typed messages!
}

export const PasswordResetEmail = ({ name, actionUrl, messages }: PasswordResetEmailProps) => {
  return (
    <EmailLayout previewText={messages.previewText}>
      <Heading style={heading}>{messages.title}</Heading>
      <Text style={text}>{messages.greeting.replace('{{name}}', name)}</Text>
      <Text style={text}>{messages.body}</Text>
      <Section style={buttonContainer}>
        <Button style={button} href={actionUrl}>
          {messages.button}
        </Button>
      </Section>
      <Text style={text}>{messages.footer}</Text>
    </EmailLayout>
  );
};

// --- STYLES (can be shared with VerificationEmail) ---

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1D2129',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#1D2129',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#D95D39',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
};