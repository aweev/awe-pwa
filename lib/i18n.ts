// lib/i18n.ts (updated)
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['en', 'de', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const messagesMap: Record<Locale, () => Promise<Record<string, unknown>>> = {
  en: () => import('@/messages/en.json').then((m) => m.default),
  de: () => import('@/messages/de.json').then((m) => m.default),
  fr: () => import('@/messages/fr.json').then((m) => m.default),
};

export default getRequestConfig(async ({ locale: requestLocale }) => {
  let detectedLocale = requestLocale as Locale;
  
  if (!detectedLocale) {
    const headersList = await headers();
    detectedLocale = (headersList.get('x-locale') as Locale) || defaultLocale;
  }
  
  const validLocale = locales.includes(detectedLocale) ? detectedLocale : defaultLocale;
  
  try {
    const messages = await messagesMap[validLocale]();
    return {
      locale: validLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for ${validLocale}:`, error);
    const fallbackMessages = await messagesMap[defaultLocale]();
    return {
      locale: defaultLocale,
      messages: fallbackMessages
    };
  }
});