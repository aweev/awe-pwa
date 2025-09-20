// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { loginSchema } from '@/lib/auth/auth.schemas';
import { createSessionCookie } from '@/lib/auth/cookies/cookie.service';
import { getIpFromRequest } from '@/lib/utils/request'; // <-- CORRECT IMPORT
import { AuthError, InvalidCredentialsError } from '@/lib/auth/auth.errors';

export const POST = createApiHandler(
  async (req, { body: { email, password } }) => {
    try {
      const ip = getIpFromRequest(req); // <-- FIX: Use the correct function
      const userAgent = req.headers.get('user-agent');

      const result = await authService.loginWithPassword(email, password, ip, userAgent ?? undefined);

      const response = NextResponse.json(result);

      if ('refreshToken' in result) {
        response.cookies.set(createSessionCookie(result.refreshToken));
      }

      return response;
    } catch (error) {
      // Provide specific error codes to the frontend
      if (error instanceof InvalidCredentialsError) {
        return NextResponse.json({ message: error.message, code: 'INVALID_CREDENTIALS' }, { status: 401 });
      }
      if (error instanceof AuthError) { // Catches "email not verified"
        return NextResponse.json({ message: error.message, code: 'EMAIL_NOT_VERIFIED' }, { status: 403 });
      }
      // Re-throw other errors to be handled by the generic handler
      throw error;
    }
  },
  {
    limiter: 'login',
    bodySchema: loginSchema,
  }
);