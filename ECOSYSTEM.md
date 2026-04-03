# GRADIOS — ECOSYSTEM.md
# Contexto completo do ecossistema para Claude Code
# Daniel Pego / GRADIOS 2026
# github.com/Daniellpego/Ecosistema-BG-Tech-2026

---

## QUEM SOMOS

**GRADIOS** e uma empresa de engenharia de software e automacao inteligente.
Tagline: "O cerebro da sua operacao"
Proposta: Identificamos o gargalo, construimos a automacao, resultado em 2 semanas.

**O que entregamos para clientes:**
- Automacao de processos (aprovacoes, relatorios, integracoes, notificacoes)
- Desenvolvimento de software sob medida
- Integracoes e APIs entre sistemas
- Dashboards e relatorios em tempo real
- IA aplicada ao negocio (atendimento, analise, decisao)

**Segmentos atendidos:** Varejo, Industria, Logistica, Saude, Financeiro, SaaS

**Contato:** (43) 98837-2540 | contato@gradios.co
**Site:** https://www.gradios.co
**GitHub:** https://github.com/Daniellpego/Ecosistema-BG-Tech-2026

---

## ECOSSISTEMA DE SISTEMAS

O ecossistema GRADIOS e composto por 5 sistemas integrados via Supabase:

```
gradios.co (site principal)
    |
    |-- Quiz/Funil --> capta leads --> Supabase (tabela leads/quiz_leads)
    |                                       |
    |                                       v
    |                              Painel CRM (gestao de pipeline)
    |                                       |
    |                                       v
    |                              Painel CFO (financeiro/metricas)
    |                                       |
    |                                       v
    |                              Painel CTO (projetos/operacao)
```

---

## SISTEMA 1 — SITE PRINCIPAL

**URL:** https://www.gradios.co
**Stack:** Next.js 14 (Vercel)
**Funcao:** Vitrine da empresa + captacao de leads

**Secoes do site:**
- Hero: "Automatize sua operacao. Escale sem contratar mais."
- Solucoes: Automacao, Dev sob medida, Integracoes, Dashboards, Suporte, IA
- Como funciona: Diagnostico → Desenvolvimento → Automacao rodando
- Cases: resultados reais de clientes
- FAQ
- Quiz diagnostico (captura e qualifica leads)

**Fluxo de lead:**
1. Visitante preenche quiz diagnostico
2. Claude Sonnet gera diagnostico personalizado via streaming
3. Dado vai para o Supabase (quiz_leads)
4. Webhook notifica equipe no Discord
5. Lead aparece no Painel CRM

---

## SISTEMA 2 — PAINEL CRM

**Funcao:** Gestao de pipeline de vendas e clientes da GRADIOS
**Stack:** Next.js 15 (Vercel) + Supabase
**Status:** Em producao

**Funcionalidades:**
- Pipeline Kanban: Lead → Contato → Proposta → Negociacao → Cliente
- Perfil completo de cada empresa/contato
- Historico de interacoes e notas
- Propostas comerciais
- Dashboard de conversao por etapa
- Filtros por segmento, status, responsavel

**Tabelas Supabase:** leads, crm_accounts, crm_contacts, crm_opportunities, crm_proposals, crm_slas

---

## SISTEMA 3 — PAINEL CFO

**Funcao:** Dashboard financeiro e estrategico da GRADIOS
**Stack:** Next.js 15 (Vercel) + Supabase + Groq IA
**Status:** Em producao

**Funcionalidades:**
- DRE (Demonstrativo de Resultado) em tempo real
- Fluxo de caixa projetado vs realizado
- MRR (Monthly Recurring Revenue) e crescimento
- CAC (Custo de Aquisicao de Cliente)
- Projecao de receita (3 cenarios x 12 meses)
- Alertas inteligentes via IA (Groq)
- Academy financeira com chat IA

**Tabelas Supabase:** receitas, custos_fixos, gastos_variaveis, caixa, projecoes, metas_financeiras, emprestimo_socio, historico_decisoes

**Regra critica:** Simples Nacional — impostos sobre faturamento, nao sobre lucro.

---

## SISTEMA 4 — PAINEL CTO

**Funcao:** Gestao de projetos, entregas e operacao tecnica
**Stack:** Next.js 15 (Vercel) + Supabase
**Status:** Em producao

**Funcionalidades:**
- Dashboard com KPIs de projetos e entregas
- Kanban drag-and-drop
- Timeline/Gantt de projetos
- Calendario de eventos e deadlines
- Geracao de relatorios
- Portal dos socios com visao macro

---

## INFRAESTRUTURA

**Hospedagem producao:** Vercel (frontend) + Supabase (banco)
**Banco de dados:** Supabase (PostgreSQL) com RLS em todas as tabelas
**IA:** Groq (llama-3.3-70b) via Supabase Edge Function (painel CFO)
**Automacao:** n8n para email nurturing e workflows
**Repositorio:** github.com/Daniellpego/Ecosistema-BG-Tech-2026

**Variaveis de ambiente criticas:**
```
SUPABASE_URL=https://urpuiznydrlwmaqhdids.supabase.co
SUPABASE_KEY=[service_role key]
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GROQ_API_KEY=[para edge function]
```

---

## SCHEMA SUPABASE (tabelas principais)

### CRM
```sql
leads                — leads do quiz + diretos
crm_accounts         — contas/empresas
crm_contacts         — contatos por conta
crm_opportunities    — pipeline de negocios
crm_proposals        — propostas comerciais
crm_slas             — SLAs por conta
```

### Quiz
```sql
quiz_leads           — respostas completas do diagnostico
```

### CFO
```sql
receitas             — faturamento (valor_liquido = generated column)
custos_fixos         — custos mensais fixos por categoria
gastos_variaveis     — custos variaveis por tipo
caixa                — saldo em conta por banco
projecoes            — cenarios financeiros
metas_financeiras    — metas por periodo
emprestimo_socio     — emprestimos entre socios
historico_decisoes   — log de decisoes estrategicas
```

### Views
```sql
vw_resumo_mensal           — receita bruta/liquida, MRR por mes
vw_custos_fixos_mensal     — total custos fixos ativos
vw_gastos_variaveis_mensal — gastos por tipo por mes
```

---

## TRIGGERS CROSS-PANEL

```
Deal status → 'ganho'        → Cria receita no CFO + Cria projeto
Projeto status → 'entregue'  → Log no historico_decisoes
Lead origem → 'meta_ads'     → Cria gasto variavel no CFO
Lead status muda             → Cria atividade automatica no CRM
Quiz lead INSERT             → Webhooks Discord/n8n
Proposta status → 'Aceita'   → Seta respondida_em automaticamente
```
