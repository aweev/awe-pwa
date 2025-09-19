// lib/auth/sessions/session.service.ts
import { prisma } from "@/lib/db";
import { add } from "date-fns";
import { AUTH_CONFIG } from "../auth.config";
import type { UserSession } from "@prisma/client";
import crypto from "crypto";

export const sessionService = {
  /**
   * Creates a new session for a user.
   */
  async create(userId: string, ipAddress?: string, userAgent?: string): Promise<UserSession> {
    const expiresIn = AUTH_CONFIG.REFRESH_TOKEN_EXPIRES;
    let expiresAt: Date;

    // Handle different expiration formats (e.g., "30d", 2592000)
    if (typeof expiresIn === "string" && expiresIn.endsWith("d")) {
      expiresAt = add(new Date(), { days: parseInt(expiresIn) });
    } else {
      expiresAt = add(new Date(), { seconds: Number(expiresIn) || 2592000 }); // Default 30 days
    }

    // Generate secure random token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    return prisma.userSession.create({
      data: {
        sessionToken, // ✅ required field
        userId,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  },

  async getById(sessionId: string): Promise<UserSession | null> {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await this.delete(sessionId);
      return null;
    }

    return session;
  },

  async delete(sessionId: string): Promise<UserSession | null> {
    try {
      return await prisma.userSession.delete({ where: { id: sessionId } });
    } catch {
      return null;
    }
  },
};
