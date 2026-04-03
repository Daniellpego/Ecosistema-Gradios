<p align="center">
  <img src="apps/painel-cfo/public/logo-gradios-small.webp" alt="Gradios" width="200" />
</p>

<h1 align="center">GRADIOS Ecosystem 2026</h1>

<p align="center">
  <strong>Plataforma de automacao empresarial com IA integrada</strong><br/>
  5 sistemas interligados em tempo real &mdash; Site, CRM, CFO, CTO e Quiz
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Producao-10B981?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/Sistemas-5-6366F1?style=flat-square" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel" />
</p>

<p align="center">
  <a href="https://www.gradios.co">gradios.co</a> &bull;
  <a href="https://www.gradios.co/diagnostico">Quiz Diagnostico</a> &bull;
  <a href="mailto:contato@gradios.co">contato@gradios.co</a> &bull;
  (43) 98837-2540
</p>

---

## Arquitetura

```
                         gradios.co
                      (Site Principal)
                            |
                 Lead preenche o Quiz
                            |
                            v
                   +----------------+
                   |   SUPABASE     |
                   |  quiz_leads    |------> Webhooks Discord/n8n
                   +-------+--------+
                           |
           +---------------+---------------+
           |               |               |
           v               v               v
    +----------+    +-----------+    +-----------+
    |  PAINEL  |    |  PAINEL   |    |  PAINEL   |
    |   CRM    |    |   CFO     |    |   CTO     |
    |          |    |           |    |           |
    | Leads    |    | Receitas  |    | Projetos  |
    | Deals    |    | DRE       |    | Kanban    |
    | Pipeline |    | Projecoes |    | Timeline  |
    | Scripts  |    | Caixa     |    | Calendar  |
    +----+-----+    +-----+-----+    +-----+----+
         |               |               |
         +-------+-------+-------+-------+
                 |               |
                 v               v
          +-----------+   +-----------+
          | Triggers  |   | Realtime  |
          | Cross-    |   | WebSocket |
          | Panel     |   |           |
          +-----------+   +-----------+
```

---

## Sistemas

### 1. Site Principal &mdash; `site-principal/`

> Landing page + quiz de diagnostico com IA

| | |
|---|---|
| **Stack** | Next.js 14, React 18, Tailwind, Supabase JS |
| **Deploy** | Vercel &mdash; [gradios.co](https://www.gradios.co) |
| **Paginas** | `/` landing, `/diagnostico` quiz, `/privacidade`, `/termos` |
| **Quiz** | 10 perguntas de qualificacao, score 0-100, tier A/B/C/D |
| **IA** | Claude Sonnet gera diagnostico personalizado via streaming |
| **Tracking** | Meta Pixel, UTM params, geolocalizacao por IP |
| **Webhook** | Notifica equipe no Discord quando lead entra |

### 2. Painel CRM &mdash; `apps/painel-crm/`

> Gestao completa de pipeline B2B

| | |
|---|---|
| **Stack** | Next.js 15, React 19, TanStack Query v5, Radix UI, Recharts, dnd-kit |
| **Auth** | Supabase Auth SSR + middleware redirect |

| Pagina | Funcionalidade |
|--------|---------------|
| `/dashboard` | KPIs de leads, conversao, receita pipeline |
| `/leads` | CRUD com filtros (status, origem, temperatura, busca) |
| `/leads/[id]` | Detalhe + timeline de atividades + quiz session |
| `/pipeline` | Kanban drag-and-drop (novo &rarr; qualificado &rarr; reuniao &rarr; proposta &rarr; ganho) |
| `/deals` | Negocios com valor, MRR, probabilidade, tipo servico |
| `/deals/[id]` | Detalhe com historico |
| `/analytics` | Graficos de conversao e performance |
| `/clientes` | Carteira de clientes ativos |
| `/configuracoes` | Configuracoes do painel |

### 3. Painel CFO &mdash; `apps/painel-cfo/`

> Dashboard financeiro completo estilo Linear/Mercury

| | |
|---|---|
| **Stack** | Next.js 15, Turbopack, TanStack Query v5, Recharts, Framer Motion |
| **Auth** | Supabase Auth SSR |
| **IA** | Groq (llama-3.3-70b) via Edge Function |

| Pagina | Funcionalidade |
|--------|---------------|
| `/dashboard` | KPIs: Caixa, MRR, Receita, Burn Rate, Runway + alertas IA |
| `/dre` | DRE gerencial com cascata completa (Simples Nacional) |
| `/receitas` | CRUD faturamento com tipo, recorrencia, status |
| `/custos-fixos` | CRUD custos fixos com pie chart distribuicao |
| `/gastos-variaveis` | CRUD por tipo (operacional, marketing, impostos) + CAC |
| `/projecoes` | 3 cenarios (conservador, realista, agressivo) x 12 meses |
| `/balanco-anual` | Grid 12 meses com drill-down |
| `/academy` | Glossario financeiro + chat IA |

**Regra critica:** Simples Nacional &mdash; impostos sobre faturamento, nao sobre lucro.

### 4. Painel CTO &mdash; `apps/painel-cto/`

> Gestao de projetos, entregas e operacao tecnica

| | |
|---|---|
| **Stack** | Next.js 15, React 19, TanStack Query v5, Framer Motion, dnd-kit |
| **Auth** | Supabase Auth SSR |

| Pagina | Funcionalidade |
|--------|---------------|
| `/dashboard` | KPIs de projetos, entregas, milestones, atrasados |
| `/kanban` | Board drag-and-drop com colunas customizaveis |
| `/timeline` | Gantt chart de projetos e entregas |
| `/calendario` | Calendario de eventos e deadlines |
| `/relatorios` | Geracao de relatorios PPTX |
| `/portal` | Portal dos socios com visao macro |

---

## Database Schema

```
SUPABASE (PostgreSQL) — 17+ tabelas + 3 views + 5 enums + 9 triggers

CRM ────────────────────────────────────────────────────────────
  leads (BIGINT PK)          Leads do quiz + diretos
  crm_accounts (UUID PK)     Contas/empresas
  crm_contacts (UUID PK)     Contatos por conta
  crm_opportunities (UUID)   Pipeline de negocios
  crm_proposals (UUID)       Propostas comerciais
  crm_slas (UUID)            SLAs por conta

QUIZ ───────────────────────────────────────────────────────────
  quiz_leads (UUID PK)       Respostas completas do diagnostico

CFO ────────────────────────────────────────────────────────────
  receitas                   Faturamento (valor_liquido = generated column)
  custos_fixos               Custos mensais fixos por categoria
  gastos_variaveis           Custos variaveis por tipo (marketing/impostos/ops)
  caixa                      Saldo em conta por banco
  projecoes                  Cenarios financeiros (conservador/realista/agressivo)
  metas_financeiras          Metas por periodo e metrica
  emprestimo_socio           Emprestimos entre socios
  historico_decisoes         Log de decisoes estrategicas

VIEWS ──────────────────────────────────────────────────────────
  vw_resumo_mensal           Receita bruta/liquida, MRR, clientes por mes
  vw_custos_fixos_mensal     Total custos fixos ativos
  vw_gastos_variaveis_mensal Gastos por tipo por mes
```

### Triggers Cross-Panel

```
Deal status → 'ganho'        → Cria receita no CFO + Cria projeto automaticamente
Projeto status → 'entregue'  → Log no historico_decisoes
Lead origem → 'meta_ads'     → Cria gasto variavel no CFO (10% valor estimado)
Lead status muda             → Cria atividade automatica na timeline CRM
Quiz lead INSERT             → Webhooks Discord/n8n
Proposta status → 'Aceita'   → Seta respondida_em + sent_date automaticamente
```

### Migrations

| # | Arquivo | O que faz |
|---|---------|-----------|
| 001 | `unified_schema.sql` | leads, deals, projetos, tarefas + enums + triggers cross-panel |
| 002 | `cfo_tables_versioned.sql` | 8 tabelas CFO + 3 views SQL |
| 003 | `fix_crm_cfo_bridge.sql` | Reescreve triggers para tabelas reais + quiz_sessions |
| 004 | `crm_enhancements.sql` | atividades, colunas extras em leads/deals, trigger status |
| 005 | `anon_insert_leads.sql` | Abre INSERT anon para quiz publico |
| 006 | `quiz_leads_table.sql` | Tabela quiz_leads para diagnostico do site |
| 007 | `jarvis_schema.sql` | Tabelas de agentes e memoria |
| 008 | `propostas.sql` | Extende crm_proposals |
| 009 | `quiz_lead_webhook.sql` | Trigger quiz_leads INSERT &rarr; webhook |
| 010 | `quiz_lead_discord_n8n_webhooks.sql` | Webhooks Discord e n8n |

---

## Stack Tecnica

```
FRONTEND
  Next.js 15          App Router + React 19 + TypeScript strict
  Tailwind CSS 3.4    Utility-first + custom dark theme
  Radix UI            Primitivos acessiveis (Dialog, Select, Tabs, Tooltip)
  TanStack Query v5   Server state + cache + invalidation
  Recharts            Graficos (ComposedChart, PieChart, AreaChart)
  Framer Motion       Animacoes e transicoes de pagina
  dnd-kit             Drag and drop (Kanban pipeline)
  Zod                 Validacao de forms
  lucide-react        Icones consistentes

DATABASE
  Supabase            PostgreSQL 15 + Auth + Realtime + Storage
  RLS                 Row Level Security em todas as tabelas

INFRA
  Vercel              Deploy frontend (zero-config)
  n8n                 Automacao de workflows (email nurturing)
```

---

## Quick Start

### Pre-requisitos

- Node.js 20+
- Conta Supabase (gratuita funciona)

### 1. Clone

```bash
git clone https://github.com/Daniellpego/Ecosistema-BG-Tech-2026.git
cd Ecosistema-BG-Tech-2026
```

### 2. Supabase

```bash
# Crie projeto em supabase.com
# SQL Editor → cole e rode cada migration em ordem (001 a 010)
```

### 3. Paineis

```bash
# CRM
cd apps/painel-crm && npm install && npm run dev

# CFO
cd apps/painel-cfo && npm install && npm run dev

# CTO
cd apps/painel-cto && npm install && npm run dev
```

### 4. Site Principal

```bash
cd site-principal && npm install && npm run dev
```

---

## Seguranca

- **RLS** em todas as tabelas &mdash; zero tabela aberta
- **Auth** via Supabase (email/senha) com SSR middleware
- **Anon** bloqueado por policy restritiva (exceto INSERT quiz publico)
- **Variaveis** de ambiente em `.env` (nunca versionadas)

---

## Estrutura do Repositorio

```
Ecosistema-BG-Tech-2026/
|
|-- site-principal/                  Next.js 14 — gradios.co
|   |-- src/app/diagnostico/         Quiz de qualificacao
|   |-- src/components/              Hero, FAQ, LeadForm, Testimonials
|   +-- src/app/api/diagnostico/     Claude streaming API route
|
|-- apps/
|   |-- painel-crm/                  Next.js 15 — CRM completo
|   |   |-- src/app/(authenticated)/ 9 paginas protegidas
|   |   +-- src/hooks/               useLeads, useDeals, usePipeline
|   |
|   |-- painel-cfo/                  Next.js 15 — CFO dashboard
|   |   |-- src/app/(authenticated)/ 10 paginas protegidas
|   |   +-- src/hooks/               useDashboard, useDRE, useProjecoes
|   |
|   +-- painel-cto/                  Next.js 15 — CTO operacoes
|       |-- src/app/(authenticated)/ 7 paginas protegidas
|       +-- src/hooks/               useProjetos, useKanban
|
|-- supabase/
|   |-- migrations/                  10 migrations versionadas (001-010)
|   +-- functions/
|       +-- groq-analysis/           Edge Function para CFO IA
|
|-- infra/
|   +-- supabase/rls-hardening.sql   Policies RLS extras
|
|-- n8n-workflows/                   Automacoes n8n (email nurturing)
|
|-- .github/workflows/               CI/CD (Playwright tests)
|-- CLAUDE.md                        Guia do ecossistema para Claude Code
+-- ECOSYSTEM.md                     Contexto completo do ecossistema
```

---

<p align="center">
  <strong>GRADIOS</strong> &mdash; O cerebro da sua operacao<br/>
  Automacao + Software sob medida + Resultado em 2 semanas<br/><br/>
  <a href="https://www.gradios.co">gradios.co</a> &bull;
  <a href="https://github.com/Daniellpego/Ecosistema-BG-Tech-2026">GitHub</a> &bull;
  contato@gradios.co
</p>
