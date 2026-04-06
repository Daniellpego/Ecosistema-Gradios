'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { normalizeProjetoStatus, getProjetoEntrega, type Projeto, type ProjetoEntregaRow, type MilestoneDashboardRow } from '@/types/database'

export function useDashboardCTO() {
  const supabase = createClient()
  const projetos = useQuery({ queryKey: ['dashboard-projetos'], queryFn: async () => { const { data, error } = await supabase.from('projetos').select('*').neq('status', 'cancelado'); if (error) throw error; return (data as Projeto[]).map((p) => ({ ...p, status: normalizeProjetoStatus(p.status) })) } })
  const proximasEntregas = useQuery({ queryKey: ['dashboard-proximas-entregas'], queryFn: async () => { const today = new Date().toISOString().split('T')[0]; const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]; const { data, error } = await supabase.from('projetos').select('id, titulo, cliente, data_entrega, progresso, prioridade').gte('data_entrega', today!).lte('data_entrega', nextWeek!).not('status', 'in', '("entregue","cancelado")').order('data_entrega', { ascending: true }); if (error) throw error; return data as ProjetoEntregaRow[] } })
  const proximosMilestones = useQuery({ queryKey: ['dashboard-proximos-milestones'], queryFn: async () => { const today = new Date().toISOString().split('T')[0]; const next14 = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]; const { data, error } = await supabase.from('project_milestones').select('*, projetos!inner(titulo)').gte('data_prevista', today!).lte('data_prevista', next14!).neq('status', 'concluido').order('data_prevista', { ascending: true }).limit(10); if (error) throw error; return data as MilestoneDashboardRow[] } })
  const allProjetos = projetos.data ?? []
  const ativos = allProjetos.filter((p) => ['backlog', 'em_andamento', 'revisao'].includes(p.status))
  const now = new Date(); const currentMonth = now.getMonth(); const currentYear = now.getFullYear()
  const entreguesMes = allProjetos.filter((p) => { if (p.status !== 'entregue') return false; const d = new Date(p.updated_at); return d.getMonth() === currentMonth && d.getFullYear() === currentYear })
  const today = new Date().toISOString().split('T')[0]!
  const atrasados = allProjetos.filter((p) => { const entrega = getProjetoEntrega(p); return entrega && entrega < today && !['entregue', 'cancelado'].includes(p.status) })
  const valorPipeline = ativos.reduce((sum, p) => sum + (p.valor ?? 0), 0)
  const statusDistribuicao = [
    { name: 'Backlog', value: allProjetos.filter((p) => p.status === 'backlog').length, color: '#94A3B8' },
    { name: 'Em Andamento', value: allProjetos.filter((p) => p.status === 'em_andamento').length, color: '#00BFFF' },
    { name: 'Revisao', value: allProjetos.filter((p) => p.status === 'revisao').length, color: '#F59E0B' },
    { name: 'Entregue', value: allProjetos.filter((p) => p.status === 'entregue').length, color: '#10B981' },
  ]
  return { isLoading: projetos.isLoading, error: projetos.error || proximasEntregas.error || proximosMilestones.error, kpis: { projetosAtivos: ativos.length, entreguesMes: entreguesMes.length, atrasados: atrasados.length, valorPipeline }, statusDistribuicao, proximasEntregas: proximasEntregas.data ?? [], proximosMilestones: proximosMilestones.data ?? [], allProjetos }
}
