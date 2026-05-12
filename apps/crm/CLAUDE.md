# CRM — Pipeline de Vendas B2B

> **O que faz:** captação de leads (do quiz do site via trigger Supabase) → qualificação → pipeline Kanban → deals → clientes. Análise IA por lead (Groq), notificações Discord + n8n.
> **Contexto global do monorepo:** ver [`../../CLAUDE.md`](../../CLAUDE.md).

---

## Stack local

- Next.js 15 App Router + React 19 + TypeScript strict
- Supabase Auth SSR + middleware
- TanStack Query v5
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — drag-and-drop no Kanban
- Vitest
- PWA via `@ducanh2912/next-pwa`
- Packages: `@gradios/ui`, `@gradios/motion`, `@gradios/tailwind-config`, `@gradios/assets`

## Rotas (todas em `src/app/(authenticated)/` exceto login)

| Rota | Página | Responsabilidade |
|---|---|---|
| `/login` | `app/login/page.tsx` | Email/senha via Supabase Auth |
| `/dashboard` | `(authenticated)/dashboard/page.tsx` | KPIs comerciais (leads novos, MRR estimado, taxa de conversão) |
| `/pipeline` | `(authenticated)/pipeline/page.tsx` | **Kanban drag-and-drop** de deals |
| `/leads` | `(authenticated)/leads/page.tsx` | Lista + perfil detalhado + análise IA por lead |
| `/deals` | `(authenticated)/deals/page.tsx` | Deals com valor, probabilidade, forecast |
| `/clientes` | `(authenticated)/clientes/page.tsx` | Clientes fechados (origem dos deals com `status='won'`) |
| `/analytics` | `(authenticated)/analytics/page.tsx` | Conversão por etapa, CAC, LTV, receita por fonte |
| `/configuracoes` | `(authenticated)/configuracoes/page.tsx` | Settings do painel |
| `/como-usar` | `(authenticated)/como-usar/page.tsx` | Onboarding/help interno |

## Integração com o site (captação automática)

```
Site público (gradios.co/diagnostico)
  ↓ submit do quiz com honeypot + rate limit + sanitização
  ↓ INSERT em supabase.quiz_leads (via SECURITY DEFINER fn)
  ↓ trigger audit_log (migration 015)
  ↓ webhook → Discord (migration 010)
  ↓ webhook → n8n (workflow quiz-email-nurturing.json)
  ↓ aparece em CRM /leads em tempo real
```

## Schema (tabelas usadas)

> Tabelas precisas em [`src/types/database.ts`](src/types/database.ts) (auto-gerado por `supabase gen types`).

Principais: `quiz_leads`, `leads`, `deals`, `clientes`, `pipeline_stages`, `lead_activities`.

## IA — análise por lead (Groq)

- Edge Function: `supabase/functions/groq-analysis/`
- Modelo: `llama-3.3-70b-versatile`
- Input: dados do lead (empresa, setor, score, respostas do quiz)
- Output: classificação + sugestões de abordagem + score qualitativo

## Convenções (idênticas ao CFO/CTO — design system unificado)

- Dark mode only · Mobile-first · Skeleton loaders · `card-glass` · `PageTransition`
- Formulários em Dialog/Sheet modal
- TanStack Query com `invalidateQueries` após mutação
- Brand tokens (ver [`../../CLAUDE.md`](../../CLAUDE.md))
- Font: Poppins via `next/font/google`

## Estrutura interna

```
src/
├── app/
│   ├── (authenticated)/   ← 8 rotas protegidas
│   ├── login/
│   ├── layout.tsx
│   ├── page.tsx           ← redirect → /dashboard
│   └── globals.css
├── components/            ← UI específica CRM (kanban-card, lead-drawer, etc.)
├── hooks/                 ← React hooks (queries TanStack)
├── lib/
│   ├── format.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── supabase-helpers.ts
│   └── utils.ts
├── providers/
├── types/
│   └── database.ts        ← auto-gen Supabase types
├── __tests__/             ← Vitest
└── middleware.ts          ← CSP nonce + auth
```

## Comandos

```bash
npm run dev          # next dev --turbopack (porta 3001 — DEPLOY_CHECKLIST cita PORT=3102)
npm run build
npm run typecheck    # tsc --noEmit
npm test             # vitest run
```

## Antes de mexer

1. **Kanban DnD?** → cuidado com `@dnd-kit` — reordenação dispara `update` no DB; use optimistic update + rollback no `onError`
2. **Análise IA?** → toda chamada vai pra Edge Function (não cliente). Custo Groq por lead — checar `anthropic-budget-alert.json` analog (criar `groq-budget-alert.json` quando volume justificar)
3. **Webhook n8n?** → o workflow `quiz-email-nurturing.json` está em `n8n-workflows/`. Mudou trigger no DB? Atualizar lá também
4. **Mutation que muda stage do deal?** → escrever em `lead_activities` (histórico)

## Gotchas conhecidos

- Lead capturado do site chega via trigger DB — **delay máximo ~30s**. Se não aparecer, investigar `audit_log` antes de assumir bug
- Insert pattern Supabase: `.insert(data as unknown as Record<string, unknown>)`
- Drag-end events do `@dnd-kit` disparam re-render — memorize cards pesados com `React.memo`

## Patches já aplicados (histórico relevante)

- Patch 3.2 do `scripts/fix-quick-wins.sh`: `layout.tsx` reescrito com `next/font` Poppins + viewport correto (sem `userScalable:false`)
- Patch 3.3: `next.config.ts` com `optimizePackageImports` + `images` + PWA
