'use client'

import { useState } from 'react'
import { Plus, Trash2, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrioridadeBadge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { TASK_COLUMNS } from '@/lib/kanban-config'
import { useTarefas, useCreateTarefa, useUpdateTarefa, useDeleteTarefa } from '@/hooks/use-tarefas'
import type { TarefaStatus } from '@/types/database'

export function TaskBoard({ projetoId }: { projetoId: string }) {
  const { data: tarefas, isLoading } = useTarefas(projetoId)
  const createTarefa = useCreateTarefa()
  const updateTarefa = useUpdateTarefa()
  const deleteTarefa = useDeleteTarefa()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTo, setAddingTo] = useState<TarefaStatus | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  function handleAddTask(status: TarefaStatus) {
    if (!newTaskTitle.trim()) return
    createTarefa.mutate({
      projeto_id: projetoId,
      titulo: newTaskTitle.trim(),
      status,
      prioridade: 'media',
      responsavel: null,
      descricao: null,
      data_limite: null,
      estimativa_horas: null,
      horas_gastas: null,
      ordem: (tarefas?.filter((t) => t.status === status).length ?? 0) + 1,
    })
    setNewTaskTitle('')
    setAddingTo(null)
  }

  function handleMoveTask(taskId: string, newStatus: TarefaStatus) {
    updateTarefa.mutate({ id: taskId, projeto_id: projetoId, status: newStatus })
  }

  if (isLoading) return <div className="grid grid-cols-3 gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div>

  if (!tarefas?.length && !addingTo) {
    return (
      <EmptyState
        icon={ListTodo}
        title="Nenhuma tarefa"
        description="Crie a primeira tarefa deste projeto"
        action={<Button size="sm" onClick={() => setAddingTo('todo')}><Plus className="h-3 w-3" /> Adicionar</Button>}
      />
    )
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {TASK_COLUMNS.map((col) => {
        const columnTasks = (tarefas ?? []).filter((t) => t.status === col.id)
        return (
          <div key={col.id} className="rounded-xl bg-bg-navy/50 border border-brand-blue-deep/30 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-text-primary">{col.label}</span>
                <span className="text-xs text-text-muted">({columnTasks.length})</span>
              </div>
              <button onClick={() => setAddingTo(col.id)} className="text-text-muted hover:text-brand-cyan transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 min-h-[60px]">
              {columnTasks.map((task) => (
                <div key={task.id} className="card-glass !p-3 group">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="text-sm text-text-primary">{task.titulo}</p>
                    <button
                      onClick={() => setDeletingTaskId(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-negative transition-all shrink-0 mt-0.5"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <PrioridadeBadge prioridade={task.prioridade} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {TASK_COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleMoveTask(task.id, c.id)}
                          className="text-[10px] px-1.5 py-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {addingTo === col.id && (
                <div className="card-glass !p-3 space-y-2">
                  <Input
                    placeholder="Titulo da tarefa..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(col.id)}
                    autoFocus
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={() => handleAddTask(col.id)}>Salvar</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddingTo(null); setNewTaskTitle('') }}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>

    <ConfirmDialog
      open={deletingTaskId !== null}
      onOpenChange={(o) => { if (!o) setDeletingTaskId(null) }}
      title="Excluir Tarefa"
      description="Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita."
      confirmLabel="Excluir"
      onConfirm={() => {
        if (deletingTaskId) {
          deleteTarefa.mutate({ id: deletingTaskId, projeto_id: projetoId })
          setDeletingTaskId(null)
        }
      }}
      variant="danger"
    />
    </>
  )
}
