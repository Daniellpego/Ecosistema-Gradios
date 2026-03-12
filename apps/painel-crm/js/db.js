/* ============================================
   BG Tech CRM — Database Operations (Supabase)
   ============================================ */

import { getSupabase } from './auth.js';

/* --- helpers --- */
function sb() {
  return getSupabase();
}

/* ═══════════════════════════════════════════
   LEADS
   ═══════════════════════════════════════════ */

/**
 * Fetch all leads, ordered by created_at desc.
 * Supports optional filters: { status, origem, search }.
 */
export async function fetchLeads(filters = {}) {
  const client = sb();
  if (!client) return [];

  let query = client.from('leads').select('*').order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status);
  }

  if (filters.origem && filters.origem !== 'todas') {
    query = query.eq('origem', filters.origem);
  }

  if (filters.search) {
    query = query.or(
      `nome.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error('[db] fetchLeads error:', error);
    return [];
  }
  return data || [];
}

/**
 * Insert or update a lead. If `lead.id` is provided, it updates.
 */
export async function upsertLead(lead) {
  const client = sb();
  if (!client) return { data: null, error: { message: 'Supabase não configurado' } };

  const { data, error } = await client
    .from('leads')
    .upsert(lead, { onConflict: 'id' })
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a lead by id.
 */
export async function deleteLead(id) {
  const client = sb();
  if (!client) return { error: { message: 'Supabase não configurado' } };

  const { error } = await client.from('leads').delete().eq('id', id);
  return { error };
}

/* ═══════════════════════════════════════════
   DEALS
   ═══════════════════════════════════════════ */

/**
 * Fetch all deals, ordered by created_at desc.
 * Supports optional filters: { status, search }.
 */
export async function fetchDeals(filters = {}) {
  const client = sb();
  if (!client) return [];

  let query = client.from('deals').select('*, leads(nome, empresa)').order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`titulo.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[db] fetchDeals error:', error);
    return [];
  }
  return data || [];
}

/**
 * Insert or update a deal.
 */
export async function upsertDeal(deal) {
  const client = sb();
  if (!client) return { data: null, error: { message: 'Supabase não configurado' } };

  const { data, error } = await client
    .from('deals')
    .upsert(deal, { onConflict: 'id' })
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a deal by id.
 */
export async function deleteDeal(id) {
  const client = sb();
  if (!client) return { error: { message: 'Supabase não configurado' } };

  const { error } = await client.from('deals').delete().eq('id', id);
  return { error };
}

/* ═══════════════════════════════════════════
   PIPELINE STATS (aggregation)
   ═══════════════════════════════════════════ */

/**
 * Fetch aggregate stats for the pipeline view.
 * Returns: { totalLeads, totalValue, byStatus, conversionRate }
 */
export async function fetchPipelineStats() {
  const client = sb();
  if (!client) return { totalLeads: 0, totalValue: 0, byStatus: {}, conversionRate: 0 };

  const { data: leads, error } = await client.from('leads').select('status, valor_estimado');
  if (error) {
    console.error('[db] fetchPipelineStats error:', error);
    return { totalLeads: 0, totalValue: 0, byStatus: {}, conversionRate: 0 };
  }

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (Number(l.valor_estimado) || 0), 0);

  const byStatus = {};
  for (const lead of leads) {
    const s = lead.status || 'novo';
    if (!byStatus[s]) byStatus[s] = { count: 0, value: 0 };
    byStatus[s].count++;
    byStatus[s].value += Number(lead.valor_estimado) || 0;
  }

  const fechados = byStatus['fechado']?.count || 0;
  const conversionRate = totalLeads > 0 ? ((fechados / totalLeads) * 100) : 0;

  return { totalLeads, totalValue, byStatus, conversionRate };
}

/* ═══════════════════════════════════════════
   ANALYTICS QUERIES
   ═══════════════════════════════════════════ */

/**
 * Fetch analytics data — leads by origin, monthly deal revenue, win rate.
 */
export async function fetchAnalytics() {
  const client = sb();
  if (!client) return { leadsByOrigin: {}, monthlyRevenue: [], winRate: 0, totalDeals: 0, wonDeals: 0, lostDeals: 0 };

  // Leads by origin
  const { data: leads } = await client.from('leads').select('origem, status, valor_estimado, created_at');
  const leadsByOrigin = {};
  for (const l of (leads || [])) {
    const o = l.origem || 'Desconhecida';
    leadsByOrigin[o] = (leadsByOrigin[o] || 0) + 1;
  }

  // Deals stats
  const { data: deals } = await client.from('deals').select('status, valor, created_at, closed_at');
  const totalDeals = (deals || []).length;
  const wonDeals = (deals || []).filter(d => d.status === 'ganho').length;
  const lostDeals = (deals || []).filter(d => d.status === 'perdido').length;
  const closedDeals = wonDeals + lostDeals;
  const winRate = closedDeals > 0 ? ((wonDeals / closedDeals) * 100) : 0;

  // Monthly revenue from won deals
  const monthlyRevenue = {};
  for (const d of (deals || [])) {
    if (d.status === 'ganho') {
      const date = d.closed_at || d.created_at;
      if (!date) continue;
      const key = date.substring(0, 7); // YYYY-MM
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (Number(d.valor) || 0);
    }
  }

  // Convert to sorted array (last 6 months)
  const monthlyRevenueArr = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({ month, value }));

  return { leadsByOrigin, monthlyRevenue: monthlyRevenueArr, winRate, totalDeals, wonDeals, lostDeals };
}

/* ═══════════════════════════════════════════
   REALTIME SUBSCRIPTIONS
   ═══════════════════════════════════════════ */

let realtimeChannel = null;

/**
 * Subscribe to realtime changes on leads + deals tables.
 * @param {function} onLeadChange — callback(payload)
 * @param {function} onDealChange — callback(payload)
 * @returns {function} unsubscribe function
 */
export function subscribeRealtime(onLeadChange, onDealChange) {
  const client = sb();
  if (!client) return () => {};

  // Unsubscribe previous if any
  if (realtimeChannel) {
    client.removeChannel(realtimeChannel);
  }

  realtimeChannel = client
    .channel('crm-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
      if (onLeadChange) onLeadChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, (payload) => {
      if (onDealChange) onDealChange(payload);
    })
    .subscribe();

  return () => {
    if (realtimeChannel) {
      client.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
}
