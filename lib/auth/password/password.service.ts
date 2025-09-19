import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateRandomToken, hashTokenForDb } from '../auth.utils';
import { add } from 'date-fns';

const SALT_ROUNDS = 12;

export const passwordService = {
  async hash(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },

  async createPasswordResetToken(userId: string) {
    const raw = generateRandomToken(32);
    const tokenHash = hashTokenForDb(raw);
    const expiresAt = add(new Date(), { hours: 2 });
    await prisma.passwordReset.create({
      data: { userId, tokenHash, expiresAt },
    });
    return raw;
  },

  async validatePasswordResetToken(raw: string) {
    const tokenHash = hashTokenForDb(raw);
    const rec = await prisma.passwordReset.findFirst({ where: { tokenHash } });
    if (!rec || rec.expiresAt < new Date() || rec.used) return null;
    return rec;
  },

async confirmReset(rawToken: string, newPassword: string) {
    const rec = await this.validatePasswordResetToken(rawToken);
    if (!rec) return null;

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: rec.userId },
      data: { hashedPassword: hash },
    });
    await prisma.passwordReset.update({
      where: { id: rec.id },
      data: { used: true },
    });
    return prisma.user.findUnique({ where: { id: rec.userId } });
  },
};