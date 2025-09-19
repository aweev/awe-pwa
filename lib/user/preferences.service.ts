// lib/user/preferences.service.ts
import { prisma } from "@/lib/db";
import { PREFERENCES_DEFAULTS } from "./preferences.defaults";
import { preferencesUpdateSchema, PreferencesUpdateInput } from "./preferences.types";
import type { UserPreferences, Prisma } from "@prisma/client";

function normalizeJson<T>(value: T | undefined): Prisma.InputJsonValue | undefined {
  return value as unknown as Prisma.InputJsonValue;
}

export const preferencesService = {
  /**
   * Retrieves preferences, creating them from defaults if they don't exist.
   */
  async get(userId: string): Promise<UserPreferences> {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
    if (prefs) return prefs;

    return prisma.userPreferences.create({
      data: {
        userId,
        ...PREFERENCES_DEFAULTS,
        contentLanguage: normalizeJson(PREFERENCES_DEFAULTS.contentLanguage),
        contentTopics: normalizeJson(PREFERENCES_DEFAULTS.contentTopics),
        notificationSettings: normalizeJson(PREFERENCES_DEFAULTS.notificationSettings),
      },
    });
  },

  /**
   * Updates a user's preferences with validated data.
   */
  async update(userId: string, updates: PreferencesUpdateInput): Promise<UserPreferences> {
    const validated = preferencesUpdateSchema.parse(updates);

    const updatedPrefs = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...PREFERENCES_DEFAULTS,
        ...validated,
        contentLanguage: normalizeJson(validated.contentLanguage ?? PREFERENCES_DEFAULTS.contentLanguage),
        contentTopics: normalizeJson(validated.contentTopics ?? PREFERENCES_DEFAULTS.contentTopics),
        notificationSettings: normalizeJson(validated.notificationSettings ?? PREFERENCES_DEFAULTS.notificationSettings),
      },
      update: {
        ...validated,
        contentLanguage: normalizeJson(validated.contentLanguage),
        contentTopics: normalizeJson(validated.contentTopics),
        notificationSettings: normalizeJson(validated.notificationSettings),
      },
    });

    // Sync critical fields back to the main User model for easier access
    if (validated.language || validated.timezone) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          language: validated.language,
          timezone: validated.timezone,
        },
      });
    }

    return updatedPrefs;
  },
};
