import type { UserPreferences } from '@prisma/client';

export type { UserPreferences };

/* --------------------------------------------------------------- */
/* Zod – runtime validation + inferred TS                          */
/* --------------------------------------------------------------- */
import { z } from 'zod';

export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export const TimeFormatSchema = z.enum(['12h', '24h']);
export const VisibilitySchema = z.enum(['public', 'private', 'members_only']);

export const preferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  newsletterSubscription: z.boolean().default(true),

  theme: ThemeSchema.default('system'),
  language: z.string().min(2).max(5).default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('MM/dd/yyyy'),
  timeFormat: TimeFormatSchema.default('12h'),

  profileVisibility: VisibilitySchema.default('public'),
  showEmail: z.boolean().default(false),
  showPhoneNumber: z.boolean().default(false),
  showLocation: z.boolean().default(true),

  contentLanguage: z.array(z.string()).default(['en']),
  contentTopics: z.array(z.string()).default([]),

  notificationSettings: z.record(z.string(), z.unknown()).optional(),
});

/* partial for updates */
export const preferencesUpdateSchema = preferencesSchema.partial();

/* TS types inferred */
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type PreferencesUpdateInput = z.infer<typeof preferencesUpdateSchema>;