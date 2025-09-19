// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { AUTH_CONFIG } from "@/lib/auth/auth.config";
import { clearSessionCookie } from "@/lib/auth/cookies/cookie.service";

export async function POST(req: NextRequest) {
  const rawRefreshToken = req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value;

  if (rawRefreshToken) {
    // Invalidate the session on the backend.
    // We wrap this in a try/catch because we want to clear the cookie regardless.
    try {
      await authService.logout(rawRefreshToken);
    } catch (error) {
      // Log if necessary, but don't block the user from "logging out".
      console.error("Logout service error:", error);
    }
  }

  // Always clear the client-side cookie.
  const response = NextResponse.json({ message: "Logged out successfully." }, { status: 200 });
  response.cookies.set(clearSessionCookie());
  
  return response;
}