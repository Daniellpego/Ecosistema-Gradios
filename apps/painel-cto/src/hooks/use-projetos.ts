'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { normalizeProjetoStatus, type Projeto, type ProjetoInsert, type ProjetoStatus } from '@/types/database'
import { toast } from 'sonner'

export function useProjetos() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['projetos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .neq('status', 'cancelado')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data as Projeto[]).map((p) => ({ ...p, status: normalizeProjetoStatus(p.status) }))
    },
  })
}

export function useProjetosByStatus(status: ProjetoStatus) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['projetos', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('status', status)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data as Projeto[]).map((p) => ({ ...p, status: normalizeProjetoStatus(p.status) }))
    },
  })
}

export function useProjeto(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['projeto', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      const p = data as Projeto
      return { ...p, status: normalizeProjetoStatus(p.status) }
    },
    enabled: !!id,
  })
}

export function useCreateProjeto() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async (projeto: ProjetoInsert) => {
      const { data, error } = await supabase
        .from('projetos')
        .insert(projeto as unknown as Record<string, unknown>)
        .select()
        .single()
      if (error) throw error
      return data as Projeto
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projetos'] })
      toast.success('Projeto criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar projeto')
    },
  })
}

export function useUpdateProjeto() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Projeto> & { id: string }) => {
      const { data, error } = await supabase
        .from('projetos')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Projeto
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projetos'] })
      qc.invalidateQueries({ queryKey: ['projeto', data.id] })
      toast.success('Projeto atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar projeto')
    },
  })
}

export function useDeleteProjeto() {
  const qc = useQueryClient()
  const supabase = createClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projetos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projetos'] })
      toast.success('Projeto removido')
    },
    onError: () => {
      toast.error('Erro ao remover projeto')
    },
  })
}
