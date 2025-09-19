// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/utils/api-handler';
import { userService } from '@/lib/user/user.service';
import { preferencesUpdateSchema } from '@/lib/user/preferences.types';

// Schema for updating the core user profile
const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().min(3).optional(),
}).partial();

// Combined schema for the PATCH request body
const updateUserSchema = z.object({
  profile: profileUpdateSchema.optional(),
  preferences: preferencesUpdateSchema.optional(),
});

// GET /api/user/profile - Fetches the current user's profile and preferences
export const GET = createApiHandler(
  async (_req, { session }) => {
    const data = await userService.getProfileWithPreferences(session!.sub);
    if (!data) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }
    return NextResponse.json(data);
  },
  { auth: 'authenticated' }
);

// PATCH /api/user/profile - Updates profile and/or preferences
export const PATCH = createApiHandler(
  async (_req, { session, body }) => {
    const { profile, preferences } = body;
    const userId = session!.sub;
    
    // Perform updates in parallel if both are provided
    await Promise.all([
      profile ? userService.updateProfile(userId, profile) : Promise.resolve(null),
      preferences ? userService.preferences.update(userId, preferences) : Promise.resolve(null),
    ]);

    // Fetch the latest full state to return to the client
    const latestData = await userService.getProfileWithPreferences(userId);

    return NextResponse.json(latestData);
  },
  {
    auth: 'authenticated',
    bodySchema: updateUserSchema,
  }
);