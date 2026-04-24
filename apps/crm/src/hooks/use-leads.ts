'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { usePeriod } from '@/providers/period-provider'
import type { Lead, LeadStatus, LeadTemperatura } from '@/types/database'

export interface LeadInsert {
  nome: string
  empresa?: string | null
  email?: string | null
  telefone?: string | null
  whatsapp?: string | null
  setor?: string | null
  origem: string
  status?: LeadStatus
  temperatura?: LeadTemperatura
  valor_estimado?: number
  responsavel?: string
  notas?: string | null
  tags?: string[]
  proximo_followup?: string | null
}

export function useLeads(filters?: {
  status?: LeadStatus[]
  origem?: string[]
  temperatura?: LeadTemperatura[]
  search?: string
  responsavel?: string
}) {
  const { startDate, endDate } = usePeriod()
  const supabase = createClient()

  return useQuery({
    queryKey: ['leads', startDate, endDate, filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z')
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters?.origem && filters.origem.length > 0) {
        query = query.in('origem', filters.origem)
      }
      if (filters?.temperatura && filters.temperatura.length > 0) {
        query = query.in('temperatura', filters.temperatura)
      }
      if (filters?.responsavel) {
        query = query.eq('responsavel', filters.responsavel)
      }
      if (filters?.search) {
        query = query.or(
          `nome.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%`
        )
      }

      query = query.limit(200)

      const { data, error } = await query
      if (error) throw error
      return data as Lead[]
    },
  })
}

export function useAllLeads() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['leads-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error
      return data as Lead[]
    },
  })
}

export function useLeadById(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Lead
    },
    enabled: !!id,
  })
}

export function useLeadQuiz(leadId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lead-quiz', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead as unknown as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data as Lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads-all'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Lead
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads-all'] })
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads-all'] })
    },
  })
}

export function useLeadActivities(leadId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('lead_id', leadId)
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
    enabled: !!leadId,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (activity: {
      lead_id: string
      deal_id?: string | null
      tipo: string
      descricao: string
      autor: string
    }) => {
      const { data, error } = await supabase
        .from('atividades')
        .insert(activity as unknown as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', variables.lead_id] })
    },
  })
}

export function useLeadDeals(leadId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lead-deals', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}

export function usePipelineLeads() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['pipeline-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .not('status', 'eq', 'fechado_perdido')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      return data as Lead[]
    },
  })
}
