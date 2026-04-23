import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, env vars may not be available — skip auth check
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(
        cookiesToSet: Array<{
          name: string
          value: string
          options: CookieOptions
        }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const isLoginPage = request.nextUrl.pathname === '/login'

  // Auth lookup protegido: envolve em try/catch para que qualquer falha do
  // Supabase (projeto pausado, rede, etc.) nao derrube a edge function com
  // 504. Em caso de erro, tratamos como "nao autenticado" — fail-closed em
  // rotas protegidas (redireciona para /login, que e estatico), fail-open
  // em /login para evitar loop.
  //
  // NAO usar Promise.race com setTimeout aqui: o getUser() continua rodando
  // em background quando o timeout ganha a race (o SDK nao aceita signal),
  // acumulando conexoes pendentes ate o Edge Runtime estourar com
  // "DNS cache overflow" (incidente de 23/04, tag hotfix-pos-PR98).
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    // silently fall through: user permanece null
  }

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
