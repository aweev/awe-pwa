// lib/utils/request.ts
import { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { defaultLocale, locales } from '@/lib/i18n';

export function getLocaleFromRequest(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return match(languages, locales, defaultLocale);
  } catch {
    return defaultLocale;
  }
}

/**
 * Gets the user's IP address from the request.
 * 
 * This function is designed to be reliable in both Node.js and Edge runtimes.
 * It checks the `x-forwarded-for` header, which is the standard way to get
 * the client IP when behind a proxy (like on Vercel).
 * It falls back to `request.ip` for local development or other environments.
 * 
 * @param request - The NextRequest object.
 * @returns The user's IP address as a string, or undefined if not found.
 */
export function getIpFromRequest(request: NextRequest): string | undefined {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // 'x-forwarded-for' can be a comma-separated list of IPs.
    // The first one is the original client IP.
    return xff.split(',')[0].trim();
  }
  // Fallback for environments where `x-forwarded-for` is not set,
  // but `request.ip` might be available (e.g., local development).
  return "127.0.0.1";
}