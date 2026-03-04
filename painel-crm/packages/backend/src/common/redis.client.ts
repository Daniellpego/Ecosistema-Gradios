/**
 * Shared Redis client singleton.
 *
 * Reused by BudgetMiddleware, queue, and any service that needs Redis.
 * Parses REDIS_URL env automatically.
 */
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let _instance: Redis | null = null;

/**
 * Return the shared Redis client (lazy singleton).
 * Prefer this over creating new connections.
 */
export function getRedisClient(): Redis {
  if (!_instance) {
    _instance = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,       // required by BullMQ when shared
      enableReadyCheck: true,
      lazyConnect: false,
    });

    _instance.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });
  }
  return _instance;
}

/**
 * Close the shared Redis connection (for graceful shutdown / tests).
 */
export async function closeRedisClient(): Promise<void> {
  if (_instance) {
    await _instance.quit();
    _instance = null;
  }
}
