// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createAuditLog } from "@/lib/utils/audit";
import { ADMIN_ROLES, MEMBER_ROLES } from "@/lib/auth/roles";
import { verifyAccessToken } from "@/lib/auth/tokens/jwt.service";
import { InvalidTokenError } from "@/lib/auth/auth.errors";
import { AUTH_CONFIG } from "@/lib/auth/auth.config";

const PUBLIC_LOCALES = ["en", "de", "fr"] as const;
type PublicLocale = (typeof PUBLIC_LOCALES)[number];
const DEFAULT_PUBLIC_LOCALE: PublicLocale = "en";

const auditSample = () => Math.random() < 0.01;

const SECURITY_HEADERS: Record<string, string> = {
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const isStaticFile = (pathname: string) =>
  pathname.startsWith("/_next/") ||
  pathname.startsWith("/api/") ||
  pathname.startsWith("/favicon") ||
  /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff2?|ttf|eot)(\?.*)?$/i.test(pathname);

const getRouteType = (
  pathname: string
): "admin" | "members" | "auth" | "public" => {
  if (pathname.match(/^\/[a-z]{2}\/admin/)) return "admin";
  if (pathname.match(/^\/[a-z]{2}\/members/)) return "members";
  if (
    pathname.match(
      /^\/[a-z]{2}\/(login|register|forgot-password|reset-password|verify-email)/
    )
  )
    return "auth";
  return "public";
};

const detectLocale = (req: NextRequest): PublicLocale => {
  const cookie = req.cookies.get("locale")?.value as
    | PublicLocale
    | undefined;
  if (cookie && PUBLIC_LOCALES.includes(cookie)) return cookie;
  const header = req.headers.get("accept-language")?.split(",")[0]?.split("-")[0];
  if (header && PUBLIC_LOCALES.includes(header as PublicLocale))
    return header as PublicLocale;
  return DEFAULT_PUBLIC_LOCALE;
};

const applySecurity = (res: NextResponse): NextResponse => {
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) =>
    res.headers.set(k, v)
  );
  return res;
};

type AuthResult =
  | { success: true; userId: string; userEmail?: string; userRoles: string[] }
  | {
      success: false;
      error: "NO_TOKEN" | "SESSION_EXPIRED" | "INVALID_TOKEN";
    };

async function getAuth(req: NextRequest): Promise<AuthResult> {
  try {
    const token = req.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value;
    if (!token) return { success: false, error: "NO_TOKEN" };
    const payload = await verifyAccessToken(token);
    return {
      success: true,
      userId: payload.sub,
      userEmail: payload.email,
      userRoles: payload.roles || [],
    };
  } catch (err) {
    if (err instanceof InvalidTokenError) {
      return { success: false, error: "INVALID_TOKEN" };
    }
    return { success: false, error: "SESSION_EXPIRED" };
  }
}

async function handlePublicRoutes(
  req: NextRequest,
  requestId: string
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0] as PublicLocale;

  if (!maybeLocale || !PUBLIC_LOCALES.includes(maybeLocale)) {
    const url = new URL(req.url);
    const detectedLocale = detectLocale(req);
    url.pathname =
      pathname === "/"
        ? `/${detectedLocale}`
        : `/${detectedLocale}${pathname}`;
    url.search = req.nextUrl.search;
    return applySecurity(NextResponse.redirect(url));
  }

  const intlMiddleware = createIntlMiddleware({
    locales: PUBLIC_LOCALES,
    defaultLocale: DEFAULT_PUBLIC_LOCALE,
    localePrefix: "always",
    localeDetection: false,
  });

  const res = intlMiddleware(req);
  res.headers.set("x-request-id", requestId);
  res.headers.set("x-locale", maybeLocale);
  return applySecurity(res);
}

async function handleProtectedRoutes(
  req: NextRequest,
  requiredRoles: string[],
  requestId: string
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0] as PublicLocale;
  const locale = PUBLIC_LOCALES.includes(maybeLocale)
    ? maybeLocale
    : detectLocale(req);

  const auth = await getAuth(req);

  if (!auth.success) {
    if (auth.error === "INVALID_TOKEN" && auditSample()) {
      createAuditLog(auth.error, undefined, { path: pathname }, req);
    }
    const login = new URL(`/${locale}/login`, req.url);
    login.searchParams.set("redirect", pathname + req.nextUrl.search);
    login.searchParams.set("error", auth.error.toLowerCase());
    const res = NextResponse.redirect(login);
    res.headers.set("x-request-id", requestId);
    return applySecurity(res);
  }

  if (
    requiredRoles?.length &&
    !requiredRoles.some((r) => auth.userRoles.includes(r))
  ) {
    createAuditLog(
      "INSUFFICIENT_PERMISSIONS",
      auth.userId,
      { path: pathname },
      req
    );
    const routeType = pathname.includes("/admin") ? "admin" : "members";
    const unAuth = new URL(`/${locale}/${routeType}/unauthorized`, req.url);
    const res = NextResponse.redirect(unAuth);
    res.headers.set("x-request-id", requestId);
    return applySecurity(res);
  }

  const headers = new Headers(req.headers);
  headers.set("x-locale", locale);
  headers.set("x-user-id", auth.userId);
  if (auth.userEmail) headers.set("x-user-email", auth.userEmail);
  headers.set("x-user-roles", auth.userRoles.join(","));

  const res = NextResponse.next({ request: { headers } });
  res.headers.set("x-request-id", requestId);
  res.cookies.set("locale", locale, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return applySecurity(res);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (isStaticFile(pathname)) {
    const res = NextResponse.next();
    res.headers.set("x-request-id", requestId);
    return applySecurity(res);
  }

  const routeType = getRouteType(pathname);

  try {
    switch (routeType) {
      case "admin":
        return await handleProtectedRoutes(
          req,
          ADMIN_ROLES as unknown as string[],
          requestId
        );
      case "members":
        return await handleProtectedRoutes(
          req,
          MEMBER_ROLES as unknown as string[],
          requestId
        );
      case "auth":
      case "public":
      default:
        return await handlePublicRoutes(req, requestId);
    }
  } catch (err) {
    console.error("Middleware error:", err);
    createAuditLog(
      "MIDDLEWARE_ERROR",
      undefined,
      { error: String(err), path: pathname, routeType },
      req
    );
    const res = NextResponse.next();
    res.headers.set("x-request-id", requestId);
    return applySecurity(res);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
