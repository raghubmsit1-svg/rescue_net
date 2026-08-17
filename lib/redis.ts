import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

export function getRedis(): Redis {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  }
  return globalForRedis.redis;
}

export async function pingRedis(): Promise<boolean> {
  try {
    const pong = await getRedis().ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
