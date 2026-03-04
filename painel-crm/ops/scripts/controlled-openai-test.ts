#!/usr/bin/env npx ts-node
/**
 * Controlled LLM Test Runner — US$10 Budget
 *
 * Executes 8 agent calls in sequence against a real OpenAI endpoint,
 * monitoring budget after each call and stopping if >= 80% spent.
 *
 * Sequence:
 *   1-3: Qualification (short, JSON response_format)
 *   4-7: Draft proposals (longer, text output)
 *     8: Final polish proposal (optionally higher-quality model)
 *
 * Prerequisites:
 *   - Backend + worker running (docker compose up)
 *   - Seed data loaded (npx prisma db seed)
 *   - Environment: LLM_PROVIDER=openai, OPENAI_API_KEY set,
 *     LLM_MONTHLY_BUDGET_USD=10, OPENAI_MODEL=gpt-4o-mini
 *
 * Usage:
 *   npx ts-node ops/scripts/controlled-openai-test.ts
 *
 * Or via API (if backend is running):
 *   The script calls the API directly via fetch.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const JWT_TOKEN = process.env.JWT_TOKEN || ''; // must be a valid admin JWT
const BUDGET_STOP_PERCENT = 80; // stop if spend >= this % of budget
const DELAY_BETWEEN_CALLS_MS = 2000; // breathing room

// ─── Test Payloads ─────────────────────────────────

interface TestCall {
  label: string;
  agentName: string;
  action: string;
  payload: Record<string, any>;
}

const TEST_CALLS: TestCall[] = [
  // ── 1-3: Qualifications ──
  {
    label: '1/8 Qualification — Petrobras Digital',
    agentName: 'qualification',
    action: 'qualify',
    payload: {
      context: `
        Empresa: Petrobras Digital
        Segmento: Oil & Gas / Digital Transformation
        Faturamento: R$ 500M/ano
        Dor: Processo manual de gestão de contratos de manutenção offshore
        Decisor: CTO, budget aprovado
        Janela: Q2 2026
        Score indicativo: 82
      `,
    },
  },
  {
    label: '2/8 Qualification — Vale Mineração',
    agentName: 'qualification',
    action: 'qualify',
    payload: {
      context: `
        Empresa: Vale Mineração Tech
        Segmento: Mining / IoT + AI
        Faturamento: R$ 200M/ano
        Dor: Monitoramento de frota e manutenção preditiva
        Decisor: VP de Operações, precisa de board approval
        Janela: H2 2026
        Score indicativo: 65
      `,
    },
  },
  {
    label: '3/8 Qualification — Startup Fintech',
    agentName: 'qualification',
    action: 'qualify',
    payload: {
      context: `
        Empresa: NovaPag Fintech
        Segmento: Financial Services / Payments
        Faturamento: R$ 15M/ano
        Dor: Landing page e funil de vendas ineficiente
        Decisor: CEO, bootstrapped
        Janela: Imediato
        Score indicativo: 40 (budget limitado)
      `,
    },
  },
  // ── 4-7: Draft Proposals ──
  {
    label: '4/8 Proposal Draft — Automação Contratos Petrobras',
    agentName: 'proposal',
    action: 'draft',
    payload: {
      opportunityId: '__FIRST_OPP__', // will be replaced dynamically
    },
  },
  {
    label: '5/8 Proposal Draft — IoT Vale',
    agentName: 'proposal',
    action: 'draft',
    payload: {
      opportunityId: '__SECOND_OPP__',
    },
  },
  {
    label: '6/8 Risk Assessment — Petrobras',
    agentName: 'risk',
    action: 'assess',
    payload: {
      opportunityId: '__FIRST_OPP__',
    },
  },
  {
    label: '7/8 Churn Analysis — ACME Account',
    agentName: 'churn',
    action: 'analyze',
    payload: {
      accountId: 'acc-t1-001',
    },
  },
  // ── 8: Final negotiation ──
  {
    label: '8/8 Negotiation Strategy — Petrobras',
    agentName: 'negotiation',
    action: 'strategize',
    payload: {
      opportunityId: '__FIRST_OPP__',
      counterpartyPosition: 'Client wants 20% discount and phased delivery over 6 months instead of 3.',
    },
  },
];

// ─── Helpers ───────────────────────────────────────

interface RunResult {
  label: string;
  jobId: string;
  status: 'success' | 'error' | 'budget_stopped';
  agentName: string;
  tokensUsed: number;
  latencyMs: number;
  model: string;
  costEstimateUsd: number;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiPost(path: string, body: any): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function apiGet(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${JWT_TOKEN}` },
  });
  return res.json();
}

/** Poll job until completed/failed, with timeout */
async function pollJob(
  jobId: string,
  maxWaitMs = 120_000,
): Promise<{ status: string; result?: any; error?: string }> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const job = await apiGet(`/agents/jobs/${jobId}`);
    if (job.status === 'completed') return { status: 'completed', result: job.result };
    if (job.status === 'failed') return { status: 'failed', error: job.error || 'Job failed' };
    await sleep(2000);
  }
  return { status: 'timeout', error: 'Job timed out' };
}

/** Get current budget usage from metrics or direct API */
async function getBudgetStatus(): Promise<{ spendUsd: number; budgetUsd: number; pct: number }> {
  try {
    const data = await apiGet('/agents/budget');
    return {
      spendUsd: data.currentSpendUsd ?? 0,
      budgetUsd: data.budgetUsd ?? 10,
      pct: ((data.currentSpendUsd ?? 0) / (data.budgetUsd ?? 10)) * 100,
    };
  } catch {
    // If budget endpoint doesn't exist yet, return safe defaults
    return { spendUsd: 0, budgetUsd: 10, pct: 0 };
  }
}

// ─── Model cost estimation (mirroring token-utils.ts) ──────────

const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

function estimateCostLocal(model: string, totalTokens: number): number {
  const p = PRICING[model] ?? PRICING['gpt-4o-mini'];
  // Approximate: assume 40% input / 60% output split
  const inp = totalTokens * 0.4;
  const out = totalTokens * 0.6;
  return (inp / 1000) * p.input + (out / 1000) * p.output;
}

// ─── Main Runner ───────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CRM BG Tech — Controlled OpenAI Test (US$10 budget)');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`API:   ${API_BASE}`);
  console.log(`Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  console.log(`Stop:  ${BUDGET_STOP_PERCENT}% of budget`);
  console.log('');

  if (!JWT_TOKEN) {
    console.error('❌ JWT_TOKEN env required. Generate one with:');
    console.error('   curl -X POST http://localhost:3001/api/auth/login \\');
    console.error('     -H "Content-Type: application/json" \\');
    console.error('     -d \'{"email":"admin@acme.com","password":"password123"}\'');
    process.exit(1);
  }

  const results: RunResult[] = [];
  const opportunityIds: string[] = [];

  for (let i = 0; i < TEST_CALLS.length; i++) {
    const call = { ...TEST_CALLS[i] };

    // ── Budget gate ──
    const budget = await getBudgetStatus();
    console.log(`\n💰 Budget: $${budget.spendUsd.toFixed(4)} / $${budget.budgetUsd} (${budget.pct.toFixed(1)}%)`);

    if (budget.pct >= BUDGET_STOP_PERCENT) {
      console.log(`🛑 Budget >= ${BUDGET_STOP_PERCENT}% — stopping safely.`);
      results.push({
        label: call.label,
        jobId: '-',
        status: 'budget_stopped',
        agentName: call.agentName,
        tokensUsed: 0,
        latencyMs: 0,
        model: '-',
        costEstimateUsd: 0,
      });
      // Mark remaining calls as stopped
      for (let j = i + 1; j < TEST_CALLS.length; j++) {
        results.push({
          label: TEST_CALLS[j].label,
          jobId: '-',
          status: 'budget_stopped',
          agentName: TEST_CALLS[j].agentName,
          tokensUsed: 0,
          latencyMs: 0,
          model: '-',
          costEstimateUsd: 0,
        });
      }
      break;
    }

    // ── Replace dynamic opportunity IDs ──
    const payload = { ...call.payload };
    if (payload.opportunityId === '__FIRST_OPP__' && opportunityIds[0]) {
      payload.opportunityId = opportunityIds[0];
    } else if (payload.opportunityId === '__SECOND_OPP__' && opportunityIds[1]) {
      payload.opportunityId = opportunityIds[1];
    } else if (payload.opportunityId?.startsWith('__') && !opportunityIds.length) {
      // Create a test opportunity for proposal/risk agents
      console.log('  📝 Creating test opportunity...');
      const opp = await apiPost('/opportunities', {
        accountId: 'acc-t1-001',
        title: `Test Opportunity ${i}`,
        description: 'Auto-created for controlled test',
        value: 500000,
        stage: 'qualified',
        probability: 60,
        source: 'inbound',
      });
      opportunityIds.push(opp.id);
      payload.opportunityId = opp.id;
    }

    // ── Enqueue agent job ──
    console.log(`\n▶ ${call.label}`);
    const startMs = Date.now();

    try {
      const { jobId } = await apiPost('/agents/run', {
        agentName: call.agentName,
        action: call.action,
        payload,
      });

      console.log(`  📋 Job: ${jobId} — polling...`);
      const result = await pollJob(jobId);

      const latencyMs = Date.now() - startMs;
      const tokensUsed = result.result?.tokensUsed ?? 0;
      const model = result.result?.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const costEstimateUsd = estimateCostLocal(model, tokensUsed);

      if (result.status === 'completed') {
        console.log(`  ✅ Done — ${tokensUsed} tokens, ${latencyMs}ms, ~$${costEstimateUsd.toFixed(4)}`);

        // Track opportunity IDs from qualification results
        if (call.agentName === 'qualification' && result.result?.output?.opportunityId) {
          opportunityIds.push(result.result.output.opportunityId);
        }

        results.push({
          label: call.label,
          jobId,
          status: 'success',
          agentName: call.agentName,
          tokensUsed,
          latencyMs,
          model,
          costEstimateUsd,
        });
      } else {
        console.log(`  ❌ ${result.status}: ${result.error}`);
        results.push({
          label: call.label,
          jobId,
          status: 'error',
          agentName: call.agentName,
          tokensUsed: 0,
          latencyMs,
          model,
          costEstimateUsd: 0,
          error: result.error,
        });
      }
    } catch (err: any) {
      console.log(`  ❌ API Error: ${err.message}`);
      results.push({
        label: call.label,
        jobId: '-',
        status: 'error',
        agentName: call.agentName,
        tokensUsed: 0,
        latencyMs: Date.now() - startMs,
        model: '-',
        costEstimateUsd: 0,
        error: err.message,
      });
    }

    await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  // ─── Report ──────────────────────────────────────

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                   COST REPORT');
  console.log('═══════════════════════════════════════════════════════');

  const totalTokens = results.reduce((s, r) => s + r.tokensUsed, 0);
  const totalCost = results.reduce((s, r) => s + r.costEstimateUsd, 0);
  const avgLatency =
    results.filter((r) => r.status === 'success').reduce((s, r) => s + r.latencyMs, 0) /
    (results.filter((r) => r.status === 'success').length || 1);

  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ #  │ Agent          │ Status  │ Tokens │ Latency │ Cost      │ Model        │');
  console.log('├─────────────────────────────────────────────────────────────────────────────┤');

  results.forEach((r, i) => {
    const num = String(i + 1).padStart(2);
    const agent = r.agentName.padEnd(14);
    const status = r.status === 'success' ? '✅' : r.status === 'budget_stopped' ? '🛑' : '❌';
    const tokens = String(r.tokensUsed).padStart(6);
    const latency = r.latencyMs ? `${(r.latencyMs / 1000).toFixed(1)}s`.padStart(7) : '    -  ';
    const cost = r.costEstimateUsd ? `$${r.costEstimateUsd.toFixed(4)}`.padStart(9) : '       - ';
    const model = (r.model || '-').padEnd(12);
    console.log(`│ ${num} │ ${agent} │ ${status}      │ ${tokens} │ ${latency} │ ${cost} │ ${model} │`);
  });

  console.log('└─────────────────────────────────────────────────────────────────────────────┘');

  console.log(`\n📊 Summary:`);
  console.log(`   Total tokens:    ${totalTokens.toLocaleString()}`);
  console.log(`   Estimated cost:  $${totalCost.toFixed(4)}`);
  console.log(`   Avg latency:     ${(avgLatency / 1000).toFixed(1)}s`);
  console.log(`   Success rate:    ${results.filter((r) => r.status === 'success').length}/${results.length}`);

  const budget = await getBudgetStatus();
  console.log(`   Redis spend:     $${budget.spendUsd.toFixed(4)} / $${budget.budgetUsd}`);

  // Cost per pipeline estimate
  const qualCalls = results.filter((r) => r.agentName === 'qualification' && r.status === 'success');
  const propCalls = results.filter((r) => r.agentName === 'proposal' && r.status === 'success');
  const avgQualCost = qualCalls.reduce((s, r) => s + r.costEstimateUsd, 0) / (qualCalls.length || 1);
  const avgPropCost = propCalls.reduce((s, r) => s + r.costEstimateUsd, 0) / (propCalls.length || 1);

  console.log(`\n💡 Cost per Pipeline (estimated):`);
  console.log(`   Qualification only: ~$${avgQualCost.toFixed(4)}`);
  console.log(`   Full pipeline (qual + proposal + risk): ~$${(avgQualCost + avgPropCost + avgQualCost * 0.8).toFixed(4)}`);
  console.log(`   At $10/month budget: ~${Math.floor(10 / (avgQualCost + avgPropCost + avgQualCost * 0.8 || 0.05))} full pipelines/month`);

  console.log('\n📝 Prompt Tuning Suggestions:');
  const slowCalls = results.filter((r) => r.latencyMs > 10_000);
  if (slowCalls.length) {
    console.log(`   ⚠ ${slowCalls.length} calls > 10s — consider reducing max_tokens or using gpt-4o-mini`);
  }
  const expensiveCalls = results.filter((r) => r.costEstimateUsd > 0.5);
  if (expensiveCalls.length) {
    console.log(`   ⚠ ${expensiveCalls.length} calls > $0.50 — review prompt length or switch to cheaper model`);
  }
  if (!slowCalls.length && !expensiveCalls.length) {
    console.log('   ✅ All calls within acceptable latency and cost ranges.');
  }

  console.log('\n═══════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
