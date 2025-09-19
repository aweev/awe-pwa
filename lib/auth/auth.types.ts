// lib/auth/auth.types.ts

import { Role } from "@prisma/client";

// The user object shape returned by the auth service
export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  memberType?: string | null;
  roles: string[];
  mfaEnabled: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  onboardingCompleted: boolean;
}

// Payloads for our JSON Web Tokens
export interface AccessTokenPayload {
  sub: string; // The ID of the logged-in user (the "actor")
  email?: string;
  roles: Role[];
  permissions: string[]; // e.g., ['posts:create', 'users:read']
  // Impersonation data
  actAsSub?: string; // The ID of the user being acted as
  isImpersonating: boolean;
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  jti: string; // Session ID (JWT ID)
  type: "refresh";
}

// Standard response for login/refresh operations
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}