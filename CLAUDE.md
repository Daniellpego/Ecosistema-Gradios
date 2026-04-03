# AIOX — Ecossistema Gradios 2026

## Estrutura

```
apps/
  cfo/       — Painel financeiro (CFO Gustavo Batista)
  crm/       — Pipeline de vendas B2B
  cto/       — Gestao de projetos e entregas
  site/      — Landing page + quiz diagnostico (gradios.co)
supabase/
  migrations/  — 12 migrations versionadas (001-012)
  functions/   — Edge Function groq-analysis
  rls-hardening.sql
n8n-workflows/ — Automacoes (email nurturing)
.github/       — CI/CD (Playwright)
```

## Stack Compartilhada

- **Framework:** Next.js 15 + App Router + TypeScript strict
- **Auth:** Supabase Auth (email/password) com SSR middleware
- **Database:** Supabase Postgres com RLS em todas as tabelas
- **Data fetching:** TanStack React Query v5 (cache + invalidation)
- **UI:** Tailwind CSS + Radix UI primitives + Lucide icons
- **Animations:** Framer Motion (PageTransition em todas as rotas)

## Supabase

- **Project ID:** `urpuiznydrlwmaqhdids`
- **URL:** `https://urpuiznydrlwmaqhdids.supabase.co`
- **Edge Function:** `groq-analysis` (usa secret `GROQ_API_KEY`)
- **RLS:** Ativo em todas as tabelas (policy: `auth.role() = 'authenticated'`)

## Painel CFO (`apps/cfo/`)

Usado diariamente pelo CFO para acompanhar receitas, custos, DRE, projecoes e saude financeira.

### Schema (tabelas principais)

| Tabela | Descricao |
|--------|-----------|
| `receitas` | Faturamento. Campos-chave: `valor_bruto`, `valor_liquido` (generated), `tipo`, `recorrente`, `status` |
| `custos_fixos` | Custos mensais fixos. `valor_mensal`, `categoria`, `status` (ativo/suspenso/cancelado) |
| `gastos_variaveis` | Custos variaveis. `valor`, `tipo` (operacional/marketing/comercial/impostos), `categoria` |
| `caixa` | Saldo em conta. `saldo`, `data`, `banco` |
| `projecoes` | Cenarios financeiros (conservador/realista/agressivo) |
| `metas_financeiras` | Metas por periodo e metrica |
| `emprestimo_socio` | Emprestimos entre socios |
| `historico_decisoes` | Log de decisoes estrategicas |

### Regras de Negocio (CRITICAS)

1. **Simples Nacional:** Impostos incidem sobre FATURAMENTO (receita bruta), NAO sobre lucro
2. **DRE Cascade:** Receita Bruta → (-) Custos Variaveis (sem impostos) → (=) Margem Bruta → (-) Custos Fixos → (=) Resultado Operacional → (-) Impostos → (=) Resultado Liquido
3. **Dashboard usa valor_bruto** (mesma base da DRE), NAO valor_liquido
4. **Gastos variaveis com tipo='impostos'** sao separados dos demais custos variaveis na DRE
5. **Custos fixos** consideram apenas `status='ativo'`
6. **Receitas** consideram apenas `status='confirmado'` para calculos
7. **MRR** = soma de receitas onde `recorrente=true` AND `status='confirmado'`
8. **Burn Rate** = Custos Fixos + Gastos Variaveis + Impostos
9. **Runway** = Caixa Disponivel / Burn Rate (em meses)

### Abas

| Rota | Funcionalidade |
|------|---------------|
| `/login` | Email/senha com Supabase Auth |
| `/dashboard` | KPIs, alertas inteligentes, graficos, analise IA |
| `/dre` | DRE gerencial com cascata completa |
| `/receitas` | CRUD faturamento com filtros e KPIs |
| `/custos-fixos` | CRUD custos fixos com pie chart |
| `/gastos-variaveis` | CRUD com tabs por tipo + CAC |
| `/projecoes` | 3 cenarios x 12 meses |
| `/balanco-anual` | Grid 12 meses com drill-down |
| `/academy` | Glossario financeiro + chat IA (Groq) |

### IA

- Groq API (llama-3.3-70b-versatile) via Supabase Edge Function
- Charts: Recharts (ComposedChart, PieChart, LineChart, AreaChart)

## Brand Book (compartilhado entre paineis)

| Token | Valor | Uso |
|-------|-------|-----|
| `bg-navy` | `#0A1628` | Background principal |
| `bg-card` | `#131F35` | Cards (`card-glass`) |
| `brand-cyan` | `#00C8F0` | CTAs, destaques, links ativos |
| `brand-blue` | `#1A6AAA` | Elementos secundarios |
| `brand-blue-deep` | `#153B5F` | Borders, grid lines |
| `text-primary` | `#F0F4F8` | Texto principal |
| `text-secondary` | `#94A3B8` | Labels, subtextos |
| `status-positive` | `#10B981` | Valores positivos (verde) |
| `status-negative` | `#EF4444` | Valores negativos (vermelho) |
| `status-warning` | `#F59E0B` | Alertas (amarelo) |
| **Font** | Poppins | 300-700 weights |

## Convencoes

- Dark mode only (sem toggle)
- Mobile-first responsive
- Skeleton loaders (nunca spinners genericos)
- `card-glass` para todos os cards
- Framer Motion `PageTransition` em todas as paginas
- Formularios em Dialog/Sheet modal (nao pagina separada)
- TanStack Query com invalidacao apos mutacoes
- Insert pattern: `.insert(data as unknown as Record<string, unknown>)`
