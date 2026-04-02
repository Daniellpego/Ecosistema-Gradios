'use client'

import { useState, useMemo } from 'react'
import { Filter, Search, Layers } from 'lucide-react'
import { PageTransition } from '@/components/motion'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ProjetoFormDialog } from '@/components/projeto/projeto-form-dialog'
import { useProjetos } from '@/hooks/use-projetos'
import type { Prioridade } from '@/types/database'

export default function KanbanPage() {
  const { data: projetos, isLoading, error } = useProjetos()
  const [filterPrioridade, setFilterPrioridade] = useState<Prioridade | 'all'>('all')
  const [search, setSearch] = useState('')

  const filteredProjetos = useMemo(() => {
    return (projetos ?? []).filter((p) => {
      if (filterPrioridade !== 'all' && p.prioridade !== filterPrioridade) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const titulo = (p.titulo ?? p.nome ?? '').toLowerCase()
        const cliente = (p.cliente ?? '').toLowerCase()
        if (!titulo.includes(q) && !cliente.includes(q)) return false
      }
      return true
    })
  }, [projetos, filterPrioridade, search])

  const totalProjetos = projetos?.length ?? 0
  const visibleCount = filteredProjetos.length

  if (error) {
    return (
      <PageTransition>
        <ErrorState message="Erro ao carregar projetos. Verifique sua conexao." />
      </PageTransition>
    )
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Filters skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 flex-1 max-w-xs" />
            <Skeleton className="h-9 w-40" />
          </div>

          {/* Board skeleton */}
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-px w-full" />
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-5 w-5 text-brand-cyan" />
              <h1 className="text-xl font-bold text-text-primary">Kanban</h1>
            </div>
            <p className="text-sm text-text-secondary">
              {totalProjetos === 0
                ? 'Nenhum projeto cadastrado'
                : visibleCount === totalProjetos
                ? `${totalProjetos} projeto${totalProjetos !== 1 ? 's' : ''} no total`
                : `${visibleCount} de ${totalProjetos} projeto${totalProjetos !== 1 ? 's' : ''}`}
            </p>
          </div>

          <ProjetoFormDialog />
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <Input
              placeholder="Buscar projeto ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-bg-card border-brand-blue-deep/60 focus:border-brand-cyan/60 placeholder:text-text-muted"
            />
          </div>

          {/* Priority filter */}
          <Select value={filterPrioridade} onValueChange={(v) => setFilterPrioridade(v as Prioridade | 'all')}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <Filter className="h-3 w-3 mr-1 text-text-muted" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <KanbanBoard projetos={filteredProjetos} />
      </div>
    </PageTransition>
  )
}
