'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Calendar, Milestone as MilestoneIcon, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MilestoneBadge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '@/hooks/use-milestones'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatDate, daysUntil } from '@/lib/format'

export function MilestoneList({ projetoId }: { projetoId: string }) {
  const { data: milestones, isLoading } = useMilestones(projetoId)
  const createMilestone = useCreateMilestone()
  const updateMilestone = useUpdateMilestone()
  const deleteMilestone = useDeleteMilestone()
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null)

  function handleCreate() {
    if (!titulo.trim() || !dataPrevista) return
    createMilestone.mutate({
      projeto_id: projetoId,
      titulo: titulo.trim(),
      descricao: null,
      data_prevista: dataPrevista,
      status: 'pendente',
      ordem: (milestones?.length ?? 0) + 1,
    })
    setTitulo('')
    setDataPrevista('')
    setShowForm(false)
  }

  function handleComplete(id: string) {
    updateMilestone.mutate({ id, projeto_id: projetoId, status: 'concluido', data_concluida: new Date().toISOString().split('T')[0] })
  }

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Milestones</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3" /> Adicionar
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-glass space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Titulo</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: MVP entregue" className="mt-1" />
              </div>
              <div>
                <Label>Data Prevista</Label>
                <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(!milestones || milestones.length === 0) && !showForm && (
        <EmptyState icon={MilestoneIcon} title="Nenhum milestone" description="Defina marcos importantes do projeto" />
      )}

      <div className="space-y-2">
        {milestones?.map((m) => {
          const days = daysUntil(m.data_prevista)
          const isLate = days < 0 && m.status !== 'concluido'
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass !p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => m.status !== 'concluido' && handleComplete(m.id)}
                  className={cn(
                    'h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors',
                    m.status === 'concluido'
                      ? 'border-status-positive bg-status-positive/20'
                      : 'border-brand-blue-deep/50 hover:border-brand-cyan'
                  )}
                >
                  {m.status === 'concluido' && <CheckCircle2 className="h-4 w-4 text-status-positive" />}
                </button>
                <div>
                  <p className={cn('text-sm font-medium', m.status === 'concluido' ? 'text-text-muted line-through' : 'text-text-primary')}>
                    {m.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('text-xs flex items-center gap-1', isLate ? 'text-status-negative' : 'text-text-muted')}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(m.data_prevista)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MilestoneBadge status={m.status} />
                <button
                  onClick={() => setDeletingMilestoneId(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-negative transition-all"
                  title="Excluir milestone"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <ConfirmDialog
        open={deletingMilestoneId !== null}
        onOpenChange={(o) => { if (!o) setDeletingMilestoneId(null) }}
        title="Excluir Milestone"
        description="Tem certeza que deseja excluir este milestone? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deletingMilestoneId) {
            deleteMilestone.mutate({ id: deletingMilestoneId, projeto_id: projetoId })
            setDeletingMilestoneId(null)
          }
        }}
        variant="danger"
      />
    </div>
  )
}
