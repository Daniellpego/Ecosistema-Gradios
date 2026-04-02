'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Tarefa, TarefaInsert } from '@/types/database'
import { toast } from 'sonner'

export function useTarefas(projetoId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['tarefas', projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('ordem', { ascending: true })
      if (error) throw error
      return data as Tarefa[]
    },
    enabled: !!projetoId,
  })
}

export function useTarefaCount(projetoId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['tarefa-count', projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tarefas')
        .select('id, status')
        .eq('projeto_id', projetoId)
      if (error) throw error
      const total = data.length
      const done = data.filter((t) => t.status === 'done').length
      return { total, done }
    },
    enabled: !!projetoId,
  })
}

export function useCreateTarefa() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async (tarefa: TarefaInsert) => {
      const { data, error } = await supabase
        .from('tarefas')
        .insert(tarefa as unknown as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as Tarefa
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tarefas', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['tarefa-count', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['projetos'] })
      toast.success('Tarefa criada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar tarefa')
    },
  })
}

export function useUpdateTarefa() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tarefa> & { id: string; projeto_id: string }) => {
      const { data, error } = await supabase
        .from('tarefas')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Tarefa
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tarefas', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['tarefa-count', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['projetos'] })
      toast.success('Tarefa atualizada')
    },
    onError: () => {
      toast.error('Erro ao atualizar tarefa')
    },
  })
}

export function useDeleteTarefa() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase.from('tarefas').delete().eq('id', id)
      if (error) throw error
      return { projeto_id }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tarefas', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['tarefa-count', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['projetos'] })
      toast.success('Tarefa removida')
    },
    onError: () => {
      toast.error('Erro ao remover tarefa')
    },
  })
}
