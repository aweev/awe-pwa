// lib/auth/security/audit.logger.ts
import {prisma} from "@/lib/db";

/**
 * auditLog:
 * - Attempt to write an audit log to DB
 * - If DB not available or fails, fallback to console
 * - Non-blocking: swallow errors after logging
 */
type AuditMeta = {
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
};

export async function auditLog(action: string, actorId?: string | null, meta?: AuditMeta) {
  const payload = { actorId: actorId ?? null, action, meta, createdAt: new Date() };
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        meta: meta ? JSON.parse(JSON.stringify(meta)) : null,
        ip: meta?.ip ? String(meta.ip) : null,
        userAgent: meta?.userAgent ? String(meta.userAgent) : null,
      },
    });
  } catch (err) {
    // DB may be down during early dev — fall back to console
    try {
      // include timestamp for easier debugging
      console.info(`[AUDIT-FALLBACK] ${new Date().toISOString()} action=${action} actor=${actorId ?? "anon"} meta=${JSON.stringify(meta ?? {})}`);
    } catch (e) {
      // last resort - ignore
    }
  }
}


// // lib/auth/security/audit.logger.ts
// import { prisma } from "@/lib/db";
// import type { JsonValue } from "@prisma/client/runtime/library";

// type AuditMeta = {
//   ip?: string;
//   userAgent?: string;
//   [key: string]: unknown;
// };

// /**
//  * Creates an audit log entry in the database.
//  * This is a "fire-and-forget" function that does not block the main request flow
//  * and includes a fallback to the console if the database write fails.
//  * @param action - A string describing the action (e.g., 'login_success').
//  * @param actorId - The ID of the user performing the action.
//  * @param meta - Additional metadata to store with the log.
//  */
// export function auditLog(action: string, actorId?: string | null, meta?: AuditMeta): void {
//   // Use Promise.resolve().then() to make this operation non-blocking
//   Promise.resolve().then(async () => {
//     try {
//       await prisma.auditLog.create({
//         data: {
//           action,
//           actorId: actorId ?? null,
//           ip: meta?.ip ? String(meta.ip) : null,
//           userAgent: meta?.userAgent ? String(meta.userAgent) : null,
//           // Prisma expects JsonValue, so we ensure the object is compatible
//           meta: meta ? (meta as JsonValue) : undefined,
//         },
//       });
//     } catch (dbError) {
//       console.error(`[AUDIT-DB-ERROR] Failed to write audit log to database for action: ${action}`, dbError);
//       // Fallback to console logging for critical visibility
//       try {
//         console.info(`[AUDIT-FALLBACK] ${new Date().toISOString()} | action=${action} | actor=${actorId ?? "anon"} | meta=${JSON.stringify(meta ?? {})}`);
//       } catch (logError) {
//         // Last resort if JSON.stringify fails
//         console.error("[AUDIT-FALLBACK-ERROR] Could not serialize audit metadata.", logError);
//       }
//     }
//   }).catch(e => {
//     console.error("[AUDIT-PROMISE-ERROR] Unexpected error in auditLog promise chain", e);
//   });
// }