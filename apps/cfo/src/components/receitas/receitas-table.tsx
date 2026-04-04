'use client'

import { useState } from 'react'
import { Pencil, Trash2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteReceita } from '@/hooks/use-receitas'
import type { Receita, ReceitaTipo, ReceitaStatus } from '@/types/database'

const STATUS_CONFIG: Record<ReceitaStatus, { label: string; color: string }> = {
  previsto: { label: 'Previsto', color: 'bg-status-warning/20 text-status-warning' },
  confirmado: { label: 'Confirmado', color: 'bg-status-positive/20 text-status-positive' },
  cancelado: { label: 'Cancelado', color: 'bg-status-negative/20 text-status-negative' },
}

const TIPO_LABELS: Record<ReceitaTipo, string> = {
  setup: 'Setup',
  mensalidade: 'Mensalidade',
  projeto_avulso: 'Projeto Avulso',
  consultoria: 'Consultoria',
  mvp: 'MVP',
  outro: 'Outro',
}

interface ReceitasTableProps {
  receitas: Receita[] | undefined
  isLoading: boolean
  onEdit: (receita: Receita) => void
}

export function ReceitasTable({ receitas, isLoading, onEdit }: ReceitasTableProps) {
  const deleteMutation = useDeleteReceita()
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = receitas?.filter((r) => {
    if (filterTipo !== 'all' && r.tipo !== filterTipo) return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    return true
  }) ?? []

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="card-glass space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 sm:flex-none sm:w-40">
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 sm:flex-none sm:w-40">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="card-glass py-12 text-center text-text-secondary text-sm">
            Nenhuma receita encontrada neste período.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="card-glass p-3.5 active:scale-[0.99] transition-transform cursor-pointer"
              onClick={() => onEdit(r)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-text-primary truncate">{r.cliente}</span>
                    {r.recorrente && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan shrink-0">
                        <RefreshCw className="h-2.5 w-2.5" /> REC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span>{formatDate(r.data)}</span>
                    <span className="text-slate-300">&middot;</span>
                    <span>{TIPO_LABELS[r.tipo]}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-status-positive">{formatCurrency(r.valor_bruto)}</p>
                  <span className={cn(
                    'inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5',
                    STATUS_CONFIG[r.status].color
                  )}>
                    {STATUS_CONFIG[r.status].label}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => onEdit(r)}>
                  <Pencil className="h-3 w-3" /> Editar
                </Button>
                <Button
                  variant={deleteConfirm === r.id ? 'destructive' : 'ghost'}
                  size="sm"
                  className="h-7 text-[11px] gap-1"
                  onClick={() => handleDelete(r.id)}
                >
                  <Trash2 className="h-3 w-3" /> {deleteConfirm === r.id ? 'Confirmar' : 'Excluir'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="card-glass overflow-x-auto p-0 hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-text-secondary font-medium text-xs">Data</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium text-xs">Cliente</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium text-xs">Tipo</th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium text-xs">Valor Bruto</th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium text-xs hidden md:table-cell">Taxas</th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium text-xs hidden lg:table-cell">Líquido</th>
              <th className="text-center py-3 px-4 text-text-secondary font-medium text-xs">Status</th>
              <th className="text-center py-3 px-4 text-text-secondary font-medium text-xs w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-text-secondary">
                  Nenhuma receita encontrada neste período.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => onEdit(r)}
                >
                  <td className="py-3 px-4 text-text-primary text-xs">{formatDate(r.data)}</td>
                  <td className="py-3 px-4 text-text-primary font-medium">
                    {r.cliente}
                    {r.recorrente && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan">
                        <RefreshCw className="h-2.5 w-2.5" /> REC
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{TIPO_LABELS[r.tipo]}</td>
                  <td className="py-3 px-4 text-right text-status-positive font-medium">
                    {formatCurrency(r.valor_bruto)}
                  </td>
                  <td className="py-3 px-4 text-right text-text-secondary hidden md:table-cell">
                    {formatCurrency(r.taxas)}
                  </td>
                  <td className="py-3 px-4 text-right text-text-primary font-medium hidden lg:table-cell">
                    {formatCurrency(r.valor_liquido)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'inline-block text-[11px] font-semibold px-2 py-1 rounded-full',
                      STATUS_CONFIG[r.status].color
                    )}>
                      {STATUS_CONFIG[r.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={deleteConfirm === r.id ? 'destructive' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
