import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMMM yyyy', { locale: ptBR })
}

export function formatShortMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM/yy', { locale: ptBR })
}
