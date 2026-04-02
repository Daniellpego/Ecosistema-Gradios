import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY nao configurados. Adicione ao .env.local ou nas variaveis de ambiente do Vercel.'
    )
    // Return a client that will fail gracefully on queries rather than crashing the app
    client = createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseKey || 'placeholder-anon-key'
    )
    return client
  }

  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
