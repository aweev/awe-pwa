// lib/auth/cookies/cookie.service.ts
import { AUTH_CONFIG } from "../auth.config";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/** Prepares the session cookie for setting in a Next.js response. */
export function createSessionCookie(token: string): ResponseCookie {
  return {
    name: AUTH_CONFIG.SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: AUTH_CONFIG.COOKIE_SECURE,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'strict',
  };
}

/** Prepares a cookie for clearing, to be set in a Next.js response. */
export function clearSessionCookie(): ResponseCookie {
  return {
    name: AUTH_CONFIG.SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  };
}