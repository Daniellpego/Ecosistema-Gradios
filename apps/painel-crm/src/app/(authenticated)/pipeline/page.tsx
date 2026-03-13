'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineLeads, useUpdateLead } from '@/hooks/use-leads'
import { PIPELINE_STAGES, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/types/database'
import type { Lead, LeadStatus } from '@/types/database'
import { PageTransition } from '@/components/motion'
import { PageTitle } from '@/components/page-title'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/toast-provider'
import { formatCurrency, formatTimeAgo } from '@/lib/format'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// ─── Temperatura Badge ────────────────────────────────────

const TEMPERATURA_CONFIG: Record<string, { label: string; className: string }> = {
  quente: { label: 'Quente', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  morno: { label: 'Morno', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  frio: { label: 'Frio', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

function TemperaturaBadge({ temperatura }: { temperatura: string }) {
  const config = TEMPERATURA_CONFIG[temperatura] ?? {
    label: temperatura,
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${config.className}`}
    >
      {config.label}
    </span>
  )
}

// ─── Lead Card (Sortable) ─────────────────────────────────

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isDragOverlay?: boolean
}

function LeadCard({ lead, onClick, isDragOverlay }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation()
          onClick()
        }
      }}
      className={`bg-bg-navy rounded-lg p-3 cursor-grab active:cursor-grabbing
        border border-transparent hover:border-brand-blue-deep/40
        transition-colors duration-150
        ${isDragging ? 'opacity-30' : 'opacity-100'}
        ${isDragOverlay ? 'shadow-xl shadow-black/40 ring-1 ring-brand-cyan/30' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-text-primary truncate leading-tight">
          {lead.nome}
        </h4>
        <TemperaturaBadge temperatura={lead.temperatura} />
      </div>

      {lead.empresa && (
        <p className="text-xs text-text-secondary truncate mb-1.5">
          {lead.empresa}
        </p>
      )}

      <p className="text-sm font-semibold text-brand-cyan mb-2">
        {formatCurrency(lead.valor_estimado)}
      </p>

      <div className="flex items-center justify-between text-[11px] text-text-secondary">
        <span className="truncate max-w-[60%]">{lead.responsavel}</span>
        <span className="shrink-0">{formatTimeAgo(lead.created_at)}</span>
      </div>
    </div>
  )
}

// ─── Static Card for DragOverlay ──────────────────────────

function StaticLeadCard({ lead }: { lead: Lead }) {
  return (
    <div
      className="bg-bg-navy rounded-lg p-3 shadow-xl shadow-black/40 ring-1 ring-brand-cyan/30 cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-text-primary truncate leading-tight">
          {lead.nome}
        </h4>
        <TemperaturaBadge temperatura={lead.temperatura} />
      </div>

      {lead.empresa && (
        <p className="text-xs text-text-secondary truncate mb-1.5">
          {lead.empresa}
        </p>
      )}

      <p className="text-sm font-semibold text-brand-cyan mb-2">
        {formatCurrency(lead.valor_estimado)}
      </p>

      <div className="flex items-center justify-between text-[11px] text-text-secondary">
        <span className="truncate max-w-[60%]">{lead.responsavel}</span>
        <span className="shrink-0">{formatTimeAgo(lead.created_at)}</span>
      </div>
    </div>
  )
}

// ─── Pipeline Column ──────────────────────────────────────

interface PipelineColumnProps {
  stage: LeadStatus
  leads: Lead[]
  totalValue: number
  onCardClick: (id: string) => void
}

function PipelineColumn({ stage, leads, totalValue, onCardClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const leadIds = useMemo(() => leads.map((l) => l.id), [leads])

  return (
    <div
      className={`flex flex-col bg-bg-card border rounded-lg min-w-[280px] max-h-[calc(100vh-240px)] transition-colors duration-200
        ${isOver ? 'border-brand-cyan/50 bg-brand-cyan/5' : 'border-brand-blue-deep/20'}
      `}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-brand-blue-deep/20 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: LEAD_STATUS_COLORS[stage] }}
          />
          <span className="text-sm font-semibold text-text-primary">
            {LEAD_STATUS_LABELS[stage]}
          </span>
          <span className="ml-auto text-xs font-medium text-text-secondary bg-bg-navy px-1.5 py-0.5 rounded">
            {leads.length}
          </span>
        </div>
        <p className="text-xs font-medium text-brand-cyan">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Cards Area */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead.id)}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-text-secondary/50">
            Nenhum lead
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Summary Bar ──────────────────────────────────────────

interface SummaryBarProps {
  leads: Lead[]
  stageGroups: Map<LeadStatus, Lead[]>
}

function SummaryBar({ leads, stageGroups }: SummaryBarProps) {
  const totalValue = useMemo(
    () => leads.reduce((sum, l) => sum + l.valor_estimado, 0),
    [leads]
  )

  return (
    <div className="flex flex-wrap items-center gap-4 bg-bg-card border border-brand-blue-deep/20 rounded-lg p-3">
      <div className="mr-4">
        <p className="text-xs text-text-secondary">Total Pipeline</p>
        <p className="text-lg font-bold text-brand-cyan">{formatCurrency(totalValue)}</p>
      </div>

      <div className="h-8 w-px bg-brand-blue-deep/30 hidden sm:block" />

      {PIPELINE_STAGES.map((stage) => {
        const count = stageGroups.get(stage)?.length ?? 0
        return (
          <div key={stage} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: LEAD_STATUS_COLORS[stage] }}
            />
            <span className="text-xs text-text-secondary">
              {LEAD_STATUS_LABELS[stage]}
            </span>
            <span className="text-xs font-semibold text-text-primary">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────

function PipelineSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────

export default function PipelinePage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { data: leads, isLoading } = usePipelineLeads()
  const updateLead = useUpdateLead()
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  // Group leads by stage
  const stageGroups = useMemo(() => {
    const groups = new Map<LeadStatus, Lead[]>()
    for (const stage of PIPELINE_STAGES) {
      groups.set(stage, [])
    }
    if (leads) {
      for (const lead of leads) {
        const bucket = groups.get(lead.status)
        if (bucket) {
          bucket.push(lead)
        }
      }
    }
    return groups
  }, [leads])

  // Stage totals
  const stageTotals = useMemo(() => {
    const totals = new Map<LeadStatus, number>()
    for (const [stage, stageLeads] of stageGroups) {
      totals.set(stage, stageLeads.reduce((sum, l) => sum + l.valor_estimado, 0))
    }
    return totals
  }, [stageGroups])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const draggedId = event.active.id as string
      const found = leads?.find((l) => l.id === draggedId) ?? null
      setActiveLead(found)
    },
    [leads]
  )

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback handled by useDroppable isOver
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveLead(null)
      const { active, over } = event

      if (!over) return

      const leadId = active.id as string
      const overId = over.id as string

      // Determine target stage: if dropped over a column (stage id) or over another card
      let targetStage: LeadStatus | undefined

      // Check if over ID is a stage
      if (PIPELINE_STAGES.includes(overId as LeadStatus)) {
        targetStage = overId as LeadStatus
      } else {
        // Dropped over a card - find which stage that card belongs to
        const targetLead = leads?.find((l) => l.id === overId)
        if (targetLead) {
          targetStage = targetLead.status
        }
      }

      if (!targetStage) return

      // Find the dragged lead's current stage
      const draggedLead = leads?.find((l) => l.id === leadId)
      if (!draggedLead || draggedLead.status === targetStage) return

      // Update lead status
      updateLead.mutate(
        { id: leadId, status: targetStage },
        { onSuccess: () => addToast(`Movido para ${LEAD_STATUS_LABELS[targetStage]}`, 'success') }
      )
    },
    [leads, updateLead, addToast]
  )

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/leads/${id}`)
    },
    [router]
  )

  if (isLoading) {
    return (
      <PageTransition>
        <PipelineSkeleton />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageTitle title="Pipeline" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
          <p className="text-sm text-text-secondary mt-1">
            Kanban de vendas — arraste leads entre as etapas
          </p>
        </div>

        {/* Summary Bar */}
        <SummaryBar leads={leads ?? []} stageGroups={stageGroups} />

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {PIPELINE_STAGES.map((stage) => (
              <PipelineColumn
                key={stage}
                stage={stage}
                leads={stageGroups.get(stage) ?? []}
                totalValue={stageTotals.get(stage) ?? 0}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeLead ? <StaticLeadCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </PageTransition>
  )
}
