'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import { TrendingUp, Plus, DollarSign, Users, RefreshCw, BarChart3 } from 'lucide-react'
import { useReceitas, useReceitasAno, useReceitasMesAnterior } from '@/hooks/use-receitas'
import { ReceitaForm } from '@/components/receitas/receita-form'
import { ReceitasTable } from '@/components/receitas/receitas-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/motion'
import { EmptyState } from '@/components/ui/empty-state'
import type { Receita } from '@/types/database'

export default function ReceitasPage() {
  useEffect(() => {
    document.title = 'Receitas | Gradios CFO'
  }, [])

  const { data: receitas, isLoading } = useReceitas()
  const { data: receitasAno } = useReceitasAno()
  const { data: receitasPrev } = useReceitasMesAnterior()
  const [formOpen, setFormOpen] = useState(false)
  const [editReceita, setEditReceita] = useState<Receita | null>(null)

  const kpis = useMemo(() => {
    const confirmed = receitas?.filter((r) => r.status === 'confirmado') ?? []
    const confirmedAno = receitasAno?.filter((r) => r.status === 'confirmado') ?? []
    const confirmedPrev = receitasPrev?.filter((r) => r.status === 'confirmado') ?? []

    const totalMes = confirmed.reduce((s, r) => s + Number(r.valor_bruto), 0)
    const totalAno = confirmedAno.reduce((s, r) => s + Number(r.valor_bruto), 0)
    const mrr = confirmed.filter((r) => r.recorrente).reduce((s, r) => s + Number(r.valor_bruto), 0)
    const totalPrev = confirmedPrev.reduce((s, r) => s + Number(r.valor_bruto), 0)
    const crescimento = totalPrev > 0 ? ((totalMes - totalPrev) / totalPrev) * 100 : 0
    const clientesAtivos = new Set(confirmed.map((r) => r.cliente)).size

    return { totalMes, totalAno, mrr, crescimento, clientesAtivos }
  }, [receitas, receitasAno, receitasPrev])

  function handleEdit(receita: Receita) {
    setEditReceita(receita)
    setFormOpen(true)
  }

  function handleNew() {
    setEditReceita(null)
    setFormOpen(true)
  }

  const cards = [
    { label: 'Receita do Mês', value: formatCurrency(kpis.totalMes), icon: DollarSign, color: 'text-status-positive' },
    { label: 'Receita do Ano', value: formatCurrency(kpis.totalAno), icon: BarChart3, color: 'text-status-positive' },
    { label: 'MRR', value: formatCurrency(kpis.mrr), icon: RefreshCw, color: 'text-brand-cyan' },
    { label: 'Crescimento', value: formatPercent(kpis.crescimento), icon: TrendingUp, color: kpis.crescimento >= 0 ? 'text-status-positive' : 'text-status-negative' },
    { label: 'Clientes Ativos', value: String(kpis.clientesAtivos), icon: Users, color: 'text-brand-cyan' },
  ]

  return (
    <PageTransition>
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Receitas</h1>
          <p className="text-xs sm:text-sm text-text-muted font-medium hidden sm:block">Gestão de entradas, faturamento recorrente e análise de crescimento.</p>
        </div>
        <Button onClick={handleNew} size="sm" className="shadow-sm shrink-0 sm:hidden">
          <Plus className="h-4 w-4" />
          Nova
        </Button>
        <Button onClick={handleNew} className="shadow-sm shrink-0 hidden sm:inline-flex">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card-glass">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-7 w-28" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className={cn('h-4 w-4', card.color)} />
                  <span className="text-xs text-text-secondary">{card.label}</span>
                </div>
                <p className={cn('text-lg font-bold', card.color)}>{card.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && (!receitas || receitas.length === 0) && (
        <EmptyState 
          title="Nenhuma receita cadastrada" 
          description="Registre sua primeira entrada para começar a acompanhar o faturamento da empresa."
          className="card-glass py-20"
          action={{
            label: "Cadastrar Primeira Receita",
            onClick: handleNew
          }}
        />
      )}

      {/* Table */}
      {(isLoading || (receitas && receitas.length > 0)) && (
        <ReceitasTable receitas={receitas} isLoading={isLoading} onEdit={handleEdit} />
      )}

      {/* Form Modal */}
      <ReceitaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        receita={editReceita}
      />
    </div>
    </PageTransition>
  )
}

