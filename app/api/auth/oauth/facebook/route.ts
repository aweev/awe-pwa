// app/api/auth/oauth/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/utils/api-handler';
import { oauthInitiateSchema } from '@/lib/auth/auth.schemas';
import { exchangeFacebookCode, getFacebookUserInfo, oauthService } from '@/lib/auth/providers/oauth.service';
import { createSessionCookie } from '@/lib/auth/cookies/cookie.service';
import { auditLog } from '@/lib/auth/security/audit.logger';
import { getLocaleFromRequest } from '@/lib/utils/request';

// --- GET (Callback) ---
// This handler has custom redirect logic and is best left outside the api-handler wrapper.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  const ip = getLocaleFromRequest(request);
  const userAgent = request.headers.get('user-agent');

  if (error) {
    await auditLog('oauth_error', undefined, { provider: 'facebook', error, ip });
    return NextResponse.redirect(new URL(`/login?error=oauth_access_denied`, request.url));
  }

  if (!code) {
    await auditLog('oauth_missing_code', undefined, { provider: 'facebook', ip });
    return NextResponse.redirect(new URL('/login?error=oauth_invalid_response', request.url));
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/facebook`;
    const { access_token } = await exchangeFacebookCode(code, redirectUri);
    const userInfo = await getFacebookUserInfo(access_token);

    const normalizedData = {
        email: userInfo.email,
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        avatarUrl: userInfo.picture.data.url,
    };

    const { refreshToken } = await oauthService.handleLogin('facebook', normalizedData, ip, userAgent ?? undefined);
    
    const response = NextResponse.redirect(new URL(state ? decodeURIComponent(state) : '/members/dashboard', request.url));
    response.cookies.set(createSessionCookie(refreshToken));
    return response;

  } catch (err) {
    console.error('Facebook OAuth Callback Error:', err);
    await auditLog('oauth_exchange_failed', undefined, { provider: 'facebook', error: String(err), ip });
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}

// --- POST (Initiate Flow) ---
// This is a standard API endpoint and is a great fit for the handler.
export const POST = createApiHandler(
  async (_req, { body: { returnTo } }) => {
    const clientId = process.env.FACEBOOK_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/facebook`;
    
    if (!clientId) {
      console.error("FACEBOOK_APP_ID is not configured.");
      return NextResponse.json({ error: 'OAuth provider is not configured.' }, { status: 500 });
    }
    
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email,public_profile');
    
    if (returnTo) {
      authUrl.searchParams.set('state', encodeURIComponent(returnTo));
    }
    
    return NextResponse.json({ url: authUrl.toString() });
  },
  {
    limiter: 'global',
    bodySchema: oauthInitiateSchema,
  }
);