// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/auth.config";
import { authService } from "@/lib/auth/auth.service";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/cookies/cookie.service";
import { InvalidTokenError } from "@/lib/auth/auth.errors";
import { getLocaleFromRequest } from "@/lib/utils/request";

export async function POST(req: NextRequest) {
  const rawRefreshToken = req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value;

  if (!rawRefreshToken) {
    return NextResponse.json({ error: "Unauthorized: Missing session token." }, { status: 401 });
  }

  try {
    const ip = getLocaleFromRequest(req);
    const userAgent = req.headers.get("user-agent");
    const result = await authService.refresh(rawRefreshToken, ip, userAgent ?? undefined);

    const response = NextResponse.json({ user: result.user, accessToken: result.accessToken });
    response.cookies.set(createSessionCookie(result.refreshToken));
    return response;

  } catch (err) {
    if (err instanceof InvalidTokenError) {
      const response = NextResponse.json({ error: "Unauthorized: Invalid session." }, { status: 401 });
      response.cookies.set(clearSessionCookie());
      return response;
    }

    console.error("Refresh Token Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}