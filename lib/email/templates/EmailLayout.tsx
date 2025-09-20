// emails/components/EmailLayout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

// You can get these from your CSS variables or define them here
const BRAND_COLOR = '#D95D39'; // --color-brand-hopeful-clay
const FONT_FAMILY = 'Lora, serif';
const MAIN_TEXT_COLOR = '#1D2129'; // --color-brand-deep-charcoal
const FOOTER_TEXT_COLOR = '#65676B'; // --color-brand-medium-grey

export const EmailLayout = ({ previewText, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Replace with your actual logo URL */}
          <Img
            src={`https://your-cdn.com/awe-logo.png`}
            width="50"
            height="50"
            alt="AWE e.V. Logo"
            style={logo}
          />

          {children}

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} AWE e.V. All rights reserved.
            </Text>
            <Text style={footerText}>
              Rosenstr 25, 85609 Aschheim, Germany
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// --- STYLES (Inline CSS for maximum email client compatibility) ---

const main = {
  backgroundColor: '#F9F8F6', // --color-brand-canvas-white
  fontFamily: FONT_FAMILY,
};

const container = {
  padding: '24px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  maxWidth: '480px',
};

const logo = {
  margin: '0 auto 24px auto',
};

const footer = {
  marginTop: '24px',
  borderTop: `1px solid #e5e7eb`,
  paddingTop: '24px',
};

const footerText = {
  fontSize: '12px',
  color: FOOTER_TEXT_COLOR,
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0',
};