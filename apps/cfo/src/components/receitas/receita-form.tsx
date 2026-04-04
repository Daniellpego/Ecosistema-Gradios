'use client'

import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { Loader2, Calendar, Repeat } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCreateReceita, useCreateReceitasBatch, useUpdateReceita, useClientesSuggestions, type ReceitaInsert } from '@/hooks/use-receitas'
import type { Receita, ReceitaTipo, ReceitaStatus } from '@/types/database'

const receitaSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  descricao: z.string().nullable().optional(),
  tipo: z.enum(['setup', 'mensalidade', 'projeto_avulso', 'consultoria', 'mvp', 'outro'] as const),
  valor_bruto: z.number().min(0, 'Valor deve ser positivo'),
  taxas: z.number().min(0).default(0),
  recorrente: z.boolean(),
  status: z.enum(['previsto', 'confirmado', 'cancelado'] as const),
  categoria: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  nf_numero: z.string().nullable().optional(),
  nf_chave_acesso: z.string().nullable().optional().refine(
    (val) => !val || val.length === 44,
    { message: 'Chave de acesso deve ter 44 dígitos' }
  ),
})

const TIPO_LABELS: Record<ReceitaTipo, string> = {
  setup: 'Setup',
  mensalidade: 'Mensalidade (MRR)',
  projeto_avulso: 'Projeto Avulso',
  consultoria: 'Consultoria',
  mvp: 'MVP',
  outro: 'Outro',
}

const STATUS_LABELS: Record<ReceitaStatus, string> = {
  previsto: 'Previsto',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
}

interface ReceitaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receita?: Receita | null
}

export function ReceitaForm({ open, onOpenChange, receita }: ReceitaFormProps) {
  const createMutation = useCreateReceita()
  const createBatchMutation = useCreateReceitasBatch()
  const updateMutation = useUpdateReceita()
  const { data: clientes } = useClientesSuggestions()
  const isEditing = !!receita

  const [form, setForm] = useState({
    data: '',
    cliente: '',
    descricao: '',
    tipo: 'mensalidade' as ReceitaTipo,
    valor_bruto: '',
    taxas: '0',
    recorrente: true,
    status: 'previsto' as ReceitaStatus,
    categoria: '',
    observacoes: '',
    nf_numero: '',
    nf_chave_acesso: '',
    duracao_meses: '1',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuggestions, setShowSuggestions] = useState(false)

  const duracaoPreview = useMemo(() => {
    const duracao = parseInt(form.duracao_meses) || 1
    if (duracao <= 1 || !form.data) return []
    const baseDate = new Date(form.data + 'T12:00:00')
    const months: string[] = []
    for (let i = 0; i < duracao; i++) {
      const d = new Date(baseDate)
      d.setMonth(d.getMonth() + i)
      months.push(d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }))
    }
    return months
  }, [form.data, form.duracao_meses])

  useEffect(() => {
    if (receita) {
      setForm({
        data: receita.data,
        cliente: receita.cliente,
        descricao: receita.descricao ?? '',
        tipo: receita.tipo,
        valor_bruto: String(receita.valor_bruto),
        taxas: String(receita.taxas),
        recorrente: receita.recorrente,
        status: receita.status,
        categoria: receita.categoria ?? '',
        observacoes: receita.observacoes ?? '',
        nf_numero: (receita as unknown as Record<string, unknown>).nf_numero as string ?? '',
        nf_chave_acesso: (receita as unknown as Record<string, unknown>).nf_chave_acesso as string ?? '',
        duracao_meses: '1',
      })
    } else {
      setForm({
        data: new Date().toISOString().split('T')[0] ?? '',
        cliente: '',
        descricao: '',
        tipo: 'mensalidade',
        valor_bruto: '',
        taxas: '0',
        recorrente: true,
        status: 'previsto',
        categoria: '',
        observacoes: '',
        nf_numero: '',
        nf_chave_acesso: '',
        duracao_meses: '1',
      })
    }
    setErrors({})
  }, [receita, open])

  const filteredClientes = clientes?.filter((c) =>
    c.toLowerCase().includes(form.cliente.toLowerCase()) && c !== form.cliente
  ) ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsed = receitaSchema.safeParse({
      ...form,
      valor_bruto: parseFloat(form.valor_bruto) || 0,
      taxas: parseFloat(form.taxas) || 0,
      descricao: form.descricao || null,
      categoria: form.categoria || null,
      observacoes: form.observacoes || null,
      nf_numero: form.nf_numero || null,
      nf_chave_acesso: form.nf_chave_acesso || null,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        const key = err.path[0]
        if (typeof key === 'string') fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    const payload: ReceitaInsert = parsed.data
    const duracao = parseInt(form.duracao_meses) || 1

    try {
      if (isEditing && receita) {
        await updateMutation.mutateAsync({ id: receita.id, ...payload })
      } else if (form.recorrente && duracao > 1) {
        await createBatchMutation.mutateAsync({ receita: payload, duracaoMeses: duracao })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      setErrors({ _form: 'Erro ao salvar. Tente novamente.' })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || createBatchMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
            {errors.data && <p className="text-xs text-status-negative">{errors.data}</p>}
          </div>

          {/* Cliente with autocomplete */}
          <div className="space-y-1.5 relative">
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              placeholder="Nome do cliente"
              value={form.cliente}
              onChange={(e) => {
                setForm({ ...form, cliente: e.target.value })
                setShowSuggestions(true)
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && filteredClientes.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-bg-card border border-brand-blue-deep/30 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {filteredClientes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-hover"
                    onMouseDown={() => {
                      setForm({ ...form, cliente: c })
                      setShowSuggestions(false)
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {errors.cliente && <p className="text-xs text-status-negative">{errors.cliente}</p>}
          </div>

          {/* Tipo + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => {
                const tipo = v as ReceitaTipo
                setForm({ ...form, tipo, recorrente: tipo === 'mensalidade' })
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ReceitaStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor Bruto + Taxas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor_bruto">Valor Bruto (R$)</Label>
              <Input
                id="valor_bruto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.valor_bruto}
                onChange={(e) => setForm({ ...form, valor_bruto: e.target.value })}
              />
              {errors.valor_bruto && <p className="text-xs text-status-negative">{errors.valor_bruto}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxas">Taxas (R$)</Label>
              <Input
                id="taxas"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.taxas}
                onChange={(e) => setForm({ ...form, taxas: e.target.value })}
              />
            </div>
          </div>

          {/* Recorrente toggle (MRR) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="recorrente">Receita Recorrente (MRR)</Label>
              <Switch
                id="recorrente"
                checked={form.recorrente}
                onCheckedChange={(checked) => setForm({ ...form, recorrente: checked })}
              />
            </div>
            <p className="text-[11px] text-text-secondary">
              {form.recorrente
                ? 'Esta receita será contabilizada no MRR (Monthly Recurring Revenue).'
                : 'Ative para incluir no cálculo de MRR.'}
            </p>
            {form.tipo === 'mensalidade' && !form.recorrente && (
              <p className="text-[11px] text-status-warning">
                Atenção: receitas do tipo Mensalidade geralmente são recorrentes (MRR).
              </p>
            )}
            {form.tipo !== 'mensalidade' && form.recorrente && (
              <p className="text-[11px] text-status-warning">
                Atenção: esta receita será contada como MRR mesmo não sendo do tipo Mensalidade.
              </p>
            )}
          </div>

          {/* Duração do contrato (apenas para recorrente e criação) */}
          {form.recorrente && !isEditing && (
            <div className="space-y-2 rounded-xl bg-brand-cyan/5 border border-brand-cyan/15 p-3">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-brand-cyan" />
                <Label htmlFor="duracao_meses" className="text-sm font-semibold text-text-primary">
                  Duração do contrato
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={form.duracao_meses}
                  onValueChange={(v) => setForm({ ...form, duracao_meses: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n === 1 ? 'Apenas este mês' : `${n} meses`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {duracaoPreview.length > 1 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-text-secondary flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Receitas serão criadas automaticamente:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {duracaoPreview.map((month, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan text-[11px] font-medium"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Input
              id="descricao"
              placeholder="Descrição do serviço"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria (opcional)</Label>
            <Input
              id="categoria"
              placeholder="ex: automacao, software"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            />
          </div>

          {/* NF-e */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nf_numero">Nº NF-e (opcional)</Label>
              <Input
                id="nf_numero"
                placeholder="Nº da NF-e"
                value={form.nf_numero}
                onChange={(e) => setForm({ ...form, nf_numero: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nf_chave">Chave de Acesso (opcional)</Label>
              <Input
                id="nf_chave"
                placeholder="44 dígitos"
                maxLength={44}
                value={form.nf_chave_acesso}
                onChange={(e) => setForm({ ...form, nf_chave_acesso: e.target.value })}
              />
              {errors.nf_chave_acesso && <p className="text-xs text-status-negative">{errors.nf_chave_acesso}</p>}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <textarea
              id="observacoes"
              rows={2}
              placeholder="Notas adicionais..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              className="flex w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-slate-400 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 resize-none transition-all duration-200 shadow-sm"
            />
          </div>

          {errors._form && (
            <p className="text-sm text-status-negative text-center">{errors._form}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
