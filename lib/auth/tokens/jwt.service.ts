// lib/auth/tokens/jwt.service.ts
import { SignJWT, jwtVerify } from "jose";
import { AUTH_CONFIG } from "../auth.config";
import { AccessTokenPayload, RefreshTokenPayload } from "../auth.types";
import { InvalidTokenError } from "../auth.errors";

const accessSecret = new TextEncoder().encode(AUTH_CONFIG.ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(AUTH_CONFIG.REFRESH_SECRET);

/** Signs an access token. */
export async function signAccessToken(payload: Omit<AccessTokenPayload, "type">): Promise<string> {
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.ACCESS_TOKEN_EXPIRES as string)
    .sign(accessSecret);
}

/** Verifies an access token. Throws InvalidTokenError on failure. */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }
    return payload as unknown as AccessTokenPayload;
  } catch {
    throw new InvalidTokenError();
  }
}

/** Signs a refresh token. */
export async function signRefreshToken(payload: Omit<RefreshTokenPayload, "type">): Promise<string> {
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.REFRESH_TOKEN_EXPIRES as string)
    .sign(refreshSecret);
}

/** Verifies a refresh token. Throws InvalidTokenError on failure. */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return payload as unknown as RefreshTokenPayload;
  } catch {
    throw new InvalidTokenError();
  }
}