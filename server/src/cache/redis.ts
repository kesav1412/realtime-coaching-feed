import Redis from 'ioredis';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Retry strategy with exponential back-off (supports reconnect bonus)
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.warn(`[Redis] reconnect attempt #${times} in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => console.error('[Redis] error:', err));
redisClient.on('connect', () => console.log('[Redis] connection established'));
