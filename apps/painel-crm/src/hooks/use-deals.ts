'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { usePeriod } from '@/providers/period-provider'
import type { Deal, DealStatus, TipoServico } from '@/types/database'

export interface DealInsert {
  titulo: string
  lead_id?: string | null
  valor: number
  mrr?: number
  status?: DealStatus
  tipo_servico?: TipoServico | null
  probabilidade?: number
  data_previsao_fechamento?: string | null
  notas?: string | null
  categoria?: string | null
}

export function useDeals(filters?: {
  status?: DealStatus[]
  tipo_servico?: TipoServico[]
  search?: string
}) {
  const { startDate, endDate } = usePeriod()
  const supabase = createClient()

  return useQuery({
    queryKey: ['deals', startDate, endDate, filters],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters?.tipo_servico && filters.tipo_servico.length > 0) {
        query = query.in('tipo_servico', filters.tipo_servico)
      }
      if (filters?.search) {
        query = query.ilike('titulo', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Deal[]
    },
  })
}

export function useDealById(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Deal
    },
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (deal: DealInsert) => {
      const { data, error } = await supabase
        .from('deals')
        .insert(deal as unknown as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data as Deal
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      if (data.lead_id) {
        queryClient.invalidateQueries({ queryKey: ['lead-deals', data.lead_id] })
      }
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DealInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Deal
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      queryClient.invalidateQueries({ queryKey: ['deal', data.id] })
      if (data.lead_id) {
        queryClient.invalidateQueries({ queryKey: ['lead-deals', data.lead_id] })
      }
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('deals')
        .select('lead_id')
        .eq('id', id)
        .single()

      if (error) throw error
      const leadId = (data as { lead_id: string | null }).lead_id

      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return { leadId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      if (result.leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead-deals', result.leadId] })
      }
    },
  })
}

export function useDealActivities(dealId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['deal-activities', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('deal_id', dealId)
        .order('data', { ascending: false })

      if (error) throw error
      return data as Array<{
        id: string
        lead_id: string | null
        deal_id: string | null
        tipo: string
        descricao: string
        data: string
        autor: string
        created_at: string
      }>
    },
    enabled: !!dealId,
  })
}
