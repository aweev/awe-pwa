// lib/utils/audit.ts
import { NextRequest } from "next/server";
import { posthog } from "@/lib/posthog";

export type AuditDetails = Record<string, unknown> | string | null;

export interface AuditEvent {
  event: string;
  userId?: string;
  details?: AuditDetails;
  timestamp: string;
  ip?: string | null;
  userAgent?: string | null;
  requestId: string;
}

/**
 * Sanitizes details by redacting sensitive keys.
 */
function sanitizeDetails(details?: AuditDetails): AuditDetails {
  if (!details || typeof details !== "object") return details ?? null;

  const clone = { ...details } as Record<string, unknown>;
  const sensitiveKeys = ["password", "token", "secret", "authorization"];

  for (const key of sensitiveKeys) {
    if (key in clone) {
      clone[key] = "[REDACTED]";
    }
  }

  return clone;
}

/**
 * Creates an audit log event. Logs to console in development,
 * sends to PostHog in production.
 */
export function createAuditLog(
  event: string,
  userId?: string,
  details?: AuditDetails,
  request?: NextRequest
): void {
  const ip =
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request?.headers.get("x-real-ip") ||
    null;

  const userAgent = request?.headers.get("user-agent") || null;
  const requestId =
  request?.headers.get("x-request-id") || globalThis.crypto.randomUUID();

  const auditEvent: AuditEvent = {
    event,
    userId,
    details: sanitizeDetails(details),
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    requestId,
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[AUDIT] ${event}`, auditEvent);
  } else if (posthog) {
    try {
      posthog.capture({
        distinctId: userId || "anonymous",
        event,
        properties: auditEvent,
      });
    } catch (err) {
      console.error("Failed to send audit log to PostHog:", err);
    }
  }
}
