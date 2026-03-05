import { getTenantBudget, reserveBudget, isBudgetExceeded, addTenantSpend } from '../../../ops/redis/budget.client';

export async function budgetMiddleware(tenantId: string, millicents: number) {
  if (await isBudgetExceeded(tenantId)) {
    throw new Error('BudgetExceeded');
  }
  const ok = await reserveBudget(tenantId, millicents);
  if (!ok) {
    throw new Error('BudgetExceeded');
  }
}
