// lib/auth/security/audit.logger.ts

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditMeta = {
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
};

export async function auditLog(action: string, actorId?: string | null, meta?: AuditMeta) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actor: actorId ? { connect: { id: actorId } } : undefined,

        // --- Use "as" to assert the type ---
        meta: meta as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error(`[AUDIT-DB-ERROR] Failed to write audit log to database for action: ${action}`, err);
    try {
      console.info(`[AUDIT-FALLBACK] ${new Date().toISOString()} | action=${action} | actor=${actorId ?? "anon"} | meta=${JSON.stringify(meta ?? {})}`);
    } catch (logError) {
      console.error("[AUDIT-FALLBACK-ERROR] Could not serialize audit metadata.", logError);
    }
  }
}