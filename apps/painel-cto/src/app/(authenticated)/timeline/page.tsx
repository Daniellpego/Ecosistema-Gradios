'use client'

import { useMemo } from 'react'
import { PageTransition } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useProjetos } from '@/hooks/use-projetos'
import { formatDate } from '@/lib/format'
import { getProjetoTitulo, getProjetoEntrega, type Projeto } from '@/types/database'

function GanttBar({ projeto, minDate, totalDays }: { projeto: Projeto; minDate: number; totalDays: number }) {
  const entrega = getProjetoEntrega(projeto)
  const start = projeto.data_inicio ? new Date(projeto.data_inicio + 'T00:00:00').getTime() : Date.now()
  const end = entrega ? new Date(entrega + 'T00:00:00').getTime() : start + 30 * 86400000
  const leftPct = Math.max(0, ((start - minDate) / (totalDays * 86400000)) * 100)
  const widthPct = Math.max(3, ((end - start) / (totalDays * 86400000)) * 100)
  const progressWidth = (projeto.progresso / 100) * widthPct

  return (
    <div className="flex items-center gap-3 py-3 border-b border-brand-blue-deep/20 group" title={`${getProjetoTitulo(projeto)} — ${projeto.cliente ?? ''} — ${projeto.progresso}%`}>
      <div className="w-48 shrink-0">
        <p className="text-sm font-medium text-text-primary truncate" title={getProjetoTitulo(projeto)}>{getProjetoTitulo(projeto)}</p>
        <p className="text-xs text-text-muted">{projeto.cliente ?? '-'}</p>
      </div>
      <div className="flex-1 relative h-10">
        {/* Background bar */}
        <div
          className="absolute top-1 h-8 rounded-lg opacity-20"
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: projeto.cor ?? '#00C8F0' }}
        />
        {/* Progress fill */}
        <div
          className="absolute top-1 h-8 rounded-lg transition-all duration-500"
          style={{ left: `${leftPct}%`, width: `${progressWidth}%`, background: projeto.cor ?? '#00C8F0' }}
        />
        {/* Label */}
        <span
          className={`absolute top-2 text-xs px-2 ${projeto.progresso > 0 ? 'font-bold text-bg-navy' : 'font-medium text-text-muted'}`}
          style={{ left: `${leftPct + 0.5}%` }}
        >
          {projeto.progresso}%
        </span>
      </div>
    </div>
  )
}

export default function TimelinePage() {
  const { data: projetos, isLoading } = useProjetos()

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

    // Month headers
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

  if (isLoading) {
    return (
      <PageTransition>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </PageTransition>
    )
  }

  // Today marker
  const todayPct = ((Date.now() - minDate) / (totalDays * 86400000)) * 100

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Timeline</h1>

        <div className="card-glass overflow-x-auto">
          {/* Month headers — spacer must match GanttBar name column (w-48) */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-48 shrink-0" />
            <div className="flex-1 relative h-6">
              {monthHeaders.map((h, i) => (
                <span key={i} className="absolute text-[10px] text-text-muted font-medium" style={{ left: `${h.leftPct}%` }}>
                  {h.label}
                </span>
              ))}
            </div>
          </div>

          {/* Today line — uses same flex structure as GanttBar to align correctly */}
          <div className="relative">
            <div className="absolute inset-y-0 flex w-full pointer-events-none z-10">
              <div className="w-48 shrink-0 gap-3" />
              <div className="flex-1 relative">
                <div
                  className="absolute top-0 bottom-0 w-px bg-brand-cyan/40"
                  style={{ left: `${todayPct}%` }}
                />
              </div>
            </div>

            {sortedProjetos.map((p) => (
              <GanttBar key={p.id} projeto={p} minDate={minDate} totalDays={totalDays} />
            ))}

            {sortedProjetos.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">Nenhum projeto com datas definidas</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
