// ═══════════════════════════════════════════════
// BG Tech Ecosystem — Shared Types & Constants
// ═══════════════════════════════════════════════

export const LEAD_STATUS = {
  NOVO: 'novo',
  CONTATADO: 'contatado',
  QUALIFICADO: 'qualificado',
  PROPOSTA: 'proposta',
  NEGOCIACAO: 'negociacao',
  FECHADO_GANHO: 'fechado_ganho',
  FECHADO_PERDIDO: 'fechado_perdido',
};

export const LEAD_STATUS_LABELS = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  proposta: 'Proposta Enviada',
  negociacao: 'Em Negociação',
  fechado_ganho: 'Fechado (Ganho)',
  fechado_perdido: 'Fechado (Perdido)',
};

export const LEAD_STATUS_COLORS = {
  novo: '#94A3B8',
  contatado: '#00C8F0',
  qualificado: '#A78BFA',
  proposta: '#F59E0B',
  negociacao: '#FB923C',
  fechado_ganho: '#10B981',
  fechado_perdido: '#EF4444',
};

export const DEAL_STATUS = {
  ABERTO: 'aberto',
  GANHO: 'ganho',
  PERDIDO: 'perdido',
};

export const PROJETO_STATUS = {
  BACKLOG: 'backlog',
  EM_ANDAMENTO: 'em_andamento',
  REVISAO: 'revisao',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
};

export const PROJETO_STATUS_LABELS = {
  backlog: 'Backlog',
  em_andamento: 'Em Andamento',
  revisao: 'Em Revisão',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const PROJETO_STATUS_COLORS = {
  backlog: '#94A3B8',
  em_andamento: '#00C8F0',
  revisao: '#F59E0B',
  entregue: '#10B981',
  cancelado: '#EF4444',
};

export const TAREFA_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
};

export const PRIORIDADE = {
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente',
};

export const PRIORIDADE_COLORS = {
  baixa: '#94A3B8',
  media: '#00C8F0',
  alta: '#F59E0B',
  urgente: '#EF4444',
};

export const ORIGENS = ['direto', 'meta_ads', 'google', 'indicacao', 'linkedin', 'site'];

export const CATEGORIAS_DEAL = ['servico', 'produto', 'consultoria', 'saas', 'manutencao'];

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR');
}
