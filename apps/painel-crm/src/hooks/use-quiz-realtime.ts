'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { QuizSession } from '@/types/database'

/**
 * Listens for new quiz_sessions via Supabase Realtime.
 * When a quiz is completed, auto-creates a lead in the CRM
 * and links the quiz_session back to the new lead.
 */
export function useQuizRealtime(onNewLead?: () => void) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('quiz-auto-lead')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quiz_sessions' },
        async (payload) => {
          const session = payload.new as QuizSession

          // Only create lead if not already linked
          if (session.lead_id) return

          // Derive temperatura from score
          let temperatura: 'frio' | 'morno' | 'quente' = 'morno'
          if (session.score_automacao != null) {
            if (session.score_automacao >= 70) temperatura = 'quente'
            else if (session.score_automacao < 40) temperatura = 'frio'
          }

          // Extract contact info from respostas if available
          const respostas = session.respostas ?? {}
          const nome = (respostas['nome'] as string) || (respostas['name'] as string) || 'Lead via Quiz'
          const email = (respostas['email'] as string) || null
          const whatsapp = (respostas['whatsapp'] as string) || (respostas['telefone'] as string) || null
          const empresa = (respostas['empresa'] as string) || null

          const leadData = {
            nome,
            empresa,
            email,
            whatsapp,
            setor: session.setor,
            origem: 'quiz',
            status: 'novo',
            temperatura,
            valor_estimado: session.custo_invisivel_min ?? 0,
            responsavel: 'Sistema',
            notas: `Quiz: ${session.resultado_tipo} | Score: ${session.score_automacao ?? 0}% | Urgência: ${session.urgencia ?? '-'}`,
            tags: ['quiz', session.resultado_tipo].filter(Boolean),
          }

          const { data: lead, error } = await supabase
            .from('leads')
            .insert(leadData as unknown as Record<string, unknown>)
            .select('id')
            .single()

          if (error) {
            console.error('[Quiz→CRM] Failed to create lead:', error.message)
            return
          }

          // Link quiz session to the new lead
          if (lead?.id) {
            await supabase
              .from('quiz_sessions')
              .update({ lead_id: lead.id } as unknown as Record<string, unknown>)
              .eq('id', session.id)
          }

          // Invalidate caches so lists refresh
          queryClient.invalidateQueries({ queryKey: ['leads'] })
          queryClient.invalidateQueries({ queryKey: ['leads-all'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })

          onNewLead?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, onNewLead])
}
