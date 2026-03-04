/**
 * Tests for Redis-backed BudgetMiddleware + helper functions.
 *
 * Uses ioredis manual mock — we mock '../redis.client' to return a fake
 * Redis-like object backed by a simple Map, avoiding a real Redis connection.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// ─── In-memory Redis mock ──────────────────────────

const store = new Map<string, string>();
const ttls = new Map<string, number>();

const redisMock = {
  get: jest.fn(async (key: string) => store.get(key) ?? null),
  incrby: jest.fn(async (key: string, amount: number) => {
    const current = parseInt(store.get(key) ?? '0', 10);
    const next = current + amount;
    store.set(key, String(next));
    return next;
  }),
  ttl: jest.fn(async (key: string) => ttls.get(key) ?? -1),
  expire: jest.fn(async (key: string, seconds: number) => {
    ttls.set(key, seconds);
    return 1;
  }),
  del: jest.fn(async (key: string) => {
    store.delete(key);
    ttls.delete(key);
    return 1;
  }),
};

jest.mock('./redis.client', () => ({
  getRedisClient: () => redisMock,
  closeRedisClient: jest.fn(),
}));

import {
  getTenantSpend,
  addTenantSpend,
  resetTenantSpend,
  isBudgetExceeded,
  getBudgetLimitUsd,
  BudgetMiddleware,
} from './middleware/budget.middleware';

// ─── Test Setup ────────────────────────────────────

beforeEach(() => {
  store.clear();
  ttls.clear();
  jest.clearAllMocks();
  delete process.env.LLM_MONTHLY_BUDGET_USD;
});

// ─── Unit: helper functions ────────────────────────

describe('getTenantSpend', () => {
  it('returns 0 for a new tenant (no key)', async () => {
    const spend = await getTenantSpend('tenant-new');
    expect(spend).toBe(0);
  });

  it('reads spend from Redis (millicents → USD conversion)', async () => {
    store.set(expect.any(String), '500000'); // 500_000 millicents = $5
    // Set key manually matching the expected format
    const key = `budget:tenant-001:${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`;
    store.set(key, '500000');

    const spend = await getTenantSpend('tenant-001');
    expect(spend).toBe(5);
  });
});

describe('addTenantSpend', () => {
  it('atomically increments spend and returns new total in USD', async () => {
    const total1 = await addTenantSpend('tenant-001', 1.5); // $1.50
    expect(total1).toBe(1.5);

    const total2 = await addTenantSpend('tenant-001', 2.0);
    expect(total2).toBe(3.5);
  });

  it('sets TTL on first increment', async () => {
    await addTenantSpend('tenant-002', 0.5);
    expect(redisMock.expire).toHaveBeenCalledTimes(1);
    const ttlArg = redisMock.expire.mock.calls[0][1];
    expect(ttlArg).toBeGreaterThan(0);
    expect(ttlArg).toBeLessThanOrEqual(31 * 24 * 60 * 60); // max ~31 days
  });

  it('does NOT reset TTL on subsequent increments', async () => {
    await addTenantSpend('tenant-003', 1);
    ttls.set(
      `budget:tenant-003:${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`,
      86400,
    );

    await addTenantSpend('tenant-003', 2);
    // expire called once for first call (ttl was -1), not for second (ttl > 0)
    expect(redisMock.expire).toHaveBeenCalledTimes(1);
  });
});

describe('resetTenantSpend', () => {
  it('deletes the budget key', async () => {
    await addTenantSpend('tenant-004', 10);
    await resetTenantSpend('tenant-004');
    const spend = await getTenantSpend('tenant-004');
    expect(spend).toBe(0);
  });
});

describe('isBudgetExceeded', () => {
  it('returns exceeded=false when spend is under budget', async () => {
    await addTenantSpend('tenant-005', 10);
    const result = await isBudgetExceeded('tenant-005');
    expect(result.exceeded).toBe(false);
    expect(result.currentSpendUsd).toBe(10);
    expect(result.budgetUsd).toBe(50); // default
  });

  it('returns exceeded=true when spend equals budget', async () => {
    await addTenantSpend('tenant-006', 50);
    const result = await isBudgetExceeded('tenant-006');
    expect(result.exceeded).toBe(true);
  });

  it('returns exceeded=true when spend exceeds budget', async () => {
    await addTenantSpend('tenant-007', 75);
    const result = await isBudgetExceeded('tenant-007');
    expect(result.exceeded).toBe(true);
  });

  it('respects LLM_MONTHLY_BUDGET_USD env', async () => {
    process.env.LLM_MONTHLY_BUDGET_USD = '20';
    await addTenantSpend('tenant-008', 25);
    const result = await isBudgetExceeded('tenant-008');
    expect(result.exceeded).toBe(true);
    expect(result.budgetUsd).toBe(20);
  });
});

describe('getBudgetLimitUsd', () => {
  it('returns default (50) when env not set', () => {
    expect(getBudgetLimitUsd()).toBe(50);
  });

  it('reads from env', () => {
    process.env.LLM_MONTHLY_BUDGET_USD = '100';
    expect(getBudgetLimitUsd()).toBe(100);
  });
});

// ─── Integration: BudgetMiddleware (NestJS middleware) ──────────

describe('BudgetMiddleware', () => {
  let middleware: BudgetMiddleware;

  beforeEach(() => {
    delete process.env.LLM_MONTHLY_BUDGET_USD;
    middleware = new BudgetMiddleware();
  });

  it('calls next() when no tenantId on request', async () => {
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when spend is under budget', async () => {
    await addTenantSpend('tenant-mw-ok', 10);
    const req = { tenantId: 'tenant-mw-ok' } as any;
    const res = {} as any;
    const next = jest.fn();

    await middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws 402 when budget exceeded', async () => {
    await addTenantSpend('tenant-mw-over', 60);
    const req = { tenantId: 'tenant-mw-over' } as any;
    const res = {} as any;
    const next = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});
