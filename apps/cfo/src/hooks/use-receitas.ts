'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { logAction } from '@/lib/audit-log'
import { usePeriod } from '@/providers/period-provider'
import type { Receita, ReceitaTipo, ReceitaStatus } from '@/types/database'

export interface ReceitaInsert {
  data: string
  cliente: string
  descricao?: string | null
  tipo: ReceitaTipo
  valor_bruto: number
  taxas?: number
  recorrente: boolean
  status: ReceitaStatus
  categoria?: string | null
  observacoes?: string | null
  comprovante_url?: string | null
}

export function useReceitas() {
  const { startDate, endDate } = usePeriod()
  const supabase = createClient()

  return useQuery({
    queryKey: ['receitas', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: false })

      if (error) throw error
      return data as Receita[]
    },
  })
}

export function useReceitasAno() {
  const { year } = usePeriod()
  const supabase = createClient()

  return useQuery({
    queryKey: ['receitas-ano', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', `${year}-01-01`)
        .lte('data', `${year}-12-31`)
        .order('data', { ascending: false })

      if (error) throw error
      return data as Receita[]
    },
  })
}

export function useReceitasMesAnterior() {
  const { month, year } = usePeriod()
  const supabase = createClient()

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`
  const lastDay = new Date(prevYear, prevMonth, 0).getDate()
  const prevEnd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  return useQuery({
    queryKey: ['receitas-prev', prevStart, prevEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', prevStart)
        .lte('data', prevEnd)

      if (error) throw error
      return data as Receita[]
    },
  })
}

export function useClientesSuggestions() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['clientes-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('cliente')

      if (error) throw error
      const rows = data as Array<{ cliente: string }>
      const unique = [...new Set(rows.map((r) => r.cliente))].sort()
      return unique
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateReceita() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (receita: ReceitaInsert) => {
      const payload = { ...receita, taxas: receita.taxas != null ? receita.taxas : 0 }
      const { data, error } = await supabase
        .from('receitas')
        .insert(payload as unknown as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data as Receita
    },
    onSuccess: (data) => {
      logAction('create', 'receitas', data.id)
      toast.success('Receita criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['receitas'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-ano'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-prev'] })
      queryClient.invalidateQueries({ queryKey: ['clientes-suggestions'] })
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar receita: ${error.message}`)
    },
  })
}

export function useCreateReceitasBatch() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ receita, duracaoMeses }: { receita: ReceitaInsert; duracaoMeses: number }) => {
      const payloads: Array<Record<string, unknown>> = []
      const baseDate = new Date(receita.data + 'T12:00:00')

      for (let i = 0; i < duracaoMeses; i++) {
        const date = new Date(baseDate)
        date.setMonth(date.getMonth() + i)
        const dateStr = date.toISOString().split('T')[0]

        payloads.push({
          ...receita,
          data: dateStr,
          taxas: receita.taxas != null ? receita.taxas : 0,
        } as unknown as Record<string, unknown>)
      }

      const { data, error } = await supabase
        .from('receitas')
        .insert(payloads)
        .select()

      if (error) throw error
      return data as Receita[]
    },
    onSuccess: (data) => {
      data.forEach((r) => logAction('create', 'receitas', r.id))
      toast.success(`${data.length} receitas criadas para os próximos meses!`)
      queryClient.invalidateQueries({ queryKey: ['receitas'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-ano'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-prev'] })
      queryClient.invalidateQueries({ queryKey: ['clientes-suggestions'] })
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar receitas: ${error.message}`)
    },
  })
}

export function useUpdateReceita() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReceitaInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('receitas')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Receita
    },
    onSuccess: () => {
      toast.success('Receita atualizada!')
      queryClient.invalidateQueries({ queryKey: ['receitas'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-ano'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-prev'] })
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar receita: ${error.message}`)
    },
  })
}

export function useDeleteReceita() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Receita removida.')
      queryClient.invalidateQueries({ queryKey: ['receitas'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-ano'] })
      queryClient.invalidateQueries({ queryKey: ['receitas-prev'] })
      queryClient.invalidateQueries({ queryKey: ['clientes-suggestions'] })
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir receita: ${error.message}`)
    },
  })
}
