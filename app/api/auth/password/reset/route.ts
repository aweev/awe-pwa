// app/api/auth/password/reset/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { passwordService } from '@/lib/auth/password/password.service';
import { passwordResetConfirmSchema } from '@/lib/auth/auth.schemas';
import { auditLog } from '@/lib/auth/security/audit.logger';
import { getLocaleFromRequest } from '@/lib/utils/request';

export const POST = createApiHandler(
  async (req, { body: { token, newPassword } }) => {
    const ip = getLocaleFromRequest(req);

    const updatedUser = await passwordService.confirmReset(token, newPassword);

    if (!updatedUser) {
        await auditLog("password_reset_invalid_token", undefined, { ip });
        return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }
    
    await auditLog("password_reset_success", updatedUser.id, { ip });
    return NextResponse.json({ message: "Password has been reset successfully." });
  },
  {
    limiter: 'global',
    bodySchema: passwordResetConfirmSchema,
  }
);