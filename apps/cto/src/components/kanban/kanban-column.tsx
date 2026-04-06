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
    <div ref={setNodeRef} className={cn('kanban-column flex-1 transition-all', isOver && 'ring-2 ring-brand-cyan/40')} style={{ background: isOver ? 'rgba(0,191,255,0.05)' : undefined }}>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}99` }} />
          <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: bgColor }}>{projetos.length}</span>
      </div>
      <div className="h-px mb-3 mx-1 rounded-full" style={{ background: `linear-gradient(90deg, ${color}66 0%, ${color}11 100%)` }} />
      <SortableContext items={projetos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[120px]">
          {projetos.length === 0 ? (
            <div className={cn('flex flex-col items-center justify-center min-h-[120px] rounded-xl border-2 border-dashed', isOver ? 'border-brand-cyan/50 bg-brand-cyan/5' : 'border-slate-200')}>
              <LayoutGrid className="h-6 w-6 mb-2" style={{ color: isOver ? color : '#64748B' }} />
              <span className="text-xs text-text-muted">{isOver ? 'Soltar aqui' : 'Nenhum projeto'}</span>
            </div>
          ) : projetos.map((p) => <KanbanCard key={p.id} projeto={p} />)}
        </div>
      </SortableContext>
    </div>
  )
}
