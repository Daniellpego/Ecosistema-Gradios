# CTO — Gestão de Projetos e Entregas

> **O que faz:** gestão de projetos (kanban + timeline + calendário), portal do cliente (view read-only compartilhável), relatórios de progresso.
> **Contexto global do monorepo:** ver [`../../CLAUDE.md`](../../CLAUDE.md).

---

## Stack local

- Next.js 15 App Router + React 19 + TypeScript strict
- Supabase Auth SSR + middleware
- TanStack Query v5
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — Kanban de tarefas
- Vitest
- PWA via `@ducanh2912/next-pwa`
- Packages: `@gradios/ui`, `@gradios/motion`, `@gradios/tailwind-config`, `@gradios/assets`

## Rotas

| Rota | Página | Responsabilidade |
|---|---|---|
| `/login` | `app/login/page.tsx` | Email/senha via Supabase Auth |
| `/dashboard` | `(authenticated)/dashboard/page.tsx` | KPIs de projetos (entregas no prazo, throughput, projetos ativos) |
| `/kanban` | `(authenticated)/kanban/page.tsx` | Kanban de tarefas com drag-and-drop |
| `/timeline` | `(authenticated)/timeline/page.tsx` | Timeline visual de entregas |
| `/calendario` | `(authenticated)/calendario/page.tsx` | Calendário de marcos |
| `/portal` | `(authenticated)/portal/page.tsx` | Portal do cliente (view read-only compartilhável) |
| `/relatorios` | `(authenticated)/relatorios/page.tsx` | Relatórios de progresso |

## Schema (Jarvis)

> "Jarvis" é o codename interno do schema desse app (migration `007_jarvis_schema.sql`). Tipos em [`src/types/database.ts`](src/types/database.ts).

Principais entidades: `projetos`, `tarefas`, `marcos`, `entregas`, `clientes_view` (RLS pra portal).

## Convenções (idênticas — design system unificado)

- Dark mode only · Mobile-first · Skeleton loaders · `card-glass` · `PageTransition`
- Formulários em Dialog/Sheet modal
- TanStack Query com `invalidateQueries`
- Brand tokens (ver [`../../CLAUDE.md`](../../CLAUDE.md))
- Font: Poppins via `next/font/google`

## Estrutura interna

```
src/
├── app/
│   ├── (authenticated)/   ← 6 rotas protegidas
│   ├── login/
│   ├── layout.tsx
│   ├── page.tsx           ← redirect → /dashboard
│   └── globals.css
├── components/            ← UI específica CTO (kanban-card, timeline-bar, calendar-cell, portal-view, etc.)
├── hooks/
├── lib/
│   ├── format.ts
│   ├── kanban-config.ts   ← config de colunas/status do kanban
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── supabase-helpers.ts
│   └── utils.ts
├── providers/
├── types/
│   └── database.ts
├── __tests__/             ← Vitest
└── middleware.ts          ← CSP nonce + auth
```

## Comandos

```bash
npm run dev          # next dev --turbopack (DEPLOY_CHECKLIST cita PORT=3103)
npm run build
npm run typecheck
npm test
```

## Portal do Cliente — particularidades

- Rota `/portal` mostra view **read-only** dos projetos de um cliente específico
- Acesso via link compartilhável (token na URL ou auth de cliente — verificar `middleware.ts`)
- **Atenção RLS:** tabelas expostas ao portal precisam de policies separadas pra `anon` (similar ao padrão `apps/site`)

## Antes de mexer

1. **Mudou kanban?** → verificar `lib/kanban-config.ts` antes de hardcodar status
2. **Mudou portal do cliente?** → policies RLS precisam permitir leitura por `anon` com filtro de cliente
3. **Performance de timeline?** → renderiza muitos elementos; usar virtualização (`react-window` ou similar) se passar de 100 itens
4. **Logo do app:** já foi convertido de PNG (1.4MB) → WebP via patch 3.4 do `scripts/fix-quick-wins.sh`. Usar `/logo-gradios.webp`

## Gotchas conhecidos

- `@dnd-kit` reordenação dispara `update` no DB — usar optimistic update
- Insert pattern Supabase: `.insert(data as unknown as Record<string, unknown>)`
