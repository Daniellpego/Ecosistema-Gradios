import type {
  Account,
  Opportunity,
  Project,
  SLA,
  Proposal,
  KpiData,
  PipelineData,
  RevenueData,
  Contract,
  AgentLog,
  Lead,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('crm_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ── Auth ────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await request<{ accessToken: string; user: { id: string; name: string; email: string; role: string } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );
  return { token: res.accessToken, user: res.user };
}

// ── Accounts ────────────────────────────────────────────
export async function getAccounts() {
  const raw = await request<Account[] | { data: Account[] }>('/accounts');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return { data: list as Account[] };
}

export async function getAccount(id: string) {
  return request<Account>(`/accounts/${id}`);
}

// ── Opportunities ───────────────────────────────────────
export async function getOpportunities() {
  const raw = await request<Opportunity[] | { data: Opportunity[] }>('/opportunities');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return {
    data: list.map((o: any) => ({
      ...o,
      created_at: o.created_at || o.createdAt,
      updated_at: o.updated_at || o.updatedAt,
      account_name: o.account_name || o.account?.name,
    })) as Opportunity[],
  };
}

export async function getOpportunity(id: string) {
  return request<Opportunity>(`/opportunities/${id}`);
}

// ── Projects ────────────────────────────────────────────
export async function getProjects() {
  const raw = await request<Project[] | { data: Project[] }>('/projects');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return { data: list as Project[] };
}

export async function getProject(id: string) {
  return request<Project>(`/projects/${id}`);
}

// ── SLAs ────────────────────────────────────────────────
export async function getSlas() {
  const raw = await request<SLA[] | { data: SLA[] }>('/sla');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return {
    data: list.map((s: any) => ({
      ...s,
      renewal_date: s.renewal_date || s.renewAt,
      is_active: s.is_active ?? (s.status === 'active'),
      account_name: s.account_name || s.account?.name,
      monthly_value: s.monthly_value ?? (s.metrics as any)?.monthlyPrice ?? 0,
      created_at: s.created_at || s.createdAt,
      updated_at: s.updated_at || s.updatedAt,
    })) as SLA[],
  };
}

export async function getSla(id: string) {
  return request<SLA>(`/sla/${id}`);
}

// ── Proposals ───────────────────────────────────────────
export async function getProposals() {
  const raw = await request<Proposal[] | { data: Proposal[] }>('/proposals');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return { data: list as Proposal[] };
}

export async function getProposal(id: string) {
  return request<Proposal>(`/proposals/${id}`);
}

export async function updateProposal(id: string, data: Partial<Proposal>) {
  return request<Proposal>(`/proposals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ── Contracts ───────────────────────────────────────────
export async function getContracts() {
  const raw = await request<Contract[] | { data: Contract[] }>('/contracts');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return { data: list as Contract[] };
}

export async function getContract(id: string) {
  return request<Contract>(`/contracts/${id}`);
}

// ── KPIs / Dashboard ────────────────────────────────────
export async function getKpis() {
  return request<KpiData>('/kpis');
}

export async function getPipeline() {
  return request<{ data: PipelineData[] }>('/kpis/pipeline');
}

export async function getRevenue() {
  return request<{ data: RevenueData[] }>('/kpis/revenue');
}

// ── Agents ──────────────────────────────────────────────
export async function runAgent(agentType: string, params: Record<string, unknown>) {
  return request<AgentLog>('/agents/run', {
    method: 'POST',
    body: JSON.stringify({ agent_type: agentType, params }),
  });
}

// ── Leads ───────────────────────────────────────────────
export async function getLeads() {
  const raw = await request<Lead[] | { data: Lead[] }>('/leads');
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  return { data: list as Lead[] };
}

export async function getLead(id: string) {
  return request<Lead>(`/leads/${id}`);
}

export async function runLeadToProposal(opportunityId: string) {
  return request<{ opportunity: Opportunity; proposal: Proposal; logs: AgentLog[] }>(
    '/agents/lead-to-proposal',
    {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId }),
    }
  );
}
