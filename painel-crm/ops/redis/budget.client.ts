import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = createClient({ url: REDIS_URL });
redis.connect();

export async function getTenantBudget(tenantId: string): Promise<number> {
  // Buscar budget do tenant (mock: 100000 millicents)
  return 100000;
}

export async function reserveBudget(tenantId: string, millicents: number): Promise<boolean> {
  const key = `tenant:${tenantId}:budget`;
  const ttl = 60 * 60 * 24 * 30; // 30 dias
  const used = await redis.incrBy(key, millicents);
  await redis.expire(key, ttl);
  const limit = await getTenantBudget(tenantId);
  return used <= limit;
}

export async function isBudgetExceeded(tenantId: string): Promise<boolean> {
  const key = `tenant:${tenantId}:budget`;
  const used = parseInt((await redis.get(key)) || '0', 10);
  const limit = await getTenantBudget(tenantId);
  return used > limit;
}

export async function addTenantSpend(tenantId: string, millicents: number): Promise<void> {
  const key = `tenant:${tenantId}:budget`;
  await redis.incrBy(key, millicents);
}
