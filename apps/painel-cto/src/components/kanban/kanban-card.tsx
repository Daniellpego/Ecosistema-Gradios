'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, CheckCircle2, ListTodo, AlertCircle } from 'lucide-react'
import { cn, normalizeColor } from '@/lib/utils'
import { PrioridadeBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate, daysUntil } from '@/lib/format'
import { getProjetoTitulo, getProjetoEntrega, type Projeto } from '@/types/database'
import { useTarefaCount } from '@/hooks/use-tarefas'

interface KanbanCardProps {
  projeto: Projeto
  overlay?: boolean
}

export function KanbanCard({ projeto, overlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: projeto.id,
    data: { type: 'projeto', projeto },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { data: taskCount } = useTarefaCount(projeto.id)
  const entrega = getProjetoEntrega(projeto)
  const days = entrega ? daysUntil(entrega) : null
  const isLate = days !== null && days < 0
  const isDueSoon = days !== null && days >= 0 && days <= 3

  const projectColor = normalizeColor(projeto.cor)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'kanban-card relative group',
        isDragging && 'dragging',
        overlay && 'shadow-2xl rotate-2 scale-105'
      )}
    >
      {/* Gradient left border bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-all duration-200 group-hover:w-[4px]"
        style={{
          background: `linear-gradient(180deg, ${projectColor}ff 0%, ${projectColor}88 60%, ${projectColor}22 100%)`,
          boxShadow: `0 0 8px ${projectColor}44`,
        }}
      />

      {/* Subtle top glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${projectColor}08 0%, transparent 60%)`,
        }}
      />

      <div className="pl-4 relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/projetos/${projeto.id}`}
            className="text-sm font-semibold text-text-primary hover:text-brand-cyan transition-colors line-clamp-2 leading-snug"
            onClick={(e) => e.stopPropagation()}
          >
            {getProjetoTitulo(projeto)}
          </Link>
          <PrioridadeBadge prioridade={projeto.prioridade} />
        </div>

        {projeto.cliente && (
          <p className="text-xs text-text-muted mb-2 truncate">{projeto.cliente}</p>
        )}

        <Progress value={projeto.progresso} showLabel className="mb-3" />

        <div className="flex items-center justify-between text-xs">
          {entrega ? (
            <div
              className={cn(
                'flex items-center gap-1 font-medium',
                isLate
                  ? 'text-status-negative'
                  : isDueSoon
                  ? 'text-status-warning'
                  : 'text-text-muted'
              )}
            >
              {isLate ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{formatDate(entrega)}</span>
              {isLate && <span className="text-[10px]">(atrasado)</span>}
              {isDueSoon && !isLate && <span className="text-[10px]">({days}d)</span>}
            </div>
          ) : (
            <span />
          )}

          {taskCount && taskCount.total > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded-md',
                taskCount.done === taskCount.total
                  ? 'text-status-positive bg-status-positive/10'
                  : 'text-text-muted bg-white/5'
              )}
            >
              {taskCount.done === taskCount.total ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <ListTodo className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">
                {taskCount.done}/{taskCount.total}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
