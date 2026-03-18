'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useCreateLead, type LeadInsert } from '@/hooks/use-leads'
import { SETORES, RESPONSAVEIS } from '@/types/database'

const leadSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  setor: z.string().optional(),
  origem: z.string().min(1, 'Origem é obrigatória'),
  valor_estimado: z.number().min(0).optional(),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  temperatura: z.enum(['frio', 'morno', 'quente']).optional(),
  notas: z.string().optional(),
})

interface LeadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LeadForm({ open, onOpenChange, onSuccess }: LeadFormProps) {
  const createLead = useCreateLead()
  const { addToast } = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    nome: '',
    empresa: '',
    whatsapp: '',
    email: '',
    setor: '',
    origem: 'direto',
    valor_estimado: '',
    responsavel: 'Sistema',
    temperatura: 'morno' as 'frio' | 'morno' | 'quente',
    notas: '',
  })

  function resetForm() {
    setForm({
      nome: '',
      empresa: '',
      whatsapp: '',
      email: '',
      setor: '',
      origem: 'direto',
      valor_estimado: '',
      responsavel: 'Sistema',
      temperatura: 'morno' as 'frio' | 'morno' | 'quente',
      notas: '',
    })
    setErrors({})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = leadSchema.safeParse({
      ...form,
      valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : 0,
      email: form.email || undefined,
      setor: form.setor || undefined,
      notas: form.notas || undefined,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field) fieldErrors[String(field)] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    const insert: LeadInsert = {
      nome: parsed.data.nome,
      empresa: parsed.data.empresa,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email || null,
      setor: parsed.data.setor || null,
      origem: parsed.data.origem,
      valor_estimado: parsed.data.valor_estimado ?? 0,
      responsavel: parsed.data.responsavel,
      temperatura: parsed.data.temperatura ?? 'morno',
      notas: parsed.data.notas || null,
      status: 'novo',
    }

    await createLead.mutateAsync(insert)
    resetForm()
    onOpenChange(false)
    onSuccess?.()
    addToast('Lead criado com sucesso!', 'success')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Nome do contato"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            {errors.nome && <p className="text-xs text-status-negative">{errors.nome}</p>}
          </div>

          {/* Empresa */}
          <div className="space-y-1.5">
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              placeholder="Nome da empresa"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            />
            {errors.empresa && <p className="text-xs text-status-negative">{errors.empresa}</p>}
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              placeholder="(41) 99999-9999"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
            {errors.whatsapp && <p className="text-xs text-status-negative">{errors.whatsapp}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-status-negative">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Setor */}
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Select value={form.setor} onValueChange={(v) => setForm({ ...form, setor: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SETORES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Origem */}
            <div className="space-y-1.5">
              <Label>Origem *</Label>
              <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="meta_ads">Meta Ads</SelectItem>
                  <SelectItem value="direto">Direto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Valor Estimado */}
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor Estimado (R$)</Label>
              <Input
                id="valor"
                type="number"
                placeholder="0,00"
                value={form.valor_estimado}
                onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })}
              />
            </div>

            {/* Temperatura */}
            <div className="space-y-1.5">
              <Label>Temperatura</Label>
              <Select value={form.temperatura} onValueChange={(v: string) => setForm((prev) => ({ ...prev, temperatura: v as 'frio' | 'morno' | 'quente' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frio">Frio</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="quente">Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Responsável */}
          <div className="space-y-1.5">
            <Label>Responsável</Label>
            <Select value={form.responsavel} onValueChange={(v) => setForm({ ...form, responsavel: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESPONSAVEIS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas</Label>
            <textarea
              id="notas"
              placeholder="Observações sobre o lead..."
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={2}
              className="flex w-full rounded-[10px] bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-dark focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-colors resize-none"
              style={{ border: '1.5px solid #153B5F' }}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createLead.isPending}>
            {createLead.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar Lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
