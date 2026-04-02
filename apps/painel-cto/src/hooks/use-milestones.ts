'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectMilestone, MilestoneInsert, MilestoneWithProjeto } from '@/types/database'
import { toast } from 'sonner'

export function useMilestones(projetoId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['milestones', projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('data_prevista', { ascending: true })
      if (error) throw error
      return data as ProjectMilestone[]
    },
    enabled: !!projetoId,
  })
}

export function useAllMilestones(dateRange?: { start: string; end: string }) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['milestones-all', dateRange?.start, dateRange?.end],
    queryFn: async () => {
      let query = supabase
        .from('project_milestones')
        .select('*, projetos!inner(titulo, cor)')
        .neq('status', 'concluido')
        .order('data_prevista', { ascending: true })

      if (dateRange) {
        query = query.gte('data_prevista', dateRange.start).lte('data_prevista', dateRange.end)
      }

      const { data, error } = await query
      if (error) throw error
      return data as MilestoneWithProjeto[]
    },
  })
}

export function useCreateMilestone() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async (milestone: MilestoneInsert) => {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert(milestone as unknown as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as ProjectMilestone
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['milestones', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['milestones-all'] })
      toast.success('Milestone criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar milestone')
    },
  })
}

export function useUpdateMilestone() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectMilestone> & { id: string; projeto_id: string }) => {
      const { data, error } = await supabase
        .from('project_milestones')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ProjectMilestone
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['milestones', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['milestones-all'] })
      toast.success('Milestone atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar milestone')
    },
  })
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase.from('project_milestones').delete().eq('id', id)
      if (error) throw error
      return { projeto_id }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['milestones', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['milestones-all'] })
      toast.success('Milestone removido')
    },
    onError: () => {
      toast.error('Erro ao remover milestone')
    },
  })
}
