'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanCard } from './kanban-card'
import type { Projeto, ProjetoStatus } from '@/types/database'

interface KanbanColumnProps { id: ProjetoStatus; label: string; color: string; bgColor: string; projetos: Projeto[] }

export function KanbanColumn({ id, label, color, bgColor, projetos }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={cn('kanban-column flex-1 transition-all', isOver && 'ring-2 ring-brand-cyan/40 bg-brand-cyan/[0.03] rounded-2xl')}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: color }} />
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wide">{label}</h3>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color, background: bgColor }}
          >
            {projetos.length}
          </span>
        </div>
      </div>

      <SortableContext items={projetos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[120px]">
          {projetos.length === 0 ? (
            <div className={cn(
              'flex flex-col items-center justify-center py-8 rounded-[14px] border-2 border-dashed transition-colors cursor-pointer',
              isOver
                ? 'border-brand-cyan/50 bg-brand-cyan/5'
                : 'border-slate-200/40 hover:bg-slate-50/50'
            )}>
              <span className="text-xs font-medium text-text-muted">
                {isOver ? 'Soltar aqui' : 'Nenhum projeto'}
              </span>
            </div>
          ) : projetos.map((p) => <KanbanCard key={p.id} projeto={p} />)}
        </div>
      </SortableContext>
    </div>
  )
}
