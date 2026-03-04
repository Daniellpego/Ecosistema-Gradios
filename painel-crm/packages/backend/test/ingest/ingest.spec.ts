/**
 * Unit tests for the Supabase lead-ingestion handler.
 *
 * We mock Prisma and enqueueAgentJob so these tests run without
 * a real database or Redis.
 */

// ─── Mocks ───────────────────────────────────────────────────
jest.mock('../../src/agents/queue', () => ({
  enqueueAgentJob: jest.fn().mockResolvedValue({ jobId: 'mock-job-1' }),
}));

const mockPrisma = {
  lead: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

import { handleLeadInsert } from '../../src/supabase/supabase-listener';
import { enqueueAgentJob } from '../../src/agents/queue';

const SAMPLE_QUIZ_ROW = {
  id: 'quiz-123',
  tenant_id: 'tenant-001',
  nome: 'João Silva',
  empresa: 'TechCorp',
  whatsapp: '(11) 99999-1234',
  email: 'joao@techcorp.com',
  segmento: 'SaaS',
  horas_perdidas: '40h/mês',
  dor_principal: 'Processos manuais e retrabalho',
  faturamento: 'R$ 500k - R$ 1M',
  maturidade: 'Intermediário',
  janela_decisao: 'Próximos 3 meses',
  lead_temperature: 'hot',
  score: 85,
  custo_mensal: 'R$ 15.000',
  diagnostico_id: 'diag-abc',
  consent: true,
};

describe('handleLeadInsert', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockPrisma.lead.findFirst.mockResolvedValue(null); // no duplicates by default
    mockPrisma.lead.create.mockResolvedValue({
      ...SAMPLE_QUIZ_ROW,
      id: 'lead-new-001',
      tenantId: 'tenant-001',
      leadStatus: 'new',
      leadTags: [],
    });
  });

  it('should create a new lead and enqueue qualification job', async () => {
    await handleLeadInsert(SAMPLE_QUIZ_ROW);

    // Lead was created
    expect(mockPrisma.lead.create).toHaveBeenCalledTimes(1);
    const createCall = mockPrisma.lead.create.mock.calls[0][0];
    expect(createCall.data.tenantId).toBe('tenant-001');
    expect(createCall.data.nome).toBe('João Silva');
    expect(createCall.data.empresa).toBe('TechCorp');
    expect(createCall.data.whatsapp).toBe('+5511999991234');
    expect(createCall.data.leadStatus).toBe('new');

    // Qualification job was enqueued
    expect(enqueueAgentJob).toHaveBeenCalledTimes(1);
    const jobCall = (enqueueAgentJob as jest.Mock).mock.calls[0][0];
    expect(jobCall.tenantId).toBe('tenant-001');
    expect(jobCall.agentName).toBe('qualification');
    expect(jobCall.action).toBe('qualify_lead');
    expect(jobCall.payload.leadId).toBe('lead-new-001');
  });

  it('should deduplicate by whatsapp and update existing lead', async () => {
    const existingLead = {
      id: 'lead-existing-001',
      tenantId: 'tenant-001',
      whatsapp: '+5511999991234',
      rawQuizResponse: { old: 'data' },
    };
    mockPrisma.lead.findFirst.mockResolvedValue(existingLead);

    await handleLeadInsert(SAMPLE_QUIZ_ROW);

    // Should NOT create a new lead
    expect(mockPrisma.lead.create).not.toHaveBeenCalled();

    // Should update the existing lead
    expect(mockPrisma.lead.update).toHaveBeenCalledTimes(1);
    const updateCall = mockPrisma.lead.update.mock.calls[0][0];
    expect(updateCall.where.id).toBe('lead-existing-001');
    expect(updateCall.data.rawQuizResponse).toHaveProperty('latest');

    // Should enqueue re-qualification
    expect(enqueueAgentJob).toHaveBeenCalledTimes(1);
    const jobCall = (enqueueAgentJob as jest.Mock).mock.calls[0][0];
    expect(jobCall.action).toBe('requalify_lead');
    expect(jobCall.payload.leadId).toBe('lead-existing-001');
  });

  it('should deduplicate by email when whatsapp is missing', async () => {
    const rowNoPhone = { ...SAMPLE_QUIZ_ROW, whatsapp: null };
    const existingLead = {
      id: 'lead-email-001',
      tenantId: 'tenant-001',
      email: 'joao@techcorp.com',
      rawQuizResponse: {},
    };

    // When whatsapp is null, normalizePhone returns null, so only ONE
    // findFirst call happens (the email lookup). Return existing on that call.
    mockPrisma.lead.findFirst.mockResolvedValueOnce(existingLead);

    await handleLeadInsert(rowNoPhone);

    expect(mockPrisma.lead.create).not.toHaveBeenCalled();
    expect(mockPrisma.lead.update).toHaveBeenCalledTimes(1);
    expect(enqueueAgentJob).toHaveBeenCalledTimes(1);
  });

  it('should use default tenant when tenant_id is missing', async () => {
    const rowNoTenant = { ...SAMPLE_QUIZ_ROW, tenant_id: undefined };
    process.env.DEFAULT_TENANT_ID = 'fallback-tenant';

    await handleLeadInsert(rowNoTenant);

    const createCall = mockPrisma.lead.create.mock.calls[0][0];
    expect(createCall.data.tenantId).toBe('fallback-tenant');

    delete process.env.DEFAULT_TENANT_ID;
  });

  it('should normalize whatsapp phone number', async () => {
    const rowBarePhone = { ...SAMPLE_QUIZ_ROW, whatsapp: '11999991234' };

    await handleLeadInsert(rowBarePhone);

    const createCall = mockPrisma.lead.create.mock.calls[0][0];
    expect(createCall.data.whatsapp).toBe('+5511999991234');
  });
});
