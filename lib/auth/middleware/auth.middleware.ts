// lib/auth/middleware/auth.middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "../tokens/jwt.service";
import { AccessTokenPayload } from "../auth.types";

// This is a helper for protecting API routes or server actions
export function withAuth(handler: (req: NextRequest, payload: AccessTokenPayload) => Promise<Response>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return handler(req, await payload);
  };
}