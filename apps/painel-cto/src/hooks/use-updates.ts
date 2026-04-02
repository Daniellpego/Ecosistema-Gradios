'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProjectUpdate, UpdateInsert, UpdateWithProjeto } from '@/types/database'
import { toast } from 'sonner'

export function useUpdates(projetoId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['updates', projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as ProjectUpdate[]
    },
    enabled: !!projetoId,
  })
}

export function useGlobalUpdates(limit = 10) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['updates-global', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*, projetos!inner(titulo)')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data as UpdateWithProjeto[]).map((u) => ({
        ...u,
        projeto_titulo: u.projetos.titulo ?? 'Sem titulo',
      }))
    },
  })
}

export function usePortalUpdates(limit = 20) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['updates-portal', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*, projetos!inner(titulo)')
        .eq('visivel_socio', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data as UpdateWithProjeto[]).map((u) => ({
        ...u,
        projeto_titulo: u.projetos.titulo ?? 'Sem titulo',
      }))
    },
  })
}

export function useCreateUpdate() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async (update: UpdateInsert) => {
      const { data, error } = await supabase
        .from('project_updates')
        .insert(update as unknown as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as ProjectUpdate
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['updates', data.projeto_id] })
      qc.invalidateQueries({ queryKey: ['updates-global'] })
      qc.invalidateQueries({ queryKey: ['updates-portal'] })
      toast.success('Update criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar update')
    },
  })
}
