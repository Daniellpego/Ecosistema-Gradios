export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value)}%`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(d)
}

export function formatRelative(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return formatDate(date)
}

export function daysUntil(date: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date + 'T00:00:00')
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  em_andamento: 'Em Andamento',
  revisao: 'Em Revisao',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  todo: 'A Fazer',
  doing: 'Fazendo',
  done: 'Feito',
  pendente: 'Pendente',
  concluido: 'Concluido',
  atrasado: 'Atrasado',
  nota: 'Nota',
  status_change: 'Mudanca de Status',
  milestone: 'Milestone',
  bloqueio: 'Bloqueio',
  entrega: 'Entrega',
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
}

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}
