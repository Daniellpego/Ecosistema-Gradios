import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../redis.client';

/**
 * LLM Budget Middleware — Redis-backed, production-safe.
 *
 * Tracks per-tenant monthly LLM spend using a Redis key with an automatic
 * monthly TTL so counters reset at the start of each billing period.
 *
 * Key schema: `budget:{tenantId}:{YYYY-MM}` → spend in **millicents** (integer).
 * Using millicents avoids floating-point drift with INCRBY (integers only).
 *
 * Exported helpers (`getTenantSpend`, `addTenantSpend`, `resetTenantSpend`)
 * keep the same interface so existing callers work unchanged.
 */

const DEFAULT_MONTHLY_BUDGET_USD = 50; // conservative default

/** Number of millicents (1/100_000 dollar) per dollar. */
const MILLICENTS_PER_USD = 100_000;

// ─── Key Helpers ───────────────────────────────────

function currentMonthTag(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function budgetKey(tenantId: string): string {
  return `budget:${tenantId}:${currentMonthTag()}`;
}

/** Seconds remaining until the 1st of next month (UTC). */
function secondsUntilNextMonth(): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return Math.max(Math.ceil((next.getTime() - now.getTime()) / 1000), 1);
}

// ─── Public API ────────────────────────────────────

/**
 * Read current spend for a tenant (in USD).
 * Returns 0 if the key does not exist (new month / no usage).
 */
export async function getTenantSpend(tenantId: string): Promise<number> {
  const redis = getRedisClient();
  const raw = await redis.get(budgetKey(tenantId));
  if (!raw) return 0;
  return parseInt(raw, 10) / MILLICENTS_PER_USD;
}

/**
 * Atomically add spend (in USD) for a tenant and return the new total (USD).
 * Sets an expiry so the key auto-resets at the start of the next month.
 */
export async function addTenantSpend(tenantId: string, amountUsd: number): Promise<number> {
  const redis = getRedisClient();
  const key = budgetKey(tenantId);
  const millicents = Math.round(amountUsd * MILLICENTS_PER_USD);

  // INCRBY is atomic — safe across multiple worker processes.
  const newTotal = await redis.incrby(key, millicents);

  // Set TTL only once (when the key is freshly created) to avoid resetting it.
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    await redis.expire(key, secondsUntilNextMonth());
  }

  return newTotal / MILLICENTS_PER_USD;
}

/**
 * Reset spend for a tenant (useful in tests or admin actions).
 */
export async function resetTenantSpend(tenantId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(budgetKey(tenantId));
}

// ─── Budget used by the worker (without HTTP context) ──────────

export function getBudgetLimitUsd(): number {
  return parseFloat(process.env.LLM_MONTHLY_BUDGET_USD ?? '') || DEFAULT_MONTHLY_BUDGET_USD;
}

/**
 * Check whether a tenant has exceeded its monthly budget.
 * Can be called from the worker without HTTP context.
 */
export async function isBudgetExceeded(tenantId: string): Promise<{ exceeded: boolean; currentSpendUsd: number; budgetUsd: number }> {
  const budgetUsd = getBudgetLimitUsd();
  const currentSpendUsd = await getTenantSpend(tenantId);
  return {
    exceeded: currentSpendUsd >= budgetUsd,
    currentSpendUsd,
    budgetUsd,
  };
}

// ─── NestJS Middleware ─────────────────────────────

@Injectable()
export class BudgetMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BudgetMiddleware.name);
  private readonly budgetUsd: number;

  constructor() {
    this.budgetUsd = getBudgetLimitUsd();
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = (req as any).tenantId as string | undefined;
    if (!tenantId) {
      return next(); // no tenant context — skip budget check
    }

    const currentSpend = await getTenantSpend(tenantId);
    if (currentSpend >= this.budgetUsd) {
      this.logger.warn(
        `Tenant ${tenantId} exceeded LLM budget: $${currentSpend.toFixed(2)} / $${this.budgetUsd}`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'LLM budget exceeded',
          message: `Monthly LLM budget of $${this.budgetUsd} has been reached. Current spend: $${currentSpend.toFixed(2)}.`,
          currentSpendUsd: +currentSpend.toFixed(4),
          budgetUsd: this.budgetUsd,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return next();
  }
}
