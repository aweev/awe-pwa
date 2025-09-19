// lib/user/user.service.ts
import { prisma } from "@/lib/db";
import { preferencesService } from "./preferences.service";
import type { User, UserPreferences } from "@prisma/client";

// Define a safe "Public Profile" type to avoid leaking sensitive data
export type PublicUserProfile = Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'avatar' | 'createdAt'>;

export const userService = {
  /**
   * Gets a user's full profile. FOR INTERNAL/AUTHENTICATED USE ONLY.
   */
  async getFullProfile(userId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  /**
   * Gets a user's public profile, safe to show to other users.
   */
  async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });
  },
  
  /**
   * Updates a user's core profile information.
   */
  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
  }): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  /**
   * A convenience method to get both the user's profile and preferences.
   */
  async getProfileWithPreferences(userId: string): Promise<{ profile: User; preferences: UserPreferences } | null> {
    const [profile, preferences] = await Promise.all([
      this.getFullProfile(userId),
      preferencesService.get(userId),
    ]);

    if (!profile) return null;

    return { profile, preferences };
  },

  // Expose the preferences service under the user service namespace
  preferences: preferencesService,
};