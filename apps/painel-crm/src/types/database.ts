// ─── Lead Types ────────────────────────────────────────────

export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'reuniao' | 'proposta' | 'fechado_ganho' | 'fechado_perdido'
export type LeadTemperatura = 'frio' | 'morno' | 'quente'
export type LeadOrigem = 'quiz' | 'whatsapp' | 'indicacao' | 'meta_ads' | 'direto' | 'google' | 'site_organico'

export interface Lead {
  id: string
  nome: string
  empresa: string | null
  email: string | null
  telefone: string | null
  whatsapp: string | null
  setor: string | null
  origem: string
  status: LeadStatus
  temperatura: LeadTemperatura
  valor_estimado: number
  notas: string | null
  responsavel: string
  tags: string[]
  ultimo_contato: string | null
  proximo_followup: string | null
  motivo_perda: string | null
  user_id: string | null
  created_at: string
  updated_at: string
}

// ─── Deal Types ────────────────────────────────────────────

export type DealStatus = 'aberto' | 'ganho' | 'perdido'
export type TipoServico = 'setup' | 'mensalidade' | 'projeto_avulso' | 'consultoria' | 'mvp'

export interface Deal {
  id: string
  lead_id: string | null
  titulo: string
  valor: number
  mrr: number
  status: DealStatus
  data_fechamento: string | null
  categoria: string | null
  tipo_servico: TipoServico | null
  probabilidade: number
  motivo_perda: string | null
  data_previsao_fechamento: string | null
  notas: string | null
  user_id: string | null
  created_at: string
  updated_at: string
}

// ─── Atividade Types ───────────────────────────────────────

export type AtividadeTipo = 'nota' | 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'proposta_enviada' | 'followup' | 'sistema'

export interface Atividade {
  id: string
  lead_id: string | null
  deal_id: string | null
  tipo: AtividadeTipo
  descricao: string
  data: string
  autor: string
  created_at: string
}

// ─── Quiz Session Types ────────────────────────────────────

export interface QuizSession {
  id: string
  lead_id: string | null
  setor: string | null
  faturamento_faixa: string | null
  horas_retrabalho: string | null
  gargalos: string[] | null
  nivel_tecnologia: string | null
  urgencia: string | null
  respostas: Record<string, unknown> | null
  score_automacao: number | null
  custo_invisivel_min: number | null
  custo_invisivel_max: number | null
  resultado_tipo: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  origem: string | null
  completed_at: string | null
  created_at: string
}

// ─── Projeto Types (read-only from CRM) ────────────────────

export interface Projeto {
  id: string
  deal_id: string | null
  titulo: string
  cliente: string | null
  status: string
  valor: number
  data_inicio: string | null
  data_entrega: string | null
  responsavel: string | null
  progresso: number
  created_at: string
}

// ─── Constants ─────────────────────────────────────────────

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  reuniao: 'Reunião',
  proposta: 'Proposta',
  fechado_ganho: 'Ganho',
  fechado_perdido: 'Perdido',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  novo: '#94A3B8',
  contatado: '#40D8EE',
  qualificado: '#00C8F0',
  reuniao: '#F59E0B',
  proposta: '#2B7AB5',
  fechado_ganho: '#10B981',
  fechado_perdido: '#EF4444',
}

export const PIPELINE_STAGES: LeadStatus[] = [
  'novo',
  'qualificado',
  'reuniao',
  'proposta',
  'fechado_ganho',
]

export const ORIGENS_LABELS: Record<string, string> = {
  quiz: 'Quiz',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  meta_ads: 'Meta Ads',
  direto: 'Direto',
  google: 'Google',
  site_organico: 'Site',
}

export const ORIGENS_COLORS: Record<string, string> = {
  quiz: '#10B981',
  whatsapp: '#94A3B8',
  indicacao: '#2B7AB5',
  meta_ads: '#A78BFA',
  direto: '#F59E0B',
  google: '#00C8F0',
  site_organico: '#10B981',
}

export const SETORES = [
  'Construção Civil',
  'Jurídico',
  'Comércio',
  'Indústria',
  'Saúde',
  'Serviços',
  'Tecnologia',
  'Educação',
  'Alimentação',
  'Outro',
] as const

export const RESPONSAVEIS = ['Daniel', 'Bryan', 'Gustavo'] as const

export const ATIVIDADE_ICONS: Record<AtividadeTipo, string> = {
  nota: 'FileText',
  ligacao: 'Phone',
  whatsapp: 'MessageCircle',
  email: 'Mail',
  reuniao: 'Users',
  proposta_enviada: 'FileCheck',
  followup: 'RefreshCw',
  sistema: 'Settings',
}

export const ATIVIDADE_LABELS: Record<AtividadeTipo, string> = {
  nota: 'Nota',
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'Email',
  reuniao: 'Reunião',
  proposta_enviada: 'Proposta Enviada',
  followup: 'Follow-up',
  sistema: 'Sistema',
}
