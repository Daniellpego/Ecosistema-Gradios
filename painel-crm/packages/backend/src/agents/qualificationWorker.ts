import { Worker, Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { saveAgentLog } from './agentLog.service';
import { getTenantBudget, isBudgetExceeded, addTenantSpend } from '../../llm/budget.middleware';
import { buildQualificationPrompt, safeJsonParse } from './promptUtils';
import { notifySales, createOpportunityIfHot } from './routingUtils';

const prisma = new PrismaClient();
const queue = new Queue('qualification', { connection: { host: process.env.REDIS_URL } });

export const worker = new Worker('qualification', async job => {
  const { leadId, tenantId, context } = job.data;
  await prisma.$executeRawUnsafe(`SELECT set_config('my.tenant', '${tenantId}', true)`);

  if (await isBudgetExceeded(tenantId)) {
    await saveAgentLog({
      tenantId,
      agentName: 'qualification',
      input: context,
      status: 'failed_budget',
      createdAt: new Date()
    });
    throw new Error('BudgetExceeded');
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  const prompt = buildQualificationPrompt(lead);
  // Chamada ao LLM (mock)
  const llmResponse = await mockLlmAdapter(prompt);
  const output = safeJsonParse(llmResponse);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      score: output.lead_score,
      leadTags: { set: [output.lead_category] },
      leadStatus: output.recommended_stage,
      rawQuizResponse: { qualification: output },
      updatedAt: new Date()
    }
  });

  await saveAgentLog({
    tenantId,
    agentName: 'qualification',
    input: context,
    output,
    status: 'completed',
    createdAt: new Date()
  });

  await addTenantSpend(tenantId, output.tokensUsed ?? 0);
  await createOpportunityIfHot(lead, output);
  await notifySales(lead, output);
}, { connection: { host: process.env.REDIS_URL } });

async function mockLlmAdapter(prompt: any) {
  // Simula resposta do LLM
  return JSON.stringify({
    lead_score: 80,
    lead_category: 'hot',
    recommended_stage: 'qualified',
    risk_flags: [],
    budget_estimate_usd: 10000
  });
}
