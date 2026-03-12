/* ═══════════════════════════════════════════════════
   BG Tech — Database Operations (Projetos & Tarefas)
   ═══════════════════════════════════════════════════ */

import { getSupabase } from './auth.js';

/* ────────────── Projetos ────────────── */

/** Fetch all projetos, ordered by updated_at desc */
export async function fetchProjetos() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('projetos')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Upsert (insert or update) a projeto */
export async function upsertProjeto(projeto) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase não configurado');
  const payload = { ...projeto, updated_at: new Date().toISOString() };
  if (!payload.id) {
    payload.created_at = new Date().toISOString();
  }
  const { data, error } = await sb
    .from('projetos')
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a projeto by id */
export async function deleteProjeto(id) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase não configurado');
  const { error } = await sb.from('projetos').delete().eq('id', id);
  if (error) throw error;
}

/* ────────────── Tarefas ────────────── */

/** Fetch tarefas for a specific projeto */
export async function fetchTarefas(projetoId) {
  const sb = getSupabase();
  if (!sb) return [];
  let query = sb.from('tarefas').select('*').order('created_at', { ascending: true });
  if (projetoId) {
    query = query.eq('projeto_id', projetoId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/** Fetch all tarefas across all projetos */
export async function fetchAllTarefas() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('tarefas')
    .select('*, projetos(titulo)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Upsert a tarefa */
export async function upsertTarefa(tarefa) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase não configurado');
  const payload = { ...tarefa, updated_at: new Date().toISOString() };
  if (!payload.id) {
    payload.created_at = new Date().toISOString();
  }
  const { data, error } = await sb
    .from('tarefas')
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a tarefa by id */
export async function deleteTarefa(id) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase não configurado');
  const { error } = await sb.from('tarefas').delete().eq('id', id);
  if (error) throw error;
}

/** Fetch a single projeto with its tarefas */
export async function fetchProjetoWithTarefas(projetoId) {
  const sb = getSupabase();
  if (!sb) return null;
  const [projRes, tarefasRes] = await Promise.all([
    sb.from('projetos').select('*').eq('id', projetoId).single(),
    sb.from('tarefas').select('*').eq('projeto_id', projetoId).order('created_at', { ascending: true }),
  ]);
  if (projRes.error) throw projRes.error;
  return {
    ...projRes.data,
    tarefas: tarefasRes.data || [],
  };
}

/* ────────────── Realtime ────────────── */

/** Subscribe to realtime changes on projetos + tarefas */
export function subscribeRealtime({ onProjetosChange, onTarefasChange }) {
  const sb = getSupabase();
  if (!sb) return { unsubscribe() {} };

  const channel = sb
    .channel('painel-projetos-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projetos' }, (payload) => {
      if (onProjetosChange) onProjetosChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' }, (payload) => {
      if (onTarefasChange) onTarefasChange(payload);
    })
    .subscribe();

  return {
    unsubscribe() {
      sb.removeChannel(channel);
    },
  };
}
