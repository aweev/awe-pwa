// app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { z } from 'zod';
import { authService } from '@/lib/auth/auth.service';
import { InvalidTokenError } from '@/lib/auth/auth.errors';

export const POST = createApiHandler(
  async (req, { body: { token } }) => {
    try {
      await authService.verifyEmail(token);
      return NextResponse.json({ message: "Email verified successfully." });
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        // Provide a specific, non-technical error message to the frontend
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error; // Let the generic handler manage other errors
    }
  },
  {
    limiter: 'global',
    bodySchema: z.object({ token: z.string().nonempty() }),
  }
);

// // app/api/auth/verify/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifyEmailToken } from "@/lib/auth/verification/email.verification";
// import { consumeGlobal } from "@/lib/rate-limit";
// import { auditLog } from "@/lib/auth/security/audit.logger";

// export async function GET(req: NextRequest) {
//   const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
//   const token = req.nextUrl.searchParams.get("token");

//   /* ----- rate limit ----- */
//   const decision = await consumeGlobal(ip);
//   if (!decision.allowed) {
//     return NextResponse.redirect(
//       new URL(`/auth/verify?status=rate_limited`, req.nextUrl.origin),
//       { status: 429, headers: { "Retry-After": String(decision.retryAfterSeconds) } }
//     );
//   }

//   if (!token) {
//     await auditLog("verify_missing_token", undefined, { ip });
//     return NextResponse.redirect(
//       new URL("/auth/verify?status=missing", req.nextUrl.origin)
//     );
//   }

//   try {
//     const res = await verifyEmailToken(token);
//     const status = res.ok ? "ok" : res.reason || "error";
//     if (!res.ok) await auditLog("verify_invalid_token", undefined, { ip, token });
//     else await auditLog("verify_success", res.userId, { ip });

//     return NextResponse.redirect(
//       new URL(`/auth/verify?status=${status}`, req.nextUrl.origin)
//     );
//   } catch (err) {
//     await auditLog("verify_exception", undefined, { ip, error: String(err) });
//     return NextResponse.redirect(
//       new URL("/auth/verify?status=error", req.nextUrl.origin)
//     );
//   }
// }