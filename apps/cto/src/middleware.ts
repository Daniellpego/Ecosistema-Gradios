import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Generate a per-request nonce for Content-Security-Policy.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Run Supabase auth (handles session cookie refresh + unauthenticated redirects).
  const response = await updateSession(request)

  // Build a nonce-based CSP and set it on the response, overriding the static
  // fallback in next.config.ts.  Strategy: 'nonce-{nonce}' + 'strict-dynamic' +
  // 'unsafe-inline'.  Modern browsers (CSP Level 3) enforce the nonce and silently
  // ignore 'unsafe-inline'; legacy browsers fall back to 'unsafe-inline' only.
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

// Exclui do middleware: internals do Next, PWA (service worker + workbox +
// manifest + splash/icones), arquivos de raiz (robots, sitemap) e qualquer
// asset estatico por extensao. Durante o incidente de 23/04 o /sw.js caiu no
// middleware e estourou 504 junto com o auth, deixando o PWA travado offline.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon\\.ico|sw\\.js|workbox-|fallback-|manifest\\.json|manifest\\.webmanifest|offline\\.html|robots\\.txt|sitemap\\.xml|splash-|icons?/|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|map)$).*)',
  ],
}
