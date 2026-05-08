// Edge Function: site-lead-submit
// Recebe POST do formulário de contato (gradios.co) e grava em public.site_leads.
// - Valida campos obrigatórios (nome, contato, tipo, mensagem)
// - Rejeita se honeypot vier preenchido
// - Faz hash do IP (privacidade) e usa para rate-limit suave (5/h por IP)
// - Insere via service_role (RLS permite só service_role no INSERT)
//
// Variáveis de ambiente:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — preenchidas automaticamente pelo Supabase.
//   ALLOWED_ORIGINS                          — lista CSV de origens permitidas, ex.:
//                                              "https://gradios.co,https://www.gradios.co"
//   IP_HASH_SALT                             — salt para hash de IP. OBRIGATÓRIO em produção.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// CORS: lista de origens permitidas. Se ALLOWED_ORIGINS não estiver setada,
// o handler ainda responde, mas com aviso no log e Allow-Origin = "*"
// (apenas para destravar deploy inicial/teste — NUNCA deixar assim em prod).
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

if (ALLOWED_ORIGINS.length === 0) {
  console.warn('[site-lead-submit] ALLOWED_ORIGINS não configurada — fallback "*". Configure com:')
  console.warn('  supabase secrets set ALLOWED_ORIGINS="https://gradios.co,https://www.gradios.co"')
}

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  let allow: string
  if (ALLOWED_ORIGINS.length === 0) {
    allow = '*'
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    allow = origin
  } else {
    // Origem não está na lista: devolve a primeira como ACAO. O browser
    // vai bloquear o response porque o origin do request não bate, o que
    // é exatamente o comportamento desejado (bloquear sites não-listados).
    allow = ALLOWED_ORIGINS[0]
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

const TIPOS_VALIDOS = new Set([
  'Site profissional',
  'Sistema personalizado',
  'Automação',
  'Aplicativo',
  'Dashboard / painel',
  'Solução com IA',
  'Ainda não sei, preciso de diagnóstico',
])

function jsonResponse(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  })
}

const IP_HASH_SALT = Deno.env.get('IP_HASH_SALT')
if (!IP_HASH_SALT) {
  console.warn('[site-lead-submit] IP_HASH_SALT não configurada — fallback fraco em uso. Configure com:')
  console.warn('  supabase secrets set IP_HASH_SALT="$(openssl rand -hex 32)"')
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (IP_HASH_SALT ?? 'gradios-site-dev-only'))
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeadersFor(req) })
  if (req.method !== 'POST') return jsonResponse(req, { error: 'method_not_allowed' }, 405)

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return jsonResponse(req, { error: 'invalid_json' }, 400)
  }

  // Honeypot: bots tendem a preencher campos invisíveis
  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return jsonResponse(req, { ok: true }, 200) // finge sucesso, mas não grava
  }

  const nome = String(payload.nome ?? '').trim()
  const contato = String(payload.contato ?? '').trim()
  const empresa = payload.empresa ? String(payload.empresa).trim() : null
  const tipo = String(payload.tipo ?? '').trim()
  const mensagem = String(payload.mensagem ?? '').trim()

  if (!nome || nome.length < 2 || nome.length > 120) return jsonResponse(req, { error: 'nome_invalido' }, 400)
  if (!contato || contato.length < 5 || contato.length > 160) return jsonResponse(req, { error: 'contato_invalido' }, 400)
  if (!tipo || !TIPOS_VALIDOS.has(tipo)) return jsonResponse(req, { error: 'tipo_invalido' }, 400)
  if (!mensagem || mensagem.length < 10 || mensagem.length > 4000) return jsonResponse(req, { error: 'mensagem_invalida' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const ipHash = await hashIp(ip)

  // Rate-limit: máx. 5 envios por IP por hora
  const { count } = await supabase
    .from('site_leads')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  if ((count ?? 0) >= 5) return jsonResponse(req, { error: 'rate_limited' }, 429)

  const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null

  const { error } = await supabase.from('site_leads').insert({
    nome,
    contato,
    empresa,
    tipo,
    mensagem,
    origem: typeof payload.origem === 'string' ? payload.origem.slice(0, 200) : null,
    user_agent: userAgent,
    ip_hash: ipHash,
    utm_source: typeof payload.utm_source === 'string' ? payload.utm_source.slice(0, 120) : null,
    utm_medium: typeof payload.utm_medium === 'string' ? payload.utm_medium.slice(0, 120) : null,
    utm_campaign: typeof payload.utm_campaign === 'string' ? payload.utm_campaign.slice(0, 120) : null,
  })

  if (error) {
    console.error('site_leads insert failed:', error)
    return jsonResponse(req, { error: 'persist_failed' }, 500)
  }

  return jsonResponse(req, { ok: true })
})
