# Auditoria Técnica Completa — Ecosistema Gradios 2026

**Data:** 2026-03-15
**Auditor:** Vault (DevSecOps Team Lead)
**Escopo:** Segurança, Performance, Bugs Críticos, Supabase Views

---

## Resumo Executivo

| Severidade | Qtd |
|---|---|
| CRÍTICO | 2 |
| ALTO | 7 |
| MÉDIO | 10 |
| BAIXO | 4 |

---

## 1. SEGURANÇA

### SEC-01 — URL Supabase hardcoded em código público [MÉDIO]

A URL do projeto Supabase (`https://urpuiznydrlwmaqhdids.supabase.co`) está hardcoded em arquivos client-side, expondo o endpoint para enumeração.

| Arquivo | Linha |
|---|---|
| `site-principal/config.js` | 22 |
| `site-principal/script.js` | 7 |
| `apps/painel-cfo/.env.local.example` | 1 |
| `apps/painel-cfo/DEPLOY_VERCEL.md` | 33 |
| `apps/painel-cfo/README.md` | 20 |
| `CLAUDE.md` | 23–24 |
| `apps/painel-crm/src/app/(authenticated)/configuracoes/page.tsx` | 98 |

**Ação:** Substituir por placeholders nos exemplos e docs. No client-side, injetar via variável de ambiente no build.
**Tempo estimado:** 1h

### SEC-02 — Comentário incentivando commit de anon key [BAIXO]

`site-principal/config.js` linha 23 contém:
```js
supabaseAnonKey: '', // ← COLAR A ANON KEY AQUI
```
Se um dev seguir a instrução, a key será commitada.

**Ação:** Remover comentário, documentar uso de env var.
**Tempo estimado:** 15min

### SEC-03 — PII empresarial em código fonte [BAIXO]

Telefone, CNPJ e e-mails empresariais hardcoded em `site-principal/config.js`. Intencional para site público mas vale documentar a decisão.

### SEC-04 — service_role key corretamente server-side [OK ✓]

`api/painel.js` linha 21 lê `process.env.SUPABASE_SERVICE_ROLE_KEY`. Nenhuma key hardcoded.

### SEC-05 — Nenhum .env real commitado [OK ✓]

Apenas `.env.example` e `.env.local.example` no histórico git. `.gitignore` correto.

### SEC-06 — Nenhum JWT/Bearer token hardcoded [OK ✓]

Scan de padrão `eyJ` retornou zero resultados.

### SEC-07 — build.js sem credenciais embutidas [OK ✓]

`apps/painel-crm/build.js` e `apps/painel-projetos/build.js` leem de `process.env` com fallback para string vazia. Output gerado em `.gitignore`.

---

## 2. PERFORMANCE — Top 5 Gargalos

### PERF-01 — Dashboard CFO: 9 queries concorrentes com sobreposição [ALTO]

`apps/painel-cfo/src/hooks/use-dashboard.ts` linhas 133–265

Dispara 9 queries simultâneas ao Supabase, incluindo 3× `receitas` e 3× `gastos_variaveis` com ranges parcialmente sobrepostos. Isso é agravado por `useDRE` que adiciona mais 5–7 queries às mesmas tabelas.

**Ação:** Migrar para as views SQL existentes (`vw_resumo_mensal`, etc.) — reduz de 9 para 2–3 queries.
**Tempo estimado:** 4h

### PERF-02 — useClientesSuggestions busca tabela inteira sem filtro [ALTO]

`apps/painel-cfo/src/hooks/use-receitas.ts` linhas 88–104

```ts
supabase.from('receitas').select('cliente')  // sem .limit(), sem filtro de data
```

Baixa TODOS os registros de receitas apenas para extrair nomes únicos de clientes.

**Ação:** Adicionar `.limit(1000)` ou criar uma view/RPC `distinct_clientes`.
**Tempo estimado:** 30min

### PERF-03 — DRE chart agrega 12 meses de dados em JavaScript [ALTO]

`apps/painel-cfo/src/hooks/use-dre.ts` linhas 246–316

O `chartQuery` baixa todos os registros de receitas e gastos_variaveis dos últimos 12 meses e faz bucketing mensal no client. As views SQL `vw_resumo_mensal` já fazem isso no PostgreSQL.

**Ação:** Substituir por query à `vw_resumo_mensal`.
**Tempo estimado:** 2h

### PERF-04 — Nenhuma paginação em listas de leads/deals/receitas [MÉDIO]

Queries sem `.limit()` ou `.range()`:

| Hook | Arquivo |
|---|---|
| `useLeads()` | `use-leads.ts:36` |
| `useAllLeads()` | `use-leads.ts:70` |
| `usePipelineLeads()` | `use-leads.ts:267` |
| `useDeals()` | `use-deals.ts:29` |
| `useReceitas()` | `use-receitas.ts:22` |
| `useGastosVariaveis()` | `use-gastos-variaveis.ts:20` |
| `fetchProjetos()` | `apps/painel-projetos/js/db.js:10` |
| `fetchAllTarefas()` | `apps/painel-projetos/js/db.js:62` |

**Ação:** Implementar paginação server-side com `.range(from, to)`.
**Tempo estimado:** 6h (todas as listas)

### PERF-05 — Bundle size: framer-motion (~100KB gz) para transições simples [MÉDIO]

Ambos painel-cfo e painel-crm importam `framer-motion` globalmente via barrel export `@/components/motion`, mas usam apenas para fade-in de página.

**Ação:** Substituir por CSS transitions ou `dynamic(() => import('framer-motion'))`.
**Tempo estimado:** 2h

---

## 3. BUGS CRÍTICOS

### BUG-01 — Nenhum Error Boundary em nenhum dos apps Next.js [CRÍTICO]

`apps/painel-cfo/src/app/layout.tsx` linhas 12–24
`apps/painel-crm/src/app/layout.tsx` linhas 12–24

Nenhum `<ErrorBoundary>` ou `error.tsx` do Next.js existe. Qualquer erro de runtime em um componente client derruba toda a árvore React sem UI de recuperação.

**Ação:** Criar `error.tsx` nos route groups `(authenticated)` e no root.
**Tempo estimado:** 1h

### BUG-02 — 'Sistema' hardcoded NÃO foi totalmente corrigido [CRÍTICO]

O commit `a298da7` corrigiu apenas 1 de 4 locais. Restam:

| Arquivo | Linha | Contexto |
|---|---|---|
| `apps/painel-crm/src/components/leads/lead-form.tsx` | 58, 72 | Default `responsavel: 'Sistema'` no form state e `resetForm()` |
| `apps/painel-crm/src/hooks/use-quiz-realtime.ts` | 54 | Leads criados por quiz recebem `responsavel: 'Sistema'` |
| `site-principal/script.js` | 1311 | Quiz público também hardcoda `responsavel: 'Sistema'` |

**Ação:** Substituir por `currentUser?.name ?? 'Sistema'` nos hooks com contexto de auth, e `'Sistema'` nos contextos sem sessão.
**Tempo estimado:** 1h

### BUG-03 — mutateAsync sem try/catch na página de lead detail [ALTO]

`apps/painel-crm/src/app/(authenticated)/leads/[id]/page.tsx` linhas 119–152

`handleQualifyAI`, `handleStatusChange`, `handleTemperaturaChange`, `handleDelete` chamam `mutateAsync` sem try/catch. Falha na mutação gera unhandled promise rejection.

**Ação:** Envolver em try/catch ou usar `mutate` com callbacks `onError`.
**Tempo estimado:** 30min

### BUG-04 — Quiz-to-CRM link sem error handling [ALTO]

`apps/painel-crm/src/hooks/use-quiz-realtime.ts` linhas 71–76

O PATCH em `quiz_sessions` para vincular `lead_id` não verifica erro — falha silenciosa.

**Ação:** Adicionar verificação de `error` no retorno do update.
**Tempo estimado:** 15min

### BUG-05 — Stale closure no chartQuery do DRE [MÉDIO]

`apps/painel-cfo/src/hooks/use-dre.ts` linhas 245–316

`chartQuery` captura `custosFixosQuery.data` do escopo externo mas o `queryKey` não inclui hash desses dados. Se custos fixos são atualizados, o gráfico mostra dados stale até reload.

**Ação:** Incluir hash de `custosFixosQuery.data` no `queryKey`.
**Tempo estimado:** 15min

### BUG-06 — useQuizRealtime recria canal a cada render [MÉDIO]

`apps/painel-crm/src/hooks/use-quiz-realtime.ts` linha 91

Se `onNewLead` não for memoizado (padrão comum), o `useEffect` destrói e recria o canal Realtime a cada render, podendo perder eventos.

**Ação:** Usar `useRef` para callback ou documentar necessidade de `useCallback`.
**Tempo estimado:** 15min

### BUG-07 — Campo setup_por_cliente não existe no schema [MÉDIO]

`apps/painel-cfo/src/hooks/use-projecoes.ts` linha 117

```ts
const setupPorCliente = Number(cenario.setup_por_cliente ?? 0)
```

A tabela `projecoes` não tem esta coluna. Sempre retorna `undefined` → `0`.

**Ação:** Remover referência ou adicionar coluna na migration.
**Tempo estimado:** 30min

### BUG-08 — Status 'atrasado' e 'planejamento' não existem no enum DB [MÉDIO]

`apps/painel-projetos/js/views/dashboard.js` linha 55
`apps/painel-projetos/js/views/projetos.js` linhas 12–18

O enum `projeto_status` é `('backlog', 'em_andamento', 'revisao', 'entregue', 'cancelado')`. Os status `'atrasado'` e `'planejamento'` nunca terão match.

**Ação:** Alinhar o código JS com o enum do banco ou expandir o enum.
**Tempo estimado:** 30min

### BUG-09 — YTD custos fixos usa snapshot mensal multiplicado [BAIXO]

`apps/painel-cfo/src/hooks/use-dre.ts` linhas 334–344

```ts
cfTotal: ytdRaw.cfTotal * month
```

Multiplica o total de custos fixos ativos do mês atual pelo número de meses. Não considera custos adicionados/removidos durante o ano.

**Ação:** Somar custos fixos mês a mês ou consultar view com histórico.
**Tempo estimado:** 2h

### BUG-10 — N+1 no useDeleteDeal [BAIXO]

`apps/painel-crm/src/hooks/use-deals.ts` linhas 128–154

SELECT + DELETE sequenciais. Em batch delete, gera 2×N queries.

**Ação:** Usar `RETURNING` ou RPC para operação atômica.
**Tempo estimado:** 30min

---

## 4. SUPABASE VIEWS

### Views definidas mas NÃO utilizadas

| View | Definida em | Tipada em | Usada no app? |
|---|---|---|---|
| `vw_resumo_mensal` | `002_cfo_tables_versioned.sql:217` | `database.ts:171` | **NÃO** |
| `vw_custos_fixos_mensal` | migration SQL | `database.ts` | **NÃO** |
| `vw_gastos_variaveis_mensal` | migration SQL | `database.ts` | **NÃO** |

**Impacto:** Os painéis baixam dados brutos e fazem agregação em JavaScript. As views já existem no banco e resolveriam os gargalos PERF-01 e PERF-03.

**Ação:** Refatorar `useDashboard` e `useDRE` para consumir as views.
**Tempo estimado:** 4h (combinado com PERF-01)

---

## 5. PLANO DE AÇÃO

### Prioridade 1 — Correções Imediatas (Pré-deploy)

| # | Item | Severidade | Tempo |
|---|---|---|---|
| 1 | BUG-01: Criar error boundaries | CRÍTICO | 1h |
| 2 | BUG-02: Remover 'Bryan' hardcoded dos 3 locais restantes | CRÍTICO | 1h |
| 3 | BUG-03: Adicionar try/catch nos mutateAsync | ALTO | 30min |
| 4 | BUG-04: Error handling no quiz-to-CRM link | ALTO | 15min |

**Total Prioridade 1:** ~2h45min

### Prioridade 2 — Performance (Sprint atual)

| # | Item | Severidade | Tempo |
|---|---|---|---|
| 5 | PERF-01 + Views: Migrar dashboard para views SQL | ALTO | 4h |
| 6 | PERF-02: Limitar useClientesSuggestions | ALTO | 30min |
| 7 | PERF-03: DRE chart usar views | ALTO | 2h |
| 8 | SEC-01: Remover URL hardcoded dos exemplos | MÉDIO | 1h |

**Total Prioridade 2:** ~7h30min

### Prioridade 3 — Qualidade (Próximo sprint)

| # | Item | Severidade | Tempo |
|---|---|---|---|
| 9 | PERF-04: Paginação server-side | MÉDIO | 6h |
| 10 | PERF-05: Otimizar framer-motion | MÉDIO | 2h |
| 11 | BUG-05: Fix stale closure DRE | MÉDIO | 15min |
| 12 | BUG-06: Memoizar callback realtime | MÉDIO | 15min |
| 13 | BUG-07: Remover setup_por_cliente | MÉDIO | 30min |
| 14 | BUG-08: Alinhar status enum | MÉDIO | 30min |
| 15 | BUG-09: YTD custos fixos histórico | BAIXO | 2h |
| 16 | BUG-10: N+1 useDeleteDeal | BAIXO | 30min |
| 17 | SEC-02: Remover comentário anon key | BAIXO | 15min |

**Total Prioridade 3:** ~12h15min

---

**Total geral estimado:** ~22h30min de trabalho técnico

---

*Relatório gerado automaticamente por auditoria DevSecOps — Vault @ Gradios*
