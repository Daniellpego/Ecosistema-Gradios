<div align="center">

# Ecosistema GradiOS 🚀

**Plataforma completa de automação empresarial com IA**

[![Site](https://img.shields.io/badge/Site-gradios.co-00C8F0?style=for-the-badge&logo=vercel&logoColor=white)](https://www.gradios.co)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## O que é

O **Ecosistema GradiOS** é o sistema operacional interno da [Gradios](https://www.gradios.co) — uma suite de 4 aplicações interconectadas que cobre desde a captação de leads no site público até o controle financeiro, operacional e de projetos dos sócios.

Tudo compartilha o mesmo banco de dados Supabase com RLS completo, autenticação unificada e automações via n8n.

---

## Apps

| App | URL | Descrição |
|-----|-----|-----------|
| 🌐 **Site** | [gradios.co](https://www.gradios.co) | Landing page + Quiz de Diagnóstico com IA (Claude Sonnet) + Blog |
| 💰 **CFO** | painel interno | Dashboard financeiro: DRE, receitas, custos, projeções, balanço anual, IA financeira (Groq) |
| 📊 **CRM** | painel interno | Pipeline de vendas B2B: leads, deals, Kanban drag-and-drop, analytics, IA por lead (Groq) |
| ⚙️ **CTO** | painel interno | Gestão de projetos: Kanban, timeline, calendário, portal do cliente, relatórios |

---

## Stack

```
FRONTEND   Next.js 15 App Router · TypeScript strict · Tailwind CSS · Radix UI · Framer Motion
DATA       TanStack React Query v5 · Recharts · Zod · date-fns · dnd-kit
BACKEND    Supabase Postgres · Row Level Security · Edge Functions · Supabase Auth SSR
IA         Anthropic Claude Sonnet (diagnóstico) · Groq llama-3.3-70b (CFO + CRM)
INFRA      Vercel Edge · Upstash Redis (rate limiting) · n8n (automações de e-mail)
TESTES     Vitest · Playwright · Lighthouse CI
```

---

## Estrutura do Repositório

```
apps/
├── site/          — gradios.co — landing, quiz diagnóstico IA, blog, SEO
├── cfo/           — painel financeiro (DRE, MRR, burn rate, runway, projeções)
├── crm/           — pipeline B2B (leads → deals → clientes + analytics)
└── cto/           — gestão de projetos (kanban, timeline, portal do cliente)

supabase/
├── migrations/    — 15 migrations versionadas (schema → RLS → webhooks → audit)
├── functions/     — Edge Function: groq-analysis
└── rls-hardening.sql

n8n-workflows/
├── quiz-email-nurturing.json    — nurturing automático de leads do quiz
└── anthropic-budget-alert.json  — alerta de gasto de API

.github/
└── workflows/     — CI: Lighthouse, Playwright (painel CFO)
```

---

## Funcionalidades por App

### 🌐 Site — `apps/site/`

- Landing page com animações Framer Motion + scroll suave (Lenis)
- **Quiz de Diagnóstico** de 11 perguntas com score 0-100 e diagnóstico IA em streaming (Claude Sonnet)
- Honeypot anti-bot + rate limiting por IP (Upstash Redis)
- Meta Conversions API server-side + Meta Pixel client-side
- Blog com RSS feed e categorias
- SEO completo: sitemap, Open Graph, JSON-LD

### 💰 CFO — `apps/cfo/`

- **KPIs em tempo real**: MRR, burn rate, runway, margem líquida
- **DRE Gerencial**: cascata completa (receita bruta → margem bruta → resultado líquido)
- Receitas, custos fixos, gastos variáveis com CRUD completo
- Projeções 3 cenários × 12 meses (conservador / realista / agressivo)
- Balanço anual: grid 12 meses com drill-down
- Academy: glossário financeiro + chat IA com contexto
- PWA instalável

### 📊 CRM — `apps/crm/`

- Pipeline Kanban com drag-and-drop (`@dnd-kit`)
- Leads capturados automaticamente do quiz do site via trigger Supabase
- Perfil detalhado do lead com análise IA (Groq) e histórico
- Deals com valor, probabilidade e forecast
- Analytics: conversão por etapa, CAC, LTV, receita por fonte
- Notificações Discord + n8n via webhooks automáticos

### ⚙️ CTO — `apps/cto/`

- Gestão de projetos com status, prioridade e responsável
- Kanban de tarefas com drag-and-drop
- Timeline visual de entregas
- Calendário de marcos
- Portal do cliente (view read-only compartilhável)
- Relatórios de progresso
- PWA instalável

---

## Banco de Dados

15 migrations versionadas cobrindo:

| Migration | O que faz |
|-----------|-----------|
| `001` | Schema unificado base |
| `002` | Tabelas financeiras do CFO |
| `003–004` | Bridge CRM/CFO + enhancements |
| `005–006` | RLS anônimo para leads do site |
| `007` | Schema Jarvis (CTO) |
| `008` | Módulo de propostas |
| `009–010` | Webhooks Discord + n8n para quiz leads |
| `011` | Audit log + NFe |
| `012` | Seed de dados limpos |
| `013–015` | Hardening RLS anônimo + validação + audit trigger |

**RLS ativo em todas as tabelas.** Políticas separadas para `authenticated` (painéis internos) e `anon` (captação pública no site).

---

## Rodar Local

```bash
# Pré-requisitos: Node.js 20+, npm

# CFO — localhost:3000
cd apps/cfo && npm install && npm run dev

# CRM — localhost:3001
cd apps/crm && npm install && npm run dev

# CTO — localhost:3002
cd apps/cto && npm install && npm run dev

# Site — localhost:3000
cd apps/site && npm install && npm run dev
```

### Variáveis de Ambiente

Cada app precisa de um `.env.local`:

```env
# Compartilhadas (todos os apps)
NEXT_PUBLIC_SUPABASE_URL=https://urpuiznydrlwmaqhdids.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Site
ANTHROPIC_API_KEY=...           # diagnóstico IA em streaming
UPSTASH_REDIS_REST_URL=...      # rate limiting
UPSTASH_REDIS_REST_TOKEN=...
META_PIXEL_ID=...               # Conversions API
META_ACCESS_TOKEN=...

# CFO + CRM (IA)
GROQ_API_KEY=...
```

---

## Testes

```bash
# CFO — unit tests (Vitest)
cd apps/cfo && npm test

# CFO — E2E (Playwright)
cd apps/cfo && npx playwright test

# Performance (Lighthouse CI — roda no GitHub Actions)
# Ver .github/workflows/lighthouse.yml
```

---

## Design System

Dark mode only. Paleta exclusiva:

| Token | Cor | Uso |
|-------|-----|-----|
| `bg-navy` | `#0A1628` | Background principal |
| `bg-card` | `#131F35` | Cards (`card-glass`) |
| `brand-cyan` | `#00C8F0` | CTAs, links ativos |
| `brand-blue` | `#1A6AAA` | Elementos secundários |
| `status-positive` | `#10B981` | Valores positivos |
| `status-negative` | `#EF4444` | Valores negativos |
| `status-warning` | `#F59E0B` | Alertas |

**Font:** Poppins 300–700 · **Animações:** Framer Motion com `PageTransition` em todas as rotas

---

## Contato

**Gradios** — Automação de processos e integrações sob medida

📧 contato@gradios.co · 📱 (43) 98837-2540 · 🌐 [gradios.co](https://www.gradios.co)
