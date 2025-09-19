// lib/auth/providers/oauth.service.ts
import { prisma } from '@/lib/db';
import { auditLog } from '@/lib/auth/security/audit.logger';
import { authService } from '../auth.service'; 
import type { AuthResponse } from '../auth.types';
import { Role } from '@prisma/client';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

interface FacebookUserInfo {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      url: string;
    };
  };
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; id_token: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google code for tokens');
  }

  return response.json();
}

export async function exchangeFacebookCode(
  code: string,
  redirectUri: string
): Promise<{ access_token: string }> {
  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Facebook OAuth credentials not configured');
  }

  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook code for tokens');
  }

  return response.json();
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  return response.json();
}

export async function getFacebookUserInfo(accessToken: string): Promise<FacebookUserInfo> {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook user info');
  }

  return response.json();
}

interface NormalizedUserInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export const oauthService = {
  // We can namespace the external-facing functions for clarity
  exchangeGoogleCode,
  getGoogleUserInfo,
  exchangeFacebookCode,
  getFacebookUserInfo,

  /**
   * Handles the logic for both registering and logging in a user via an OAuth provider.
   * It finds an existing user or creates a new one, then defers to the main
   * `authService.finalizeLogin` to create a secure session.
   */
  async handleLogin(
    provider: 'google' | 'facebook',
    userInfo: NormalizedUserInfo,
    ip?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const email = userInfo.email?.toLowerCase().trim();
    if (!email) {
      throw new Error('Email not provided by OAuth provider.');
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a new user from the OAuth data
      user = await prisma.user.create({
        data: {
          email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          isVerified: true, // OAuth emails are considered verified
          avatar: userInfo.avatarUrl,
          // REFINEMENT: Assign a default member role for new OAuth signups
          roles: [Role.ACTIVE_VOLUNTEER],
        },
      });
      auditLog('oauth_user_created', user.id, { provider, ip });
    } else {
      // Optionally update avatar or name if they've changed
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          avatar: userInfo.avatarUrl ?? user.avatar,
        }
      });
    }

    // CRITICAL: Defer to the single source of truth for creating a session.
    // This ensures impersonation and permission logic is always applied correctly.
    auditLog('oauth_login_success', user.id, { provider, ip });
    return authService.finalizeLogin(user, ip, userAgent);
  }
};