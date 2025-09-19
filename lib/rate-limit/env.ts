// lib/rate-limit/env.ts
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // REMOVED .default() - This is a critical variable that MUST be provided
  // in every environment. The app will now throw an error on startup if
  // REDIS_URL is missing from the environment, which is what you want.
  REDIS_URL: z.string().url(),

  // Keeping defaults for these is acceptable, as they are less critical
  // and have sensible fallbacks.
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_LOGIN_WINDOW: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_GLOBAL_WINDOW: z.coerce.number().int().positive().default(60),
});

// This line now acts as a validation gate.
// It reads from process.env (which Next.js populates from .env.local)
// and validates it against your schema.
export const ENV = schema.parse(process.env);