'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { Plus, Users } from 'lucide-react'
import { PageTransition, AnimatedNumber } from '@/components/motion'
import { PageTitle } from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { useLeads } from '@/hooks/use-leads'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadsFilters } from '@/components/leads/leads-filters'
import { LeadForm } from '@/components/leads/lead-form'
import { formatCurrency } from '@/lib/format'
import type { LeadStatus, LeadTemperatura } from '@/types/database'

export default function LeadsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [origemFilter, setOrigemFilter] = useState('all')
  const [temperaturaFilter, setTemperaturaFilter] = useState<LeadTemperatura | 'all'>('all')
  const [responsavelFilter, setResponsavelFilter] = useState('all')

  const filters = useMemo(() => ({
    search: search || undefined,
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    origem: origemFilter !== 'all' ? [origemFilter] : undefined,
    temperatura: temperaturaFilter !== 'all' ? [temperaturaFilter] : undefined,
    responsavel: responsavelFilter !== 'all' ? responsavelFilter : undefined,
  }), [search, statusFilter, origemFilter, temperaturaFilter, responsavelFilter])

  const { data: leads, isLoading } = useLeads(filters)

  const hasFilters = search !== '' || statusFilter !== 'all' || origemFilter !== 'all' || temperaturaFilter !== 'all' || responsavelFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setOrigemFilter('all')
    setTemperaturaFilter('all')
    setResponsavelFilter('all')
  }

  const stats = useMemo(() => {
    if (!leads) return { total: 0, quentes: 0, pipeline: 0 }
    return {
      total: leads.length,
      quentes: leads.filter(l => l.temperatura === 'quente').length,
      pipeline: leads.filter(l => !['fechado_ganho', 'fechado_perdido'].includes(l.status))
        .reduce((sum, l) => sum + l.valor_estimado, 0),
    }
  }, [leads])

  return (
    <PageTransition>
      <PageTitle title="Leads" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
            <p className="text-sm text-text-secondary mt-1">Gerencie todos os seus leads</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10">
              <Users className="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total no Período</p>
              <p className="text-xl font-bold text-text-primary">
                <AnimatedNumber value={stats.total} format={(n) => String(n)} />
              </p>
            </div>
          </div>
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-negative/10">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Leads Quentes</p>
              <p className="text-xl font-bold text-status-negative">
                <AnimatedNumber value={stats.quentes} format={(n) => String(n)} />
              </p>
            </div>
          </div>
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-positive/10">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Pipeline Estimado</p>
              <p className="text-xl font-bold text-status-positive">
                {formatCurrency(stats.pipeline)}
              </p>
            </div>
          </div>
        </div>

        <LeadsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          origemFilter={origemFilter}
          onOrigemChange={setOrigemFilter}
          temperaturaFilter={temperaturaFilter}
          onTemperaturaChange={setTemperaturaFilter}
          responsavelFilter={responsavelFilter}
          onResponsavelChange={setResponsavelFilter}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />

        <LeadsTable leads={leads} isLoading={isLoading} />

        <LeadForm
          open={formOpen}
          onOpenChange={setFormOpen}
        />
      </div>
    </PageTransition>
  )
}
