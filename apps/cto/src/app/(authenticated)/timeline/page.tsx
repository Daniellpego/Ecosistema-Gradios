'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { GanttChart, Calendar, Clock, ArrowRight } from 'lucide-react'
import { PageTransition, StaggerItem, StaggerContainer } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { PrioridadeBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, normalizeColor } from '@/lib/utils'
import { useProjetos } from '@/hooks/use-projetos'
import { formatDate, daysUntil } from '@/lib/format'
import { getProjetoTitulo, getProjetoEntrega, type Projeto } from '@/types/database'

/* ── Desktop Gantt Bar ─────────────────────────────────────────────────────── */

function GanttBar({ projeto, minDate, totalDays }: { projeto: Projeto; minDate: number; totalDays: number }) {
  const entrega = getProjetoEntrega(projeto)
  const start = projeto.data_inicio ? new Date(projeto.data_inicio + 'T00:00:00').getTime() : Date.now()
  const end = entrega ? new Date(entrega + 'T00:00:00').getTime() : start + 30 * 86400000
  const leftPct = Math.max(0, ((start - minDate) / (totalDays * 86400000)) * 100)
  const widthPct = Math.max(4, ((end - start) / (totalDays * 86400000)) * 100)
  const progressWidth = (projeto.progresso / 100) * widthPct
  const color = normalizeColor(projeto.cor)

  return (
    <Link
      href={`/projetos/${projeto.id}`}
      className="flex items-center gap-3 py-3 border-b border-brand-blue-deep/15 group hover:bg-bg-hover/30 transition-colors -mx-3 px-3 rounded-lg"
    >
      <div className="w-44 shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
          <p className="text-sm font-semibold text-text-primary truncate group-hover:text-brand-cyan transition-colors">
            {getProjetoTitulo(projeto)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <p className="text-xs text-text-muted truncate">{projeto.cliente ?? '-'}</p>
          <PrioridadeBadge prioridade={projeto.prioridade} />
        </div>
      </div>
      <div className="flex-1 relative h-10">
        <div
          className="absolute top-1 h-8 rounded-lg opacity-15 transition-opacity group-hover:opacity-25"
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: color }}
        />
        <div
          className="absolute top-1 h-8 rounded-lg transition-all duration-500"
          style={{
            left: `${leftPct}%`,
            width: `${progressWidth}%`,
            background: color,
          }}
        />
        <span
          className={cn(
            'absolute top-2 text-xs px-2',
            projeto.progresso > 0 ? 'font-bold text-bg-navy' : 'font-medium text-text-muted'
          )}
          style={{ left: `${leftPct + 0.5}%` }}
        >
          {projeto.progresso}%
        </span>
      </div>
    </Link>
  )
}

/* ── Mobile Project Card ───────────────────────────────────────────────────── */

function MobileProjectCard({ projeto }: { projeto: Projeto }) {
  const color = normalizeColor(projeto.cor)
  const entrega = getProjetoEntrega(projeto)
  const days = entrega ? daysUntil(entrega) : null
  const isLate = days !== null && days < 0

  return (
    <StaggerItem>
      <Link
        href={`/projetos/${projeto.id}`}
        className="block card-glass !p-3.5 relative overflow-hidden active:scale-[0.98] transition-transform"
      >
        {/* Left color bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ background: color }}
        />

        <div className="pl-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary truncate">{getProjetoTitulo(projeto)}</p>
              {projeto.cliente && (
                <p className="text-xs text-text-muted mt-0.5 truncate">{projeto.cliente}</p>
              )}
            </div>
            <PrioridadeBadge prioridade={projeto.prioridade} />
          </div>

          <Progress value={projeto.progresso} showLabel className="mb-2" />

          <div className="flex items-center justify-between text-xs">
            {entrega ? (
              <div className={cn(
                'flex items-center gap-1 font-medium',
                isLate ? 'text-status-negative' : days !== null && days <= 3 ? 'text-status-warning' : 'text-text-muted'
              )}>
                <Clock className="h-3 w-3" />
                <span>{formatDate(entrega)}</span>
                {isLate && <span className="text-[10px]">({Math.abs(days!)}d atrasado)</span>}
              </div>
            ) : (
              <span className="text-text-muted">Sem prazo</span>
            )}
            <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
          </div>
        </div>
      </Link>
    </StaggerItem>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────────── */

export default function TimelinePage() {
  const { data: projetos, isLoading, error } = useProjetos()

  const { sortedProjetos, minDate, totalDays, monthHeaders } = useMemo(() => {
    const list = (projetos ?? []).filter((p) => p.status !== 'cancelado' && (p.data_inicio || getProjetoEntrega(p)))
    const sorted = [...list].sort((a, b) => (a.data_inicio ?? '').localeCompare(b.data_inicio ?? ''))

    const dates = sorted.flatMap((p) => [
      p.data_inicio ? new Date(p.data_inicio + 'T00:00:00').getTime() : null,
      p.data_entrega ? new Date(p.data_entrega + 'T00:00:00').getTime() : null,
    ]).filter(Boolean) as number[]

    const min = Math.min(...dates, Date.now()) - 7 * 86400000
    const max = Math.max(...dates, Date.now()) + 14 * 86400000
    const days = Math.ceil((max - min) / 86400000)

    const headers: { label: string; leftPct: number }[] = []
    const startD = new Date(min)
    startD.setDate(1)
    while (startD.getTime() < max) {
      const pct = ((startD.getTime() - min) / (days * 86400000)) * 100
      headers.push({
        label: startD.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        leftPct: Math.max(0, pct),
      })
      startD.setMonth(startD.getMonth() + 1)
    }

    return { sortedProjetos: sorted, minDate: min, totalDays: days, monthHeaders: headers }
  }, [projetos])

  if (error) {
    return <PageTransition><ErrorState message="Erro ao carregar projetos" /></PageTransition>
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <div className="hidden sm:block"><Skeleton className="h-[500px] w-full rounded-2xl" /></div>
          <div className="sm:hidden space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        </div>
      </PageTransition>
    )
  }

  const todayPct = ((Date.now() - minDate) / (totalDays * 86400000)) * 100

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="section-header-icon" style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.2)' }}>
              <GanttChart className="h-4 w-4 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">Timeline</h1>
              <p className="text-[10px] sm:text-xs text-text-muted">{sortedProjetos.length} projetos com datas</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar className="h-3.5 w-3.5 hidden sm:block" />
            <span className="text-[10px] sm:text-xs">{formatDate(new Date())}</span>
          </div>
        </div>

        {/* ── Mobile: Card list ── */}
        <div className="sm:hidden">
          {sortedProjetos.length === 0 ? (
            <div className="card-glass flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,200,240,0.08)', border: '1px dashed rgba(0,200,240,0.25)' }}>
                <GanttChart className="h-5 w-5 text-brand-cyan opacity-60" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">Nenhum projeto com datas</p>
              <p className="text-xs text-text-muted mt-1">Adicione datas de inicio e entrega aos projetos</p>
            </div>
          ) : (
            <StaggerContainer className="space-y-2.5">
              {sortedProjetos.map((p) => (
                <MobileProjectCard key={p.id} projeto={p} />
              ))}
            </StaggerContainer>
          )}
        </div>

        {/* ── Desktop: Gantt chart ── */}
        <div className="hidden sm:block">
          <StaggerItem>
            <div className="card-glass overflow-x-auto">
              {/* Month headers */}
              <div className="flex items-center gap-3 mb-2 px-3">
                <div className="w-44 shrink-0" />
                <div className="flex-1 relative h-6">
                  {monthHeaders.map((h, i) => (
                    <span key={i} className="absolute text-[10px] text-text-muted font-semibold uppercase tracking-wider whitespace-nowrap" style={{ left: `${h.leftPct}%` }}>
                      {h.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Today line */}
              <div className="relative">
                <div className="absolute inset-y-0 flex w-full pointer-events-none z-10">
                  <div className="w-44 shrink-0" />
                  <div className="flex-1 relative">
                    <div
                      className="absolute top-0 bottom-0 w-px"
                      style={{
                        left: `${todayPct}%`,
                        background: '#00C8F0',
                        opacity: 0.5,
                      }}
                    />
                    <div
                      className="absolute w-2 h-2 rounded-full bg-brand-cyan"
                      style={{ left: `calc(${todayPct}% - 4px)`, top: -1 }}
                    />
                  </div>
                </div>

                <div className="px-3">
                  {sortedProjetos.map((p) => (
                    <GanttBar key={p.id} projeto={p} minDate={minDate} totalDays={totalDays} />
                  ))}
                </div>

                {sortedProjetos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,200,240,0.08)', border: '1px dashed rgba(0,200,240,0.25)' }}>
                      <GanttChart className="h-5 w-5 text-brand-cyan opacity-60" />
                    </div>
                    <p className="text-sm font-semibold text-text-secondary">Nenhum projeto com datas</p>
                    <p className="text-xs text-text-muted mt-0.5">Adicione datas de inicio e entrega aos projetos</p>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>
        </div>
      </div>
    </PageTransition>
  )
}
