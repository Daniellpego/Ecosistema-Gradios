import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const cookieStore = await cookies()

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY nao configurados.'
    )
    return createServerClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseKey || 'placeholder-anon-key',
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Record<string, unknown>)
          )
        } catch {
          // setAll can fail in Server Components — safe to ignore
        }
      },
    },
  })
}
