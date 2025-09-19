// app/api/auth/login/verify-mfa/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { mfaVerifySchema } from '@/lib/auth/auth.schemas';
import { createSessionCookie } from '@/lib/auth/cookies/cookie.service';
import { verifyAccessToken } from '@/lib/auth/tokens/jwt.service';
import { getLocaleFromRequest } from '@/lib/utils/request';

export const POST = createApiHandler(
  async (req, { body: { mfaToken, code } }) => {
    const ip = getLocaleFromRequest(req);
    const userAgent = req.headers.get("user-agent");

    const payload = await verifyAccessToken(mfaToken);
    const result = await authService.verifyMfaAndLogin(payload.sub, code, ip, userAgent ?? undefined);

    const response = NextResponse.json({ user: result.user, accessToken: result.accessToken });
    response.cookies.set(createSessionCookie(result.refreshToken));
    return response;
  },
  {
    limiter: 'login',
    bodySchema: mfaVerifySchema,
  }
);