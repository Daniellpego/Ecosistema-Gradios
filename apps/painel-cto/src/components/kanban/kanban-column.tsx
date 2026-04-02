'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanCard } from './kanban-card'
import type { Projeto, ProjetoStatus } from '@/types/database'

interface KanbanColumnProps {
  id: ProjetoStatus
  label: string
  color: string
  bgColor: string
  projetos: Projeto[]
}

export function KanbanColumn({ id, label, color, bgColor, projetos }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-column flex-1 transition-all duration-200',
        isOver && 'ring-2 ring-brand-cyan/40 scale-[1.01]'
      )}
      style={{ background: isOver ? 'rgba(0, 200, 240, 0.05)' : undefined }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {/* Status dot with glow */}
          <div
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}99`,
            }}
          />
          <h3 className="text-sm font-semibold text-text-primary tracking-wide">{label}</h3>
        </div>

        {/* Counter badge with glow */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center transition-all duration-200"
          style={{
            color,
            background: bgColor,
            boxShadow: projetos.length > 0 ? `0 0 8px ${color}33` : 'none',
          }}
        >
          {projetos.length}
        </span>
      </div>

      {/* Divider with color accent */}
      <div
        className="h-px mb-3 mx-1 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}66 0%, ${color}11 100%)`,
        }}
      />

      <SortableContext items={projetos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[120px]">
          {projetos.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center justify-center min-h-[120px] rounded-xl border-2 border-dashed transition-colors duration-200',
                isOver
                  ? 'border-brand-cyan/50 bg-brand-cyan/5'
                  : 'border-brand-blue-deep/50 bg-transparent'
              )}
            >
              <LayoutGrid
                className="h-6 w-6 mb-2 transition-colors duration-200"
                style={{ color: isOver ? color : '#64748B' }}
              />
              <span className="text-xs text-text-muted">
                {isOver ? 'Soltar aqui' : 'Nenhum projeto'}
              </span>
            </div>
          ) : (
            projetos.map((projeto) => (
              <KanbanCard key={projeto.id} projeto={projeto} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
