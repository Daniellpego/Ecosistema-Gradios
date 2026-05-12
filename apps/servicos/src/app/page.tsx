import { redirect, permanentRedirect } from 'next/navigation'

/**
 * Placeholder honesto enquanto a página /servicos não é desenvolvida.
 *
 * Decisão: redirect permanente (308) pra https://gradios.co/solucoes.html
 * (página de soluções do site institucional). Mantém SEO e dá destino sensato
 * pra usuário que cair aqui.
 *
 * Ver apps/servicos/CLAUDE.md pra plano de desenvolvimento.
 */
export default function ServicosRoot(): never {
  // permanentRedirect é client/server-safe e gera 308
  permanentRedirect('https://gradios.co/solucoes.html')
}

export const dynamic = 'force-static'
