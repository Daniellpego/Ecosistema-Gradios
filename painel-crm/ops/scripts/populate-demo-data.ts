/**
 * populate-demo-data.ts
 * 
 * Populates the CRM database with realistic demo data for the dashboard:
 * - 8 accounts across varied industries
 * - 20 opportunities (some closed_won spread across months for revenue chart)
 * - 6 projects (active + completed with margins)
 * - 6 SLAs (active with monthly values for MRR)
 * - 30 leads with varied scores
 * - 15 agent logs
 * 
 * Uses Prisma directly — no API calls needed.
 * Safe to run multiple times (uses upsert where possible).
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const TENANT_ID = 'tenant-001'; // ACME Corp (matches seed)

// ── Helper ──────────────────────────────────────────────
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

// ── Accounts ────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  { id: 'demo-acc-001', name: 'Magazine Luiza Tech', industry: 'Retail', size: 'Enterprise', annualRevenue: 12000000 },
  { id: 'demo-acc-002', name: 'Ambev Smart Factory', industry: 'Manufacturing', size: 'Enterprise', annualRevenue: 8500000 },
  { id: 'demo-acc-003', name: 'Stone Pagamentos', industry: 'FinTech', size: 'Mid-Market', annualRevenue: 3200000 },
  { id: 'demo-acc-004', name: 'Embraer Digital', industry: 'Aerospace', size: 'Enterprise', annualRevenue: 25000000 },
  { id: 'demo-acc-005', name: 'Sicredi Cooperativa', industry: 'Banking', size: 'Mid-Market', annualRevenue: 4500000 },
  { id: 'demo-acc-006', name: 'TOTVS Cloud', industry: 'SaaS', size: 'Enterprise', annualRevenue: 9800000 },
  { id: 'demo-acc-007', name: 'Natura &Co', industry: 'Consumer Goods', size: 'Enterprise', annualRevenue: 18000000 },
  { id: 'demo-acc-008', name: 'Movile Delivery', industry: 'Logistics', size: 'SMB', annualRevenue: 1200000 },
];

// ── Opportunities ───────────────────────────────────────
const DEMO_OPPORTUNITIES = [
  // closed_won spread across last 12 months (these drive pipeline velocity + revenue chart)
  { id: 'demo-opp-cw01', accountIdx: 0, title: 'Magalu - Plataforma IoT Estoque', value: 750000, stage: 'closed_won', probability: 100, source: 'inbound', createdOffset: 180, closedOffset: 150 },
  { id: 'demo-opp-cw02', accountIdx: 1, title: 'Ambev - SCADA Cloud Migration', value: 1200000, stage: 'closed_won', probability: 100, source: 'outbound', createdOffset: 150, closedOffset: 90 },
  { id: 'demo-opp-cw03', accountIdx: 3, title: 'Embraer - Digital Twin MVP', value: 2500000, stage: 'closed_won', probability: 100, source: 'referral', createdOffset: 120, closedOffset: 60 },
  { id: 'demo-opp-cw04', accountIdx: 5, title: 'TOTVS - AI Chatbot Integration', value: 480000, stage: 'closed_won', probability: 100, source: 'inbound', createdOffset: 90, closedOffset: 45 },
  { id: 'demo-opp-cw05', accountIdx: 6, title: 'Natura - Supply Chain Visibility', value: 890000, stage: 'closed_won', probability: 100, source: 'outbound', createdOffset: 60, closedOffset: 20 },
  { id: 'demo-opp-cw06', accountIdx: 2, title: 'Stone - Anti-fraud ML Pipeline', value: 650000, stage: 'closed_won', probability: 100, source: 'inbound', createdOffset: 45, closedOffset: 10 },
  { id: 'demo-opp-cw07', accountIdx: 4, title: 'Sicredi - Core Banking API', value: 380000, stage: 'closed_won', probability: 100, source: 'partner', createdOffset: 30, closedOffset: 5 },

  // Active pipeline
  { id: 'demo-opp-neg01', accountIdx: 0, title: 'Magalu - Automação Warehouse 2.0', value: 920000, stage: 'negotiation', probability: 75, source: 'inbound', createdOffset: 25, closedOffset: 0 },
  { id: 'demo-opp-neg02', accountIdx: 3, title: 'Embraer - Predictive Maintenance', value: 1800000, stage: 'negotiation', probability: 60, source: 'outbound', createdOffset: 20, closedOffset: 0 },
  { id: 'demo-opp-prop01', accountIdx: 1, title: 'Ambev - Quality Vision AI', value: 580000, stage: 'proposal', probability: 50, source: 'referral', createdOffset: 18, closedOffset: 0 },
  { id: 'demo-opp-prop02', accountIdx: 6, title: 'Natura - Personalization Engine', value: 720000, stage: 'proposal', probability: 45, source: 'partner', createdOffset: 14, closedOffset: 0 },
  { id: 'demo-opp-prop03', accountIdx: 7, title: 'Movile - Route Optimization ML', value: 340000, stage: 'proposal', probability: 40, source: 'inbound', createdOffset: 10, closedOffset: 0 },
  { id: 'demo-opp-qual01', accountIdx: 2, title: 'Stone - Real-time Dashboard', value: 280000, stage: 'qualified', probability: 30, source: 'inbound', createdOffset: 8, closedOffset: 0 },
  { id: 'demo-opp-qual02', accountIdx: 5, title: 'TOTVS - ERP Data Lake', value: 450000, stage: 'qualified', probability: 35, source: 'outbound', createdOffset: 5, closedOffset: 0 },
  { id: 'demo-opp-lead01', accountIdx: 4, title: 'Sicredi - Open Finance Module', value: 390000, stage: 'lead', probability: 15, source: 'inbound', createdOffset: 3, closedOffset: 0 },
  { id: 'demo-opp-lead02', accountIdx: 7, title: 'Movile - Fleet Telemetry SaaS', value: 220000, stage: 'lead', probability: 10, source: 'referral', createdOffset: 2, closedOffset: 0 },

  // closed_lost (for churn and win-rate)
  { id: 'demo-opp-cl01', accountIdx: 7, title: 'Movile - Cancelled POC', value: 150000, stage: 'closed_lost', probability: 0, source: 'inbound', createdOffset: 100, closedOffset: 80 },
  { id: 'demo-opp-cl02', accountIdx: 4, title: 'Sicredi - Budget Cut Project', value: 280000, stage: 'closed_lost', probability: 0, source: 'outbound', createdOffset: 70, closedOffset: 50 },
];

// ── Projects ────────────────────────────────────────────
const DEMO_PROJECTS = [
  { id: 'demo-proj-001', accountIdx: 0, name: 'Magalu IoT Fase 1', status: 'active', budgetHours: 800, actualHours: 520, marginEst: 35, marginReal: 32, startOffset: 150, endOffset: -30 },
  { id: 'demo-proj-002', accountIdx: 1, name: 'Ambev SCADA Migration', status: 'active', budgetHours: 1500, actualHours: 890, marginEst: 40, marginReal: 38, startOffset: 90, endOffset: -60 },
  { id: 'demo-proj-003', accountIdx: 3, name: 'Embraer Digital Twin', status: 'active', budgetHours: 2000, actualHours: 1200, marginEst: 45, marginReal: 42, startOffset: 60, endOffset: -90 },
  { id: 'demo-proj-004', accountIdx: 5, name: 'TOTVS AI Chatbot', status: 'completed', budgetHours: 400, actualHours: 380, marginEst: 30, marginReal: 33, startOffset: 120, endOffset: 30 },
  { id: 'demo-proj-005', accountIdx: 6, name: 'Natura Supply Chain v1', status: 'completed', budgetHours: 600, actualHours: 650, marginEst: 35, marginReal: 28, startOffset: 100, endOffset: 20 },
  { id: 'demo-proj-006', accountIdx: 2, name: 'Stone Anti-fraud Pipeline', status: 'active', budgetHours: 500, actualHours: 180, marginEst: 38, marginReal: null, startOffset: 45, endOffset: -45 },
];

// ── SLAs ────────────────────────────────────────────────
const DEMO_SLAS = [
  { id: 'demo-sla-001', accountIdx: 0, desc: 'Magalu — Gold SLA (24/7 support)', tier: 1, monthlyPrice: 25000, renewOffset: 180 },
  { id: 'demo-sla-002', accountIdx: 1, desc: 'Ambev — Gold SLA (24/7 industrial)', tier: 1, monthlyPrice: 35000, renewOffset: 120 },
  { id: 'demo-sla-003', accountIdx: 3, desc: 'Embraer — Platinum SLA (dedicated team)', tier: 1, monthlyPrice: 55000, renewOffset: 270 },
  { id: 'demo-sla-004', accountIdx: 2, desc: 'Stone — Silver SLA (business hours)', tier: 2, monthlyPrice: 15000, renewOffset: 90 },
  { id: 'demo-sla-005', accountIdx: 5, desc: 'TOTVS — Silver SLA (8x5 support)', tier: 2, monthlyPrice: 18000, renewOffset: 150 },
  { id: 'demo-sla-006', accountIdx: 6, desc: 'Natura — Gold SLA (priority support)', tier: 1, monthlyPrice: 22000, renewOffset: 60 },
];

// ── Leads ───────────────────────────────────────────────
const SEGMENTS = ['Industrial', 'FinTech', 'SaaS', 'Varejo', 'Logística', 'Saúde'];
const FATURAMENTOS = ['R$ 500K', 'R$ 1M', 'R$ 2M+', 'R$ 5M+', 'R$ 10M+'];
const DORES = [
  'Falta de visibilidade em tempo real',
  'Processos manuais e falhas em SCADA',
  'Alto custo de suporte reativo',
  'Demora na tomada de decisão',
  'Perda de oportunidades por falta de qualificação',
  'Downtime frequente em equipamentos críticos',
];

function generateLeads(count: number) {
  const leads = [];
  for (let i = 1; i <= count; i++) {
    const score = Math.floor(Math.random() * 100);
    const temp = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
    const status = score >= 80 ? 'qualified' : score >= 50 ? 'nurture' : 'new';
    leads.push({
      id: `demo-lead-${String(i).padStart(3, '0')}`,
      tenantId: TENANT_ID,
      nome: `Lead Demo ${i}`,
      empresa: `Empresa Demo ${i % 12 + 1}`,
      email: `lead${i}@demo.com`,
      whatsapp: `+55119${String(90000000 + i)}`,
      segmento: SEGMENTS[i % SEGMENTS.length],
      horasPerdidas: `${20 + (i % 50) * 3}h/mês`,
      dorPrincipal: DORES[i % DORES.length],
      faturamento: FATURAMENTOS[i % FATURAMENTOS.length],
      maturidade: ['low', 'medium', 'high'][i % 3],
      janelaDecisao: ['Q1-2026', 'Q2-2026', 'Q3-2026'][i % 3],
      leadTemperature: temp,
      score,
      custoMensal: `R$ ${(i % 8 + 1) * 1000}`,
      leadStatus: status,
      consent: true,
      createdAt: daysAgo(Math.floor(Math.random() * 60)),
    });
  }
  return leads;
}

// ── Agent Logs ──────────────────────────────────────────
const AGENT_NAMES = ['qualification', 'proposal', 'risk', 'churn', 'negotiation'];

function generateAgentLogs(count: number, oppIds: string[], leadIds: string[]) {
  const logs = [];
  for (let i = 0; i < count; i++) {
    const agentName = AGENT_NAMES[i % AGENT_NAMES.length];
    logs.push({
      id: `demo-alog-${String(i + 1).padStart(3, '0')}`,
      tenantId: TENANT_ID,
      opportunityId: oppIds[i % oppIds.length] || null,
      leadId: i < 10 ? leadIds[i % leadIds.length] : null,
      agentName,
      action: `${agentName}_analysis`,
      input: { demo: true, iteration: i },
      output: { summary: `Demo ${agentName} result for item ${i + 1}`, score: Math.floor(Math.random() * 100) },
      tokensUsed: 300 + Math.floor(Math.random() * 1200),
      latencyMs: 2000 + Math.floor(Math.random() * 15000),
      status: 'success',
      model: 'gpt-4o-mini',
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    });
  }
  return logs;
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('🚀 Populating demo data...\n');

  // 1. Accounts
  console.log('📦 Creating 8 demo accounts...');
  for (const acc of DEMO_ACCOUNTS) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: { annualRevenue: acc.annualRevenue },
      create: {
        id: acc.id,
        tenantId: TENANT_ID,
        name: acc.name,
        industry: acc.industry,
        size: acc.size,
        annualRevenue: acc.annualRevenue,
      },
    });
  }
  console.log('  ✅ 8 accounts ready\n');

  // 2. Opportunities
  console.log('🎯 Creating 18 demo opportunities (7 closed_won, 9 active, 2 lost)...');
  for (const opp of DEMO_OPPORTUNITIES) {
    const acc = DEMO_ACCOUNTS[opp.accountIdx];
    const created = daysAgo(opp.createdOffset);
    const updated = opp.closedOffset > 0 ? daysAgo(opp.closedOffset) : new Date();
    await prisma.opportunity.upsert({
      where: { id: opp.id },
      update: { stage: opp.stage, value: opp.value, updatedAt: updated },
      create: {
        id: opp.id,
        tenantId: TENANT_ID,
        accountId: acc.id,
        title: opp.title,
        value: opp.value,
        stage: opp.stage,
        probability: opp.probability,
        source: opp.source,
        createdAt: created,
        updatedAt: updated,
      },
    });
  }
  console.log('  ✅ 18 opportunities ready\n');

  // 3. Projects
  console.log('📁 Creating 6 demo projects (3 active, 2 completed, 1 active early)...');
  for (const proj of DEMO_PROJECTS) {
    const acc = DEMO_ACCOUNTS[proj.accountIdx];
    await prisma.project.upsert({
      where: { id: proj.id },
      update: { actualHours: proj.actualHours, marginReal: proj.marginReal, status: proj.status },
      create: {
        id: proj.id,
        tenantId: TENANT_ID,
        accountId: acc.id,
        name: proj.name,
        status: proj.status,
        startDate: daysAgo(proj.startOffset),
        endDate: proj.endOffset > 0 ? daysAgo(proj.endOffset) : null,
        budgetHours: proj.budgetHours,
        actualHours: proj.actualHours,
        marginEst: proj.marginEst,
        marginReal: proj.marginReal,
      },
    });
  }
  console.log('  ✅ 6 projects ready\n');

  // 4. SLAs
  console.log('📋 Creating 6 demo SLAs...');
  for (const sla of DEMO_SLAS) {
    const acc = DEMO_ACCOUNTS[sla.accountIdx];
    const renewAt = new Date();
    renewAt.setDate(renewAt.getDate() + sla.renewOffset);
    await prisma.sLA.upsert({
      where: { id: sla.id },
      update: { metrics: { monthlyPrice: sla.monthlyPrice, uptimePercent: 99.9, responseTimeHours: sla.tier === 1 ? 1 : 4, supportWindow: sla.tier === 1 ? '24/7' : 'business_hours' } },
      create: {
        id: sla.id,
        tenantId: TENANT_ID,
        accountId: acc.id,
        description: sla.desc,
        tier: sla.tier,
        metrics: { monthlyPrice: sla.monthlyPrice, uptimePercent: 99.9, responseTimeHours: sla.tier === 1 ? 1 : 4, supportWindow: sla.tier === 1 ? '24/7' : 'business_hours' },
        startDate: daysAgo(365),
        renewAt,
        status: 'active',
      },
    });
  }
  console.log('  ✅ 6 SLAs ready\n');

  // 5. Leads
  console.log('👥 Creating 30 demo leads...');
  const leads = generateLeads(30);
  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: lead.id },
      update: { score: lead.score, leadStatus: lead.leadStatus },
      create: lead,
    });
  }
  console.log('  ✅ 30 leads ready\n');

  // 6. Agent Logs
  console.log('🤖 Creating 15 demo agent logs...');
  const oppIds = DEMO_OPPORTUNITIES.map((o) => o.id);
  const leadIds = leads.map((l) => l.id);
  const agentLogs = generateAgentLogs(15, oppIds, leadIds);
  for (const log of agentLogs) {
    await prisma.agentLog.upsert({
      where: { id: log.id },
      update: {},
      create: log,
    });
  }
  console.log('  ✅ 15 agent logs ready\n');

  // 7. Verify — fetch KPIs
  console.log('📊 Fetching KPIs to verify...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOpps,
    closedWonCount,
    activePipeline,
    activeProjectCount,
    activeSlas,
    totalLeads,
  ] = await Promise.all([
    prisma.opportunity.count({ where: { tenantId: TENANT_ID } }),
    prisma.opportunity.count({ where: { tenantId: TENANT_ID, stage: 'closed_won' } }),
    prisma.opportunity.aggregate({
      where: { tenantId: TENANT_ID, stage: { notIn: ['closed_won', 'closed_lost'] } },
      _sum: { value: true },
      _count: { id: true },
    }),
    prisma.project.count({ where: { tenantId: TENANT_ID, status: { in: ['active', 'planning'] } } }),
    prisma.sLA.findMany({ where: { tenantId: TENANT_ID, status: 'active' }, select: { metrics: true } }),
    prisma.lead.count({ where: { tenantId: TENANT_ID } }),
  ]);

  const mrr = activeSlas.reduce((sum, sla) => {
    const m = sla.metrics as any;
    return sum + (m?.monthlyPrice ?? 0);
  }, 0);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_opportunities: totalOpps,
      closed_won: closedWonCount,
      active_pipeline_count: activePipeline._count.id,
      active_pipeline_value: activePipeline._sum.value,
      win_rate: `${((closedWonCount / totalOpps) * 100).toFixed(1)}%`,
      active_projects: activeProjectCount,
      mrr,
      total_leads: totalLeads,
    },
  };

  console.log('\n📈 KPI Report:');
  console.log(JSON.stringify(report.summary, null, 2));

  // Save report
  const reportPath = path.join(__dirname, '../../ops/reports/demo-kpis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: ${reportPath}`);

  console.log('\n✅ Demo data population complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
