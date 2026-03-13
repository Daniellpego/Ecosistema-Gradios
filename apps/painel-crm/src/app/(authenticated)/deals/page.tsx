'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, Trophy, RefreshCw, Target, Search, X } from 'lucide-react'
import { z } from 'zod'
import { PageTransition, AnimatedNumber } from '@/components/motion'
import { PageTitle } from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDeals, useCreateDeal, type DealInsert } from '@/hooks/use-deals'
import { useAllLeads } from '@/hooks/use-leads'
import { useToast } from '@/components/toast-provider'
import { formatCurrency, formatDate } from '@/lib/format'
import type { DealStatus, TipoServico } from '@/types/database'

const TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
  setup: 'Setup',
  mensalidade: 'Mensalidade',
  projeto_avulso: 'Projeto Avulso',
  consultoria: 'Consultoria',
  mvp: 'MVP',
}

const STATUS_LABELS: Record<DealStatus, string> = {
  aberto: 'Aberto',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

const STATUS_COLORS: Record<DealStatus, string> = {
  aberto: 'bg-[#00C8F0]/15 text-[#00C8F0] border-[#00C8F0]/30',
  ganho: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  perdido: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
}

const dealFormSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  lead_id: z.string().nullable(),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  mrr: z.number().min(0, 'MRR deve ser positivo'),
  tipo_servico: z.enum(['setup', 'mensalidade', 'projeto_avulso', 'consultoria', 'mvp']).nullable(),
  probabilidade: z.number().min(0).max(100),
  data_previsao_fechamento: z.string().nullable(),
  notas: z.string().nullable(),
})

type DealFormData = z.infer<typeof dealFormSchema>

const initialFormData: DealFormData = {
  titulo: '',
  lead_id: null,
  valor: 0,
  mrr: 0,
  tipo_servico: null,
  probabilidade: 50,
  data_previsao_fechamento: null,
  notas: null,
}

export default function DealsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all')
  const [tipoServicoFilter, setTipoServicoFilter] = useState<TipoServico | 'all'>('all')
  const [formData, setFormData] = useState<DealFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const filters = useMemo(() => ({
    search: search || undefined,
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    tipo_servico: tipoServicoFilter !== 'all' ? [tipoServicoFilter] : undefined,
  }), [search, statusFilter, tipoServicoFilter])

  const { data: deals, isLoading } = useDeals(filters)
  const { data: allLeads } = useAllLeads()
  const createDeal = useCreateDeal()

  const hasFilters = search !== '' || statusFilter !== 'all' || tipoServicoFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setTipoServicoFilter('all')
  }

  const stats = useMemo(() => {
    if (!deals) return { pipeline: 0, ganho: 0, mrr: 0, winRate: 0 }

    const abertos = deals.filter(d => d.status === 'aberto')
    const ganhos = deals.filter(d => d.status === 'ganho')
    const perdidos = deals.filter(d => d.status === 'perdido')
    const fechados = ganhos.length + perdidos.length

    return {
      pipeline: abertos.reduce((sum, d) => sum + d.valor, 0),
      ganho: ganhos.reduce((sum, d) => sum + d.valor, 0),
      mrr: ganhos.reduce((sum, d) => sum + d.mrr, 0),
      winRate: fechados > 0 ? (ganhos.length / fechados) * 100 : 0,
    }
  }, [deals])

  function handleOpenForm() {
    setFormData(initialFormData)
    setFormErrors({})
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = dealFormSchema.safeParse(formData)
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string') {
          errors[key] = issue.message
        }
      }
      setFormErrors(errors)
      return
    }

    const insert: DealInsert = {
      titulo: result.data.titulo,
      lead_id: result.data.lead_id,
      valor: result.data.valor,
      mrr: result.data.mrr,
      tipo_servico: result.data.tipo_servico,
      probabilidade: result.data.probabilidade,
      data_previsao_fechamento: result.data.data_previsao_fechamento,
      notas: result.data.notas,
    }

    createDeal.mutate(insert, {
      onSuccess: () => {
        setFormOpen(false)
        setFormData(initialFormData)
        setFormErrors({})
        addToast('Deal criado com sucesso!', 'success')
      },
    })
  }

  return (
    <PageTransition>
      <PageTitle title="Deals" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Deals</h1>
            <p className="text-sm text-text-secondary mt-1">Pipeline de negociações</p>
          </div>
          <Button onClick={handleOpenForm}>
            <Plus className="h-4 w-4" />
            Novo Deal
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10">
              <TrendingUp className="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Pipeline</p>
              <p className="text-xl font-bold text-text-primary">
                <AnimatedNumber value={stats.pipeline} format={formatCurrency} />
              </p>
            </div>
          </div>
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-positive/10">
              <Trophy className="h-5 w-5 text-status-positive" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Ganho</p>
              <p className="text-xl font-bold text-status-positive">
                <AnimatedNumber value={stats.ganho} format={formatCurrency} />
              </p>
            </div>
          </div>
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10">
              <RefreshCw className="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total MRR</p>
              <p className="text-xl font-bold text-brand-cyan">
                <AnimatedNumber value={stats.mrr} format={formatCurrency} />
              </p>
            </div>
          </div>
          <div className="card-glass flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-warning/10">
              <Target className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Win Rate</p>
              <p className="text-xl font-bold text-status-warning">
                <AnimatedNumber value={stats.winRate} format={(n) => `${n.toFixed(1)}%`} />
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-glass flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as DealStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={tipoServicoFilter}
            onValueChange={(v) => setTipoServicoFilter(v as TipoServico | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo Servico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              <SelectItem value="setup">Setup</SelectItem>
              <SelectItem value="mensalidade">Mensalidade</SelectItem>
              <SelectItem value="projeto_avulso">Projeto Avulso</SelectItem>
              <SelectItem value="consultoria">Consultoria</SelectItem>
              <SelectItem value="mvp">MVP</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-text-secondary hover:text-text-primary">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-blue-deep/30">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Título</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Lead</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Valor</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">MRR</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Status</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Tipo</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Prob.</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Previsão</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Criado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-brand-blue-deep/10">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !deals || deals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-text-secondary">
                    {hasFilters ? 'Nenhum deal encontrado com esses filtros.' : 'Nenhum deal cadastrado.'}
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const lead = allLeads?.find(l => l.id === deal.lead_id)
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => router.push(`/deals/${deal.id}`)}
                      className="border-b border-brand-blue-deep/10 hover:bg-bg-hover/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-text-primary font-medium">{deal.titulo}</td>
                      <td className="py-3 px-4">
                        {lead ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/leads/${lead.id}`)
                            }}
                            className="text-brand-cyan hover:underline text-left"
                          >
                            {lead.nome}
                          </button>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-text-primary">{formatCurrency(deal.valor)}</td>
                      <td className="py-3 px-4 text-right text-text-primary">{formatCurrency(deal.mrr)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${STATUS_COLORS[deal.status]}`}>
                          {STATUS_LABELS[deal.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {deal.tipo_servico ? TIPO_SERVICO_LABELS[deal.tipo_servico] : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-text-primary">{deal.probabilidade}%</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {deal.data_previsao_fechamento ? formatDate(deal.data_previsao_fechamento) : '-'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{formatDate(deal.created_at)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* New Deal Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Setup CRM - Empresa X"
                />
                {formErrors['titulo'] && (
                  <p className="text-xs text-status-negative">{formErrors['titulo']}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead_id">Lead</Label>
                <Select
                  value={formData.lead_id ?? '_none'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, lead_id: v === '_none' ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lead (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Nenhum</SelectItem>
                    {allLeads?.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.nome}{lead.empresa ? ` - ${lead.empresa}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: Number(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                  {formErrors['valor'] && (
                    <p className="text-xs text-status-negative">{formErrors['valor']}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mrr">MRR (R$)</Label>
                  <Input
                    id="mrr"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.mrr || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mrr: Number(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                  {formErrors['mrr'] && (
                    <p className="text-xs text-status-negative">{formErrors['mrr']}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
                  <Select
                    value={formData.tipo_servico ?? '_none'}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_servico: v === '_none' ? null : v as TipoServico }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      <SelectItem value="setup">Setup</SelectItem>
                      <SelectItem value="mensalidade">Mensalidade</SelectItem>
                      <SelectItem value="projeto_avulso">Projeto Avulso</SelectItem>
                      <SelectItem value="consultoria">Consultoria</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="probabilidade">Probabilidade (%)</Label>
                  <Input
                    id="probabilidade"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probabilidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, probabilidade: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))}
                  />
                  {formErrors['probabilidade'] && (
                    <p className="text-xs text-status-negative">{formErrors['probabilidade']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="data_previsao">Data Previsão de Fechamento</Label>
                <Input
                  id="data_previsao"
                  type="date"
                  value={formData.data_previsao_fechamento ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_previsao_fechamento: e.target.value || null }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notas">Notas</Label>
                <textarea
                  id="notas"
                  rows={3}
                  value={formData.notas ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value || null }))}
                  placeholder="Observações sobre o deal..."
                  className="flex w-full rounded-lg border border-brand-blue-deep/30 bg-bg-navy px-3 py-2 text-sm text-text-primary placeholder:text-text-dark focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createDeal.isPending}>
                  {createDeal.isPending ? 'Criando...' : 'Criar Deal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
