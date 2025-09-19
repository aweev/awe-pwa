// app/api/auth/send-verification/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';
import { sendVerificationSchema } from '@/lib/auth/auth.schemas';
import { auditLog } from '@/lib/auth/security/audit.logger';
import { getLocaleFromRequest } from '@/lib/utils/request';

export const POST = createApiHandler(
  async (req, { body: { email } }) => {
    const ip = getLocaleFromRequest(req);

    // The handler's try/catch will handle any service errors.
    await authService.sendVerificationEmail(email);
    
    await auditLog("verification_email_sent", undefined, { ip, email });
    return NextResponse.json({ ok: true });
  },
  {
    limiter: 'global',
    bodySchema: sendVerificationSchema,
  }
);