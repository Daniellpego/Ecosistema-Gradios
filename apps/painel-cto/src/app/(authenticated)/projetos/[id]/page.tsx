'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, User, Tag, Clock } from 'lucide-react'
import { PageTransition, StaggerItem } from '@/components/motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StatusBadge, PrioridadeBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskBoard } from '@/components/projeto/task-board'
import { MilestoneList } from '@/components/projeto/milestone-list'
import { UpdateFeed } from '@/components/projeto/update-feed'
import { useProjeto } from '@/hooks/use-projetos'
import { getProjetoTitulo, getProjetoEntrega } from '@/types/database'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'
import { normalizeColor, cn } from '@/lib/utils'

export default function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: projeto, isLoading } = useProjeto(id)

  if (isLoading || !projeto) {
    return (
      <PageTransition>
        <div className="space-y-5">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-10 w-80 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </PageTransition>
    )
  }

  const color = normalizeColor(projeto.cor)
  const entrega = getProjetoEntrega(projeto)
  const days = entrega ? daysUntil(entrega) : null
  const isLate = days !== null && days < 0

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Back link */}
        <Link href="/kanban" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-cyan transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Voltar ao Kanban
        </Link>

        {/* Project header card */}
        <StaggerItem>
          <div className="card-glass relative overflow-hidden">
            {/* Top glow line with project color */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent 10%, ${color} 50%, transparent 90%)` }}
            />
            {/* Corner glow */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: color }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ background: color, boxShadow: `0 0 10px ${color}50` }}
                  />
                  <h1 className="text-2xl font-bold text-text-primary truncate tracking-tight">{getProjetoTitulo(projeto)}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  <StatusBadge status={projeto.status} />
                  <PrioridadeBadge prioridade={projeto.prioridade} />
                  {projeto.categoria && (
                    <span className="badge-muted flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {projeto.categoria.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-5 text-xs text-text-secondary">
                  {projeto.cliente && (
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{projeto.cliente}</span>
                  )}
                  {projeto.valor && (
                    <span className="flex items-center gap-1.5 font-semibold text-status-positive"><DollarSign className="h-3.5 w-3.5" />{formatCurrency(projeto.valor)}</span>
                  )}
                  {entrega && (
                    <span className={cn('flex items-center gap-1.5 font-medium', isLate ? 'text-status-negative' : '')}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(entrega)}
                      {isLate && <span className="text-[10px] badge-negative ml-1">{Math.abs(days!)}d atrasado</span>}
                    </span>
                  )}
                  {days !== null && !isLate && days <= 7 && (
                    <span className="flex items-center gap-1 text-status-warning font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {days}d restantes
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-44">
                <p className="text-xs text-text-muted mb-2 font-medium">Progresso Geral</p>
                <div className="card-glass !p-3 !bg-bg-navy/40">
                  <div className="text-2xl font-bold mb-2" style={{ color }}>{projeto.progresso}%</div>
                  <Progress value={projeto.progresso} />
                </div>
              </div>
            </div>

            {projeto.descricao && (
              <p className="text-sm text-text-secondary mt-5 border-t border-brand-blue-deep/20 pt-4 leading-relaxed">
                {projeto.descricao}
              </p>
            )}
          </div>
        </StaggerItem>

        {/* Tabs */}
        <Tabs defaultValue="tarefas">
          <TabsList>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="tarefas">
            <TaskBoard projetoId={id} />
          </TabsContent>

          <TabsContent value="milestones">
            <MilestoneList projetoId={id} />
          </TabsContent>

          <TabsContent value="updates">
            <UpdateFeed projetoId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
