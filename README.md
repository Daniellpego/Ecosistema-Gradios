<p align="center">
  <img src="logo oficial bg.png" alt="Gradios" width="200" />
</p>

<h1 align="center">GRADIOS Ecosystem 2026</h1>

<p align="center">
  <strong>Plataforma de automacao empresarial com IA C-Level integrada</strong><br/>
  6 sistemas interligados em tempo real &mdash; CRM, CFO, Projetos, Site, Quiz e JARVIS AI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Producao-10B981?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/Sistemas-6-6366F1?style=flat-square" />
  <img src="https://img.shields.io/badge/AI_Agents-8-F59E0B?style=flat-square" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Ollama-Qwen2.5:14b-blue?style=flat-square" />
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
                      |  quiz_leads    |------> Trigger 009
                      +-------+--------+              |
                              |                       v
              +---------------+---------------+  POST /jarvis/crm/novo-lead
              |               |               |       |
              v               v               v       v
       +----------+    +-----------+    +---------+  +------------------+
       |  PAINEL  |    |  PAINEL   |    | PAINEL  |  |  JARVIS AI       |
       |   CRM    |    |   CFO     |    | PROJETOS|  |  8 Agents        |
       |          |    |           |    |         |  |  C-Level 24/7    |
       | Leads    |    | Receitas  |    | Kanban  |  |                  |
       | Deals    |    | DRE       |    | Tasks   |  | CRM: Aaron Ross  |
       | Pipeline |    | Projecoes |    | Timeline|  | CFO: Cerbasi     |
       | Scripts  |    | Caixa     |    |         |  | Copy: Wiebe      |
       +----+-----+    +-----+-----+    +----+----+  | Dev: Rauch       |
            |               |               |        | Ads: Larry Kim   |
            +-------+-------+-------+-------+        | Fiscal: EY Tax   |
                    |               |                 | Brand: Scher     |
                    v               v                 | Manufatura: Siemens
             +-----------+   +-----------+            +--------+---------+
             | Triggers  |   | Realtime  |                     |
             | Cross-    |   | WebSocket |              Ollama qwen2.5:14b
             | Panel     |   |           |              RTX 4070Ti (local)
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
| **Webhook** | Notifica equipe no Discord/Slack quando lead entra |
| **Integracao** | Grava em `quiz_leads` → trigger notifica JARVIS automaticamente |

### 2. Painel CRM &mdash; `apps/painel-crm/`

> Gestao completa de pipeline B2B

| | |
|---|---|
| **Stack** | Next.js 15, React 19, TanStack Query v5, Radix UI, Recharts, dnd-kit |
| **Auth** | Supabase Auth SSR + middleware redirect |
| **Porta** | `localhost:3001` |

| Pagina | Funcionalidade |
|--------|---------------|
| `/dashboard` | KPIs de leads, conversao, receita pipeline |
| `/leads` | CRUD com filtros (status, origem, temperatura, busca) |
| `/leads/[id]` | Detalhe + timeline de atividades + quiz session |
| `/pipeline` | Kanban drag-and-drop (novo → qualificado → reuniao → proposta → ganho) |
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
| `/relatorios` | Relatorios gerenciais |

**Regra critica:** Simples Nacional &mdash; impostos sobre faturamento, nao sobre lucro.

### 4. Painel Projetos &mdash; `apps/painel-projetos/`

> Gestao de projetos e tarefas (legado)

| | |
|---|---|
| **Stack** | HTML/CSS/JS puro (static) |
| **Views** | Dashboard, Kanban (todo/doing/done), Projetos, Timeline |

### 5. JARVIS AI &mdash; `gradios-jarvis/`

> Orquestrador multi-agent C-Level com IA local

| | |
|---|---|
| **Stack** | FastAPI 0.115, Python 3.14, httpx |
| **IA local** | Ollama qwen2.5:14b na RTX 4070Ti (12GB VRAM) |
| **IA premium** | Claude Opus (Anthropic API) para casos complexos |
| **Supabase** | REST API direto via httpx &mdash; zero SDK externo |
| **Porta** | `localhost:8001` |

#### 8 Agents de Elite

| Agent | Persona | Especialidade |
|-------|---------|---------------|
| **CRM** | Aaron Ross (Predictable Revenue) | Pipeline B2B, scripts de abordagem, follow-up sequences |
| **CFO** | Gustavo Cerbasi + Aswath Damodaran | DRE, Simples Nacional, precificacao, valuation |
| **Copy** | Joanna Wiebe + Gary Halbert + Andre Siqueira | Copy B2B, 6 frameworks (AIDA, PAS, PASTOR, 4Ps, BAB), 3 variacoes |
| **Dev** | Guillermo Rauch + Theo Browne | Stack completa do ecossistema, codigo producao |
| **Fiscal** | Renato Leblon (EY Tax) | Simples Nacional Anexo III, Reforma Tributaria 2026 (CBS/IBS/IS) |
| **Ads** | Larry Kim + Rafael Kiso | Meta/Google Ads B2B, CAC/ROAS, estrutura campanha completa |
| **Brand** | Paula Scher + Marty Neumeier | Identidade visual, brand guidelines, vocabulario GRADIOS |
| **Manufatura** | Siemens + McKinsey Ops | ROI industrial, OEE, NR-12, Industry 4.0, payback |

#### API Endpoints

```
GET    /                              Status da API
GET    /agents                        Lista 8 agents
GET    /health                        Health check (Ollama + Supabase + Claude)

POST   /jarvis/{agent}                Chamar agent (contexto CRM/CFO automatico)
POST   /jarvis/{agent}/stream         Streaming SSE token a token
POST   /jarvis/orchestrate            Multi-agent automatico por keywords

GET    /jarvis/crm/leads              Analise do pipeline com IA
POST   /jarvis/crm/novo-lead          Webhook: quiz → scripts WhatsApp + email
POST   /jarvis/crm/gerar-proposta     Proposta comercial markdown com 1 clique

GET    /jarvis/cfo/resumo             DRE + KPIs + analise IA do mes
```

#### Fluxo: Lead → Proposta (automatico)

```
Lead completa quiz no gradios.co/diagnostico
        |
        v
Supabase grava em quiz_leads
        |
        v
Trigger 009 dispara pg_net HTTP POST
        |
        v
POST /jarvis/crm/novo-lead
        |
        v
Aaron Ross (CRM agent) analisa com Ollama:
  - Classifica: Tier A/B/C/D por score
  - Gera script WhatsApp personalizado
  - Gera script email personalizado
  - Define proxima acao + SLA
  - Salva em jarvis_studies + jarvis_memory
        |
        v
POST /jarvis/crm/gerar-proposta (1 clique)
        |
        v
Copy agent (Wiebe+Halbert) gera proposta completa:
  - Problema (especifico, com numeros)
  - Solucao (servicos concretos)
  - Cronograma (3 fases, 6 semanas)
  - 3 opcoes de valor (essencial/completa/premium)
  - CTA com urgencia
  - Salva em crm_proposals + jarvis_studies
```

### 6. JARVIS UI &mdash; `apps/gradios-ui/`

> Interface dark mode premium para o JARVIS

| | |
|---|---|
| **Stack** | Next.js 15, React 19, Tailwind 3.4, lucide-react |
| **Features** | Chat streaming, markdown rendering, syntax highlight |
| **Porta** | `localhost:3000` |
| **Paginas** | `/` chat, `/dashboard` status, `/estudos` biblioteca, `/config` |

---

## Database Schema

```
SUPABASE (PostgreSQL) — 21 tabelas + 3 views + 5 enums + 9 triggers

CRM ────────────────────────────────────────────────────────────
  leads (BIGINT PK)          Leads do quiz + diretos
  crm_accounts (UUID PK)     Contas/empresas
  crm_contacts (UUID PK)     Contatos por conta
  crm_opportunities (UUID)   Pipeline de negocios
  crm_proposals (UUID)       Propostas comerciais (+ campos JARVIS)
  crm_slas (UUID)            SLAs por conta

QUIZ ───────────────────────────────────────────────────────────
  quiz_leads (UUID PK)       Respostas completas do diagnostico
                             → trigger 009: notifica JARVIS

CFO ────────────────────────────────────────────────────────────
  receitas                   Faturamento (valor_liquido = generated column)
  custos_fixos               Custos mensais fixos por categoria
  gastos_variaveis           Custos variaveis por tipo (marketing/impostos/ops)
  caixa                      Saldo em conta por banco
  projecoes                  Cenarios financeiros (conservador/realista/agressivo)
  metas_financeiras          Metas por periodo e metrica
  emprestimo_socio           Emprestimos entre socios
  historico_decisoes         Log de decisoes estrategicas
  configuracoes_cfo          Configuracoes do painel

JARVIS ─────────────────────────────────────────────────────────
  jarvis_agents              8 agents com system prompts configuravel
  jarvis_memory              Historico de conversas por sessao (FK → leads)
  jarvis_studies             Estudos e analises gerados
  jarvis_orchestrations      Log de chamadas multi-agent (JSONB)

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
Quiz lead INSERT             → HTTP POST para JARVIS /crm/novo-lead
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
| 007 | `jarvis_schema.sql` | jarvis_agents, jarvis_memory, jarvis_studies, jarvis_orchestrations |
| 008 | `propostas.sql` | Extende crm_proposals com campos JARVIS |
| 009 | `quiz_lead_webhook.sql` | Trigger quiz_leads INSERT → pg_net → JARVIS |

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
  react-markdown      Rendering markdown nas respostas do JARVIS

BACKEND
  FastAPI 0.115       API async Python
  httpx               HTTP client (Ollama + Supabase REST)
  Pydantic v2         Validacao de payloads
  Ollama              Inference local (qwen2.5:14b)
  Anthropic SDK       Claude API para casos premium

DATABASE
  Supabase            PostgreSQL 15 + Auth + Realtime + Storage
  RLS                 Row Level Security em todas as tabelas
  pg_net              Webhooks HTTP async (trigger → JARVIS)

INFRA
  Vercel              Deploy frontend (zero-config)
  Docker Compose      Ollama GPU + API + UI + Redis
  RTX 4070Ti          12GB VRAM para inference local
```

---

## Quick Start

### Pre-requisitos

- Node.js 20+
- Python 3.12+
- Ollama com modelo `qwen2.5:14b`
- Conta Supabase (gratuita funciona)

### 1. Clone

```bash
git clone https://github.com/Daniellpego/Ecosistema-BG-Tech-2026.git
cd Ecosistema-BG-Tech-2026
```

### 2. Supabase

```bash
# Crie projeto em supabase.com
# SQL Editor → cole e rode cada migration em ordem (001 a 009)
# Ou use o arquivo consolidado:
# SQL Editor → cole APPLY_MIGRATIONS_007_008.sql → RUN
```

### 3. JARVIS API

```bash
cd gradios-jarvis
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Configure .env
echo SUPABASE_URL=https://urpuiznydrlwmaqhdids.supabase.co > .env
echo SUPABASE_KEY=sua_service_role_key >> .env
echo OLLAMA_URL=http://localhost:11434 >> .env
echo OLLAMA_MODEL=qwen2.5:14b >> .env

# Suba
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### 4. JARVIS UI

```bash
cd apps/gradios-ui
npm install
npm run dev    # localhost:3000
```

### 5. Paineis (CRM/CFO)

```bash
cd apps/painel-crm && npm install && npm run dev    # localhost:3001
cd apps/painel-cfo && npm install && npm run dev    # localhost:3000
```

### 6. Testar

```bash
# Health check
curl http://localhost:8001/health

# Testar agent CRM
curl -X POST http://localhost:8001/jarvis/crm \
  -H "Content-Type: application/json" \
  -d '{"message": "analise o pipeline atual"}'

# Simular novo lead do quiz
curl -X POST http://localhost:8001/jarvis/crm/novo-lead \
  -H "Content-Type: application/json" \
  -d '{"lead": {"nome": "Carlos Silva", "empresa": "TechFlow", "score": 78, "setor": "SaaS"}}'

# Gerar proposta com 1 clique
curl -X POST http://localhost:8001/jarvis/crm/gerar-proposta \
  -H "Content-Type: application/json" \
  -d '{"dados_lead": {"nome": "Carlos Silva", "empresa": "TechFlow", "segmento": "SaaS", "dor_principal": "CRM desatualizado", "score": 78}, "valor_estimado": 15000, "servicos": ["automacao", "integracao CRM"]}'
```

### Docker (alternativa)

```bash
docker-compose up -d    # Ollama GPU + API + UI + Redis
```

---

## Seguranca

- **RLS** em todas as 21 tabelas &mdash; zero tabela aberta
- **Auth** via Supabase (email/senha) com SSR middleware
- **Anon** bloqueado por policy restritiva (exceto INSERT quiz publico)
- **Service role** apenas no JARVIS API (bypassa RLS)
- **CORS** configurado no FastAPI
- **Variaveis** de ambiente em `.env` (nunca versionadas)
- **Retry** 3x com backoff no Ollama (nao expoe erros ao usuario)

---

## Estrutura do Repositorio

```
Ecosistema-BG-Tech-2026/
|
|-- site-principal/                  Next.js 14 — gradios.co
|   |-- src/app/diagnostico/         Quiz de qualificacao (1190 linhas)
|   |-- src/components/              Hero, FAQ, LeadForm, Testimonials
|   +-- src/app/api/diagnostico/     Claude streaming API route
|
|-- apps/
|   |-- painel-crm/                  Next.js 15 — CRM completo
|   |   |-- src/app/(authenticated)/ 9 paginas protegidas
|   |   |-- src/hooks/               useLeads, useDeals, usePipeline
|   |   +-- src/types/database.ts    Tipos CRM (195 linhas)
|   |
|   |-- painel-cfo/                  Next.js 15 — CFO dashboard
|   |   |-- src/app/(authenticated)/ 10 paginas protegidas
|   |   |-- src/hooks/               useDashboard, useDRE, useProjecoes
|   |   +-- src/types/database.ts    Tipos CFO (177 linhas)
|   |
|   |-- painel-projetos/             HTML/JS — gestao projetos
|   |
|   +-- gradios-ui/                  Next.js 15 — JARVIS interface
|       |-- app/                     Chat, dashboard, estudos, config
|       |-- components/              ChatMessage, AgentCard, Markdown
|       +-- lib/                     API client, hooks, constants
|
|-- gradios-jarvis/                  FastAPI — JARVIS API
|   |-- app.py                       API completa (~1300 linhas)
|   |-- requirements.txt             7 dependencias (zero supabase-py)
|   |-- Dockerfile                   Python 3.12 slim
|   +-- supabase/agents.sql          Schema original dos agents
|
|-- supabase/
|   |-- migrations/
|   |   |-- 001_unified_schema.sql   CRM + triggers cross-panel
|   |   |-- 002_cfo_tables.sql       8 tabelas CFO + 3 views
|   |   |-- 003_fix_crm_cfo.sql      Bridge CRM↔CFO corrigido
|   |   |-- 004_crm_enhancements.sql Atividades + colunas extras
|   |   |-- 005_anon_insert.sql      Quiz publico (anon INSERT)
|   |   |-- 006_quiz_leads.sql       Tabela quiz_leads
|   |   |-- 007_jarvis_schema.sql    4 tabelas JARVIS
|   |   |-- 008_propostas.sql        Extende crm_proposals
|   |   +-- 009_quiz_webhook.sql     Trigger → JARVIS
|   +-- functions/
|       +-- groq-analysis/           Edge Function para CFO IA
|
|-- ECOSYSTEM.md                     Mapa completo do ecossistema
|-- APPLY_MIGRATIONS_007_008.sql     SQL consolidado para Supabase
|-- docker-compose.yml               Ollama GPU + API + UI + Redis
|-- start.bat / stop.bat             Scripts Windows
|-- test_jarvis_integrations.py      Teste completo da API
+-- test_novo_lead_webhook.bat       Teste do webhook de lead
```

---

## Metricas do Projeto

| Metrica | Valor |
|---------|-------|
| Tabelas Supabase | 21 |
| Views SQL | 3 |
| Triggers cross-panel | 9 |
| Migrations versionadas | 9 |
| Agents IA | 8 |
| API endpoints | 10 |
| Paginas frontend (total) | 25+ |
| Dependencias JARVIS | 7 |
| Tempo de geracao proposta | ~68s (local RTX 4070Ti) |
| Tempo analise novo lead | ~45s (local) |

---

<p align="center">
  <strong>GRADIOS</strong> &mdash; O cerebro da sua operacao<br/>
  Automacao + Software sob medida + Resultado em 2 semanas<br/><br/>
  <a href="https://www.gradios.co">gradios.co</a> &bull;
  <a href="https://github.com/Daniellpego/Ecosistema-BG-Tech-2026">GitHub</a> &bull;
  contato@gradios.co
</p>
