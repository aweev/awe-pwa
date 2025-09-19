// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { authService } from '@/lib/auth/auth.service';

export const GET = createApiHandler(
  async (_req, { session }) => {
    // The handler guarantees session is not null because auth is 'authenticated'
    const user = await authService.getUserById(session!.sub);
    
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  },
  {
    auth: 'authenticated', // This requires a valid Bearer token
    limiter: 'global',
  }
);