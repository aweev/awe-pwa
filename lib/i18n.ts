// lib/i18n.ts (Final, Corrected, and Simplified Version)

import { getRequestConfig } from 'next-intl/server';

// --- STEP 1: DEFINE CONSTANTS AND CORE TYPES ---

export const locales = ['en', 'de', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// --- STEP 2: IMPORT JSON & CREATE THE `Messages` TYPE ---
// By importing the JSON files directly at the top level, we solve the ReferenceError
// and make the objects available for both synchronous and asynchronous use.

import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import frMessages from '@/messages/fr.json';

// This is the key export for your email templates.
// It creates a TypeScript type that perfectly matches your `en.json` structure.
export type Messages = typeof enMessages;

// --- STEP 3: CREATE A SIMPLE, SYNCHRONOUS LOADER FOR SERVER-SIDE USE ---
// This is perfect for background jobs (Inngest), API routes, and Server Actions.

const allTranslations: Record<Locale, Messages> = {
  en: enMessages,
  de: deMessages as Messages,
  fr: frMessages as Messages,
};

/**
 * A synchronous function to get translations on the server.
 * Ideal for API Routes, Server Actions, and background jobs.
 * @param locale The desired locale.
 * @returns The messages for that locale, falling back to English.
 */
export function getTranslations(locale: Locale): Messages {
  return allTranslations[locale] ?? allTranslations.en;
}

// --- STEP 4: CONFIGURE `next-intl` (THE DEFAULT EXPORT) ---
// We can now simplify this part significantly by using our new synchronous loader.

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  return {
    locale: validLocale,
    // Use our simple, synchronous function. No need for complex maps or try/catch.
    messages: getTranslations(validLocale),
  };
});