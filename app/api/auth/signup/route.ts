// app/api/auth/signup/route.ts

import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { signUpSchema } from '@/lib/auth/auth.schemas';
import { getIpFromRequest, getLocaleFromRequest } from '@/lib/utils/request';
import type { Locale } from '@/lib/i18n';
import { AccountExistsError } from '@/lib/auth/auth.errors'; // <-- Import the error

export const POST = createApiHandler(
  async (req, { body: credentials }) => {
    try { // <-- Add a try block
      const ip = getIpFromRequest(req);
      const locale = getLocaleFromRequest(req) as Locale;

      await authService.register(credentials, ip, locale);

      return new Response(
        JSON.stringify({
          message: 'Registration successful. Please check your email.',
        }),
        { status: 201 }
      );
    } catch (error) { // <-- Add a catch block
      if (error instanceof AccountExistsError) {
        // If it's the specific account exists error, return 409 with a code
        return new Response(
          JSON.stringify({ message: error.message, code: 'ACCOUNT_EXISTS' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // For all other errors, re-throw them to be handled by the global handler
      throw error;
    }
  },
  {
    limiter: 'global',
    bodySchema: signUpSchema,
  }
);