// lib/utils/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth/tokens/jwt.service';
import { AccessTokenPayload } from '@/lib/auth/auth.types';
import { consumeGlobal, consumeLogin } from '@/lib/rate-limit';
import { getLocaleFromRequest } from '@/lib/utils/request';
import { 
    AuthError, 
    InvalidCredentialsError, 
    AccountExistsError, 
    InvalidTokenError, 
    MfaRequiredError 
} from '@/lib/auth/auth.errors';
import { ADMIN_ROLES } from '@/lib/auth/roles'; 
import { Role } from '@prisma/client';

type AuthLevel = 'public' | 'authenticated' | 'admin'; // 'admin' can be used later
type LimiterType = 'global' | 'login' | 'none' | 'strict';

interface HandlerOptions<TBody, TQuery> {
  auth?: AuthLevel;
  limiter?: LimiterType;
  bodySchema?: z.ZodSchema<TBody>;
  querySchema?: z.ZodSchema<TQuery>;
   allowedRoles?: Role[];
}

type ApiHandlerContext<TBody, TQuery> = {
  params: Record<string, string | string[]>;
  session: AccessTokenPayload | null;
  body: TBody;
  query: TQuery;
};

type ApiHandler<TBody, TQuery> = (
  req: NextRequest,
  context: ApiHandlerContext<TBody, TQuery>
) => Promise<NextResponse | Response>;

// Helper to get bearer token from request
async function getSessionFromRequest(req: NextRequest): Promise<AccessTokenPayload | null> {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    
    try {
        const token = authHeader.substring(7);
        return await verifyAccessToken(token);
    } catch {
        return null;
    }
}

export function createApiHandler<TBody = unknown, TQuery = unknown>(
  handler: ApiHandler<TBody, TQuery>,
  options: HandlerOptions<TBody, TQuery> = {}
) {
  const {
    auth: authLevel = 'public',
    limiter: limiterType = 'global',
    bodySchema,
    querySchema,
    allowedRoles,
  } = options;

  return async (req: NextRequest, context: { params: Record<string, string | string[]> }) => {
    try {
      // 1. Rate Limiting (applied first)
      const ip = getLocaleFromRequest(req);
      if (limiterType !== 'none') {
        const limiter = limiterType === 'login' ? consumeLogin : consumeGlobal;
        const decision = await limiter(ip);
        if (!decision.allowed) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { "Retry-After": String(decision.retryAfterSeconds) } }
          );
        }
      }

      // 2. Authentication & Authorization
      const session = await getSessionFromRequest(req);
      if (authLevel === 'authenticated' && !session) {
        throw new InvalidTokenError("Authentication required.");
      }
      if (session) { // Only check roles if the user is logged in
        if (authLevel === 'admin') {
          // 'admin' is a shorthand for the ADMIN_ROLES array
          const hasAdminRole = ADMIN_ROLES.some(role => session.roles.includes(role));
          if (!hasAdminRole) {
            throw new AuthError("Forbidden: Administrator access required.");
          }
        } else if (allowedRoles && allowedRoles.length > 0) {
          // Check for specific roles if provided
          const hasRequiredRole = allowedRoles.some(role => session.roles.includes(role));
          if (!hasRequiredRole) {
            throw new AuthError(`Forbidden: Requires one of the following roles: ${allowedRoles.join(', ')}`);
          }
        }
      }

      // 3. Query Validation
      let query: TQuery = {} as TQuery;
      if (querySchema) {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams);
        query = querySchema.parse(searchParams);
      }

      // 4. Body Validation
      let body: TBody = {} as TBody;
      if (req.method !== 'GET' && req.method !== 'DELETE' && bodySchema) {
        const reqJson = await req.json();
        body = bodySchema.parse(reqJson);
      }

      // 5. Execute Handler
      return await handler(req, { ...context, session, body, query });

    } catch (error: unknown) {
      // 6. Centralized Error Handling
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input.', details: error.flatten() }, { status: 400 });
      }
      if (error instanceof InvalidTokenError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error instanceof InvalidCredentialsError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error instanceof AccountExistsError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      // This allows specific routes to still handle special cases like MFA
      if (error instanceof MfaRequiredError) {
        return NextResponse.json({ message: error.message, mfaRequired: true, mfaToken: error.mfaToken }, { status: 200 });
      }
      if (error instanceof AuthError) { // Catches other generic auth errors
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      console.error(`[API ERROR] ${req.method} ${req.url}:`, error);
      return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
    }
  };
}