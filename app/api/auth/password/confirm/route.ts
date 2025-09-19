// app/api/auth/password-reset/confirm/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { passwordResetConfirmSchema } from '@/lib/auth/auth.schemas';
import { authService } from '@/lib/auth/auth.service';
import { InvalidTokenError } from '@/lib/auth/auth.errors';

export const POST = createApiHandler(
  async (req, { body: { token, newPassword } }) => {
    try {
      await authService.resetPassword(token, newPassword);
      return NextResponse.json({ message: "Password has been reset successfully." });
    } catch (error) {
       if (error instanceof InvalidTokenError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  },
  {
    limiter: 'strict',
    bodySchema: passwordResetConfirmSchema, // Make sure this schema exists
  }
);