# CFO — Painel Financeiro

> **Quem usa:** Gustavo Batista (CFO) — operação diária.
> **O que faz:** acompanhar receitas, custos, DRE, projeções, MRR, burn rate, runway, alertas inteligentes, análise IA (Groq llama-3.3-70b).
> **Contexto global do monorepo:** ver [`../../CLAUDE.md`](../../CLAUDE.md).

---

## Stack local

- Next.js 15 App Router + React 19 + TypeScript strict
- Supabase Auth SSR (middleware faz redirect → `/login` se não autenticado)
- TanStack Query v5 (cache + invalidação após cada mutação)
- Recharts (ComposedChart, PieChart, LineChart, AreaChart)
- Vitest (unit tests em `src/__tests__/`)
- PWA via `@ducanh2912/next-pwa`
- Packages compartilhados: `@gradios/ui`, `@gradios/motion`, `@gradios/tailwind-config`, `@gradios/assets`

## Rotas (todas em `src/app/(authenticated)/` exceto login)

| Rota | Página | Responsabilidade |
|---|---|---|
| `/login` | `app/login/page.tsx` | Email/senha via Supabase Auth |
| `/dashboard` | `(authenticated)/dashboard/page.tsx` | KPIs (MRR, burn rate, runway, margem), alertas inteligentes, charts, análise IA |
| `/dre` | `(authenticated)/dre/page.tsx` | DRE gerencial com cascata completa |
| `/receitas` | `(authenticated)/receitas/page.tsx` | CRUD faturamento + filtros + KPIs |
| `/custos-fixos` | `(authenticated)/custos-fixos/page.tsx` | CRUD custos fixos com pie chart |
| `/gastos-variaveis` | `(authenticated)/gastos-variaveis/page.tsx` | CRUD com tabs por tipo + CAC |
| `/projecoes` | `(authenticated)/projecoes/page.tsx` | 3 cenários × 12 meses |
| `/balanco-anual` | `(authenticated)/balanco-anual/page.tsx` | Grid 12 meses com drill-down |
| `/academy` | `(authenticated)/academy/page.tsx` | Glossário financeiro + chat IA contextual |
| `/apresentacao` | `(authenticated)/apresentacao/page.tsx` | Modo apresentação |
| `/relatorios` | `(authenticated)/relatorios/page.tsx` | Relatórios exportáveis |

## Schema (tabelas usadas)

| Tabela | Campo crítico | Regra |
|---|---|---|
| `receitas` | `valor_bruto`, `valor_liquido` (generated), `tipo`, `recorrente`, `status` | Dashboard usa **`valor_bruto`** (mesma base da DRE) |
| `custos_fixos` | `valor_mensal`, `categoria`, `status` | Considera apenas `status='ativo'` |
| `gastos_variaveis` | `valor`, `tipo` (operacional/marketing/comercial/impostos), `categoria` | Tipo `impostos` é separado dos demais na DRE |
| `caixa` | `saldo`, `data`, `banco` | Snapshot mensal |
| `projecoes` | cenário (conservador/realista/agressivo) | 12 meses × 3 cenários |
| `metas_financeiras` | por período e métrica | — |
| `emprestimo_socio` | empréstimos entre sócios | — |
| `historico_decisoes` | log de decisões estratégicas | append-only (não sobrescrever) |

## Regras de negócio (CRÍTICAS — testadas em `__tests__/`)

> Já estão no [`../../CLAUDE.md`](../../CLAUDE.md) raiz. Repetidas aqui pra contexto local imediato.

1. **Simples Nacional:** impostos incidem sobre FATURAMENTO (receita bruta), **NÃO sobre lucro**
2. **DRE Cascade:** Receita Bruta → (-) Custos Variáveis (sem impostos) → (=) Margem Bruta → (-) Custos Fixos → (=) Resultado Operacional → (-) Impostos → (=) Resultado Líquido
3. **Dashboard usa `valor_bruto`** (mesma base da DRE), NÃO `valor_liquido`
4. **`gastos_variaveis.tipo='impostos'`** é separado dos demais
5. **`custos_fixos`** filtra `status='ativo'`
6. **`receitas`** filtra `status='confirmado'`
7. **MRR** = soma de receitas onde `recorrente=true AND status='confirmado'`
8. **Burn Rate** = Custos Fixos + Gastos Variáveis + Impostos
9. **Runway** = Caixa Disponível / Burn Rate (em meses)

Testes em [`src/__tests__/dre.test.ts`](src/__tests__/dre.test.ts), [`src/__tests__/dashboard.test.ts`](src/__tests__/dashboard.test.ts), [`src/__tests__/pro-labore.test.ts`](src/__tests__/pro-labore.test.ts), [`src/__tests__/format.test.ts`](src/__tests__/format.test.ts) — **antes de mexer em qualquer cálculo, ler o teste correspondente.**

## IA — Groq via Supabase Edge Function

- Edge Function: `supabase/functions/groq-analysis/` (chave em Supabase Secrets, NÃO em código)
- Modelo: `llama-3.3-70b-versatile`
- Uso: análise IA no `/dashboard` e chat IA contextual no `/academy`

## Convenções

- **Dark mode only** (sem toggle)
- **Mobile-first** responsive
- **Skeleton loaders** sempre (nunca spinners genéricos) — usar `<SkeletonCard />`
- **`card-glass`** pra TODOS os cards (sem exceção visual)
- **`PageTransition`** (Framer Motion) em todas as páginas — wraps `children`
- **Formulários em Dialog/Sheet modal**, não em página separada
- **TanStack Query** com `invalidateQueries` após cada mutação
- **Insert pattern Supabase:** `.insert(data as unknown as Record<string, unknown>)` (workaround tipos)
- **Brand tokens:** ver [`../../CLAUDE.md`](../../CLAUDE.md) — `bg-navy`, `bg-card`, `brand-cyan`, etc.
- **Font:** Poppins 300-700 (via `next/font/google`)

## Estrutura interna

```
src/
├── app/
│   ├── (authenticated)/   ← 10 rotas protegidas (route group)
│   ├── login/             ← /login
│   ├── layout.tsx         ← root layout + providers
│   ├── page.tsx           ← redirect → /dashboard
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── charts/            ← Recharts wrappers (ComposedChart, Pie, Line, Area)
│   ├── custos-fixos/      ← componentes específicos
│   ├── gastos-variaveis/
│   ├── receitas/
│   ├── ui/                ← Radix primitives wrapped
│   ├── logo.tsx
│   ├── motion.tsx         ← PageTransition (Framer Motion)
│   ├── period-filter.tsx
│   ├── sidebar.tsx
│   └── skeleton-card.tsx
├── hooks/                 ← React hooks customizados (queries TanStack)
├── lib/
│   ├── audit-log.ts       ← helper pra escrever em audit_log
│   ├── export-csv.ts
│   ├── export-print.ts
│   ├── format.ts          ← moeda BRL, percentuais, datas
│   ├── simples-nacional.ts ← lógica de impostos (CRÍTICA — testada)
│   ├── supabase/
│   │   ├── client.ts      ← browser client
│   │   ├── middleware.ts  ← SSR auth check
│   │   └── server.ts      ← server component client
│   ├── supabase-helpers.ts
│   └── utils.ts
├── providers/             ← QueryProvider, TooltipProvider
├── types/                 ← TypeScript types compartilhados
├── __tests__/             ← Vitest (dashboard, dre, format, pro-labore)
└── middleware.ts          ← CSP nonce + auth redirect
```

## Comandos

```bash
npm run dev          # next dev --turbopack (porta 3000)
npm run build        # next build
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest interativo
npm run test:coverage
```

## Segurança

CSP dinâmica com **nonce por request** em [`src/middleware.ts`](src/middleware.ts). Headers estáticos em [`next.config.ts`](next.config.ts). Detalhes completos em [`../../SECURITY_REPORT.md`](../../SECURITY_REPORT.md).

## Antes de mexer em algo, lembrar

1. **Cálculo financeiro?** → ler `__tests__/` antes de tocar em `lib/simples-nacional.ts`, `lib/format.ts`, ou componentes de chart
2. **Nova rota?** → criar em `(authenticated)/` + adicionar no sidebar + PageTransition
3. **Mutation no DB?** → adicionar `audit_log` se afetar `receitas`/`custos_fixos`/`gastos_variaveis` (migration 017 vai estender o trigger)
4. **Nova tabela?** → adicionar RLS na mesma migration + `WITH CHECK` na policy de INSERT
5. **Mudou middleware?** → rodar checklist de seção 2.2 do `DEPLOY_CHECKLIST.md` (curl pra confirmar nonce)
6. **Mudou Edge Function?** → testar localmente com `supabase functions serve` antes de `supabase functions deploy`

## Gotchas conhecidos

- `next.config.ts` tem `eslint: { ignoreDuringBuilds: true }` — bypass de lint no build (TODO: remover quando houver janela pra resolver warnings)
- `insert` precisa do cast `as unknown as Record<string, unknown>` (limitação dos tipos Supabase)
- Charts Recharts: tooltip customizado se torna `aria-hidden=true` no Lighthouse — workaround documentado em `components/charts/`
