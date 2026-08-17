import { getRedis } from './redis';

export async function rateLimit(key: string, limit: number, windowSec: number) {
  const redis = getRedis();
  const n = await redis.incr(key);
  if (n === 1) {
    await redis.expire(key, windowSec);
  }
  return n <= limit;
}

export function clientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? 'unknown';
  return req.headers.get('x-real-ip') ?? 'unknown';
}
