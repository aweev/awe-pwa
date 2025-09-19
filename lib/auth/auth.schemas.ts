// lib/auth/auth.schemas.ts
import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address.").transform(v => v.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long."),
  username: z.string().min(3).max(30).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  terms: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address.").transform(v => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required."), // Min 1 is fine here, service handles logic
});

// NEW: Schema for MFA verification
export const mfaVerifySchema = z.object({
    mfaToken: z.string().min(1, "MFA token is required."),
    code: z.string().length(6, "MFA code must be 6 digits.").regex(/^\d{6}$/),
});

export const passwordResetSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 characters long."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address.").transform(v => v.toLowerCase().trim()),
});

export const passwordResetConfirmSchema = z.object({ 
  token: z.string().min(1, "Reset token is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long."),
});

export const sendVerificationSchema = z.object({
  email: z.string().email("Invalid email address.").transform(v => v.toLowerCase().trim()),
});

// For initiating OAuth flows
export const oauthInitiateSchema = z.object({
  returnTo: z.string().optional(),
});