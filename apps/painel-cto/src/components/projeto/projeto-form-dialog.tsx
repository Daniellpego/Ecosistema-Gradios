'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useCreateProjeto, useUpdateProjeto } from '@/hooks/use-projetos'
import { CATEGORIA_LABELS } from '@/lib/kanban-config'
import type { Projeto, Prioridade, Categoria } from '@/types/database'

interface ProjetoFormDialogProps {
  projeto?: Projeto
  trigger?: ReactNode
}

export function ProjetoFormDialog({ projeto, trigger }: ProjetoFormDialogProps) {
  const isEdit = !!projeto
  const [open, setOpen] = useState(false)
  const createProjeto = useCreateProjeto()
  const updateProjeto = useUpdateProjeto()

  const [nome, setNome] = useState('')
  const [cliente, setCliente] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<Prioridade>('media')
  const [categoria, setCategoria] = useState<Categoria>('projeto_avulso')
  const [valor, setValor] = useState('')
  const [dataEntrega, setDataEntrega] = useState('')

  useEffect(() => {
    if (open && isEdit && projeto) {
      setNome(projeto.nome)
      setCliente(projeto.cliente ?? '')
      setDescricao(projeto.descricao ?? '')
      setPrioridade(projeto.prioridade)
      setCategoria(projeto.categoria ?? 'projeto_avulso')
      setValor(projeto.valor != null ? String(projeto.valor) : '')
      setDataEntrega(projeto.data_entrega ?? projeto.prazo ?? '')
    }
    if (!open && !isEdit) {
      resetForm()
    }
  }, [open, isEdit, projeto])

  function resetForm() {
    setNome('')
    setCliente('')
    setDescricao('')
    setPrioridade('media')
    setCategoria('projeto_avulso')
    setValor('')
    setDataEntrega('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    if (isEdit && projeto) {
      updateProjeto.mutate(
        {
          id: projeto.id,
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          cliente: cliente.trim() || null,
          valor: valor ? Number(valor) : null,
          data_entrega: dataEntrega || null,
          prioridade,
          categoria,
        },
        {
          onSuccess: () => {
            setOpen(false)
          },
        }
      )
    } else {
      createProjeto.mutate(
        {
          nome: nome.trim(),
          titulo: null,
          deal_id: null,
          descricao: descricao.trim() || null,
          cliente: cliente.trim() || null,
          status: 'backlog',
          valor: valor ? Number(valor) : null,
          prazo: null,
          data_inicio: new Date().toISOString().split('T')[0] ?? null,
          data_entrega: dataEntrega || null,
          responsavel: null,
          tags: null,
          prioridade,
          categoria,
          cor: null,
          user_id: null,
        },
        {
          onSuccess: () => {
            resetForm()
            setOpen(false)
          },
        }
      )
    }
  }

  const isPending = isEdit ? updateProjeto.isPending : createProjeto.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> Novo Projeto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Projeto *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: App Mobile BG" className="mt-1" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cliente</Label>
              <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" className="mt-1" />
            </div>
            <div>
              <Label>Valor</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium">R$</span>
                <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className="pl-10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={(v) => setPrioridade(v as Prioridade)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Data de Entrega</Label>
            <Input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label>Descrição</Label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição do projeto..."
              rows={3}
              className="mt-1 w-full rounded-lg bg-bg-input border border-brand-blue-deep/30 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan/50 resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={!nome.trim() || isPending}>
              {isEdit
                ? (isPending ? 'Salvando...' : 'Salvar Alterações')
                : (isPending ? 'Criando...' : 'Criar Projeto')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
