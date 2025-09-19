// lib/rate-limit/consume.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getRedis } from '@/lib/redis';
import { consumeLogin } from './consume';

beforeAll(async () => await getRedis().flushdb());
afterAll(async () => await getRedis().disconnect());

describe('consumeLogin', () => {
  it('allows 5 requests then blocks', async () => {
    const key = 'test@example.com';

    // burn the bucket
    for (let i = 0; i < 5; i++) {
      const res = await consumeLogin(key);
      expect(res.allowed).toBe(true);
    }

    const res = await consumeLogin(key);
    expect(res.allowed).toBe(false);
    // ✅ narrow the union
    if (!res.allowed) {
      expect(res.retryAfterSeconds).toBeGreaterThan(0);
    }
  });
});