import { cn } from '@/lib/utils'
import type { Prioridade, ProjetoStatus, MilestoneStatus } from '@/types/database'
import { PRIORIDADE_CONFIG, KANBAN_COLUMNS } from '@/lib/kanban-config'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'cyan' | 'muted'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variantClass = variant === 'default' ? 'badge-cyan' : `badge-${variant}`
  return <span className={cn(variantClass, className)}>{children}</span>
}

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const config = PRIORIDADE_CONFIG[prioridade]
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-md"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProjetoStatus }) {
  // em_revisao is a legacy alias for revisao
  const normalizedStatus = status === 'em_revisao' ? 'revisao' : status
  const col = KANBAN_COLUMNS.find((c) => c.id === normalizedStatus)
  if (col) {
    return (
      <span
        className="text-xs font-semibold px-2.5 py-0.5 rounded-md"
        style={{ color: col.color, background: col.bgColor }}
      >
        {col.label}
      </span>
    )
  }
  // Fallback for cancelado and any unrecognised status
  return (
    <span className="badge-muted">
      {status === 'cancelado' ? 'Cancelado' : status}
    </span>
  )
}

export function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  const map: Record<MilestoneStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pendente: { label: 'Pendente', variant: 'muted' },
    em_andamento: { label: 'Em Andamento', variant: 'cyan' },
    concluido: { label: 'Concluido', variant: 'positive' },
    atrasado: { label: 'Atrasado', variant: 'negative' },
  }
  const cfg = map[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
