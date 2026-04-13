'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  return (
    <Suspense fallback={<KanbanSkeleton />}>
      <KanbanContent />
    </Suspense>
  )
}

function KanbanSkeleton() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1 max-w-xs" />
          <Skeleton className="h-9 w-40" />
        </div>
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

function KanbanContent() {
  const { data: projetos, isLoading, error } = useProjetos()
  const searchParams = useSearchParams()
  const router = useRouter()

  const filterPrioridade = (searchParams.get('prioridade') ?? 'all') as Prioridade | 'all'
  const search = searchParams.get('q') ?? ''

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all' && value !== '') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`/kanban?${params.toString()}`, { scroll: false })
  }

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
    return <KanbanSkeleton />
  }

  return (
    <PageTransition>
      <div className="space-y-3 sm:space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-8 w-8 sm:h-auto sm:w-auto rounded-lg sm:rounded-none flex items-center justify-center sm:block" style={{ background: 'rgba(0,191,255,0.10)' }}>
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-brand-cyan" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">Kanban</h1>
            </div>
            <p className="text-[11px] sm:text-sm text-text-secondary">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => updateParams('q', e.target.value)}
              className="pl-8 h-9 text-xs"
              aria-label="Buscar projetos por nome ou cliente"
            />
          </div>

          {/* Priority filter */}
          <Select value={filterPrioridade} onValueChange={(v) => updateParams('prioridade', v)}>
            <SelectTrigger className="w-32 sm:w-40 h-9 text-xs shrink-0" aria-label="Filtrar por prioridade">
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
