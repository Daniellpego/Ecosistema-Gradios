import type { ProjetoStatus, Prioridade } from '@/types/database'

export const KANBAN_COLUMNS: { id: ProjetoStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#94A3B8', bgColor: 'rgba(148, 163, 184, 0.08)' },
  { id: 'em_andamento', label: 'Em Andamento', color: '#00BFFF', bgColor: 'rgba(0, 191, 255, 0.08)' },
  { id: 'revisao', label: 'Revisao', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.08)' },
  { id: 'entregue', label: 'Entregue', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.08)' },
]

export const PRIORIDADE_CONFIG: Record<Prioridade, { label: string; color: string; bg: string }> = {
  baixa: { label: 'Baixa', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
  media: { label: 'Media', color: '#00BFFF', bg: 'rgba(0, 191, 255, 0.12)' },
  alta: { label: 'Alta', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  urgente: { label: 'Urgente', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
}

export const TASK_COLUMNS = [
  { id: 'todo' as const, label: 'A Fazer', color: '#94A3B8' },
  { id: 'doing' as const, label: 'Fazendo', color: '#00BFFF' },
  { id: 'done' as const, label: 'Feito', color: '#10B981' },
]

export const CATEGORIA_LABELS: Record<string, string> = {
  projeto_avulso: 'Projeto Avulso',
  mensalidade: 'Mensalidade',
  consultoria: 'Consultoria',
  mvp: 'MVP',
  interno: 'Interno',
}
