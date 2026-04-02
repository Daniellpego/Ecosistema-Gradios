'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface CurrentUser {
  id: string
  email: string
  nome: string
  role: string
}

const FALLBACK_USER: CurrentUser = {
  id: '',
  email: '',
  nome: 'Usuario',
  role: 'dev',
}

export function useCurrentUser() {
  const supabase = createClient()
  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: async (): Promise<CurrentUser> => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return FALLBACK_USER

      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, role')
        .eq('user_id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email ?? '',
        nome: profile?.nome ?? user.email?.split('@')[0] ?? 'Usuario',
        role: profile?.role ?? 'dev',
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  // Always return a usable user object, even during loading/error
  return {
    ...query,
    user: query.data ?? FALLBACK_USER,
  }
}
