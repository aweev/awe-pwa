// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { loginSchema } from '@/lib/auth/auth.schemas';
import { createSessionCookie } from '@/lib/auth/cookies/cookie.service';
import { getLocaleFromRequest } from '@/lib/utils/request';

export const POST = createApiHandler(
  async (req, { body: { email, password } }) => {
    const ip = getLocaleFromRequest(req);
    const userAgent = req.headers.get("user-agent");

    const result = await authService.loginWithPassword(email, password, ip, userAgent ?? undefined);
    
    const response = NextResponse.json(result);
    response.cookies.set(createSessionCookie(result.refreshToken));
    return response;
  },
  {
    limiter: 'login',
    bodySchema: loginSchema,
  }
);