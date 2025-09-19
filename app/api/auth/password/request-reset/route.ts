// app/api/auth/password/request-reset/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { passwordResetRequestSchema } from '@/lib/auth/auth.schemas';
import { auditLog } from '@/lib/auth/security/audit.logger';
import { getLocaleFromRequest } from '@/lib/utils/request';

export const POST = createApiHandler(
  async (req, { body: { email } }) => {
    const ip = getLocaleFromRequest(req);
    
    // Service call is inside the handler, but we always return a success message
    // to prevent user enumeration.
    await authService.requestPasswordReset(email);
    await auditLog("password_reset_requested", undefined, { ip, email });
    
    return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." });
  },
  {
    limiter: 'strict',
    bodySchema: passwordResetRequestSchema,
  }
);