# LOGIC & USABILITY OPERATIONAL AUDIT — Painel CFO

Data: 2026-03-05  
Escopo: `painel-cfo/index.html`, `painel-cfo/api/painel.js`, testes E2E 06/07/08/09 e nova suíte 10.

## Sumário executivo

### P0
1. **Parsing/export com datas legadas era inconsistente** (filtro usava normalização parcial e export fazia split direto em `-`).  
   - Impacto: itens com data legada poderiam cair fora do período exportado.
2. **Confiabilidade operacional do fluxo de save**: `pushSync()` não retornava resultado booleano; mutações marcavam sucesso mesmo com erro remoto.
   - Impacto: telemetria/estado operacional podia indicar sucesso indevido no ciclo da mutação.

### P1
3. **Validação API insuficiente para `projecoes` e timestamps CAS**.  
   - Impacto: payload malformado podia gerar inconsistência de estado e conflitos difíceis de diagnosticar.

### P2
4. **Escala/performance com 5k–10k itens** permanece dívida técnica (não validada por limitação do ambiente de teste).

## Matriz de risco (Impacto x Probabilidade)

| ID | Achado | Impacto | Probabilidade | Severidade |
|---|---|---|---|---|
| R1 | Export com parse inconsistente de datas legadas | Alto | Média | P0 |
| R2 | Mutação marcar sucesso sem retorno explícito de push | Alto | Média | P0 |
| R3 | API sem validação estrita de projecoes/timestamps | Médio | Média | P1 |
| R4 | Render/filtro em dataset massivo | Médio | Baixa | P2 |

## Checklist de auditoria (PASS/FAIL + evidência)

### 1) Consistência de filtros (P0)
- **PASS (com patch):** normalização centralizada via `getDateParts()` aplicada ao `filterData()` e export.  
- Evidência: patch no `index.html`.

### 2) Parsing de data & timezone (P0)
- **PASS (com patch):** `_normDate` agora suporta `YYYY-MM-DD`, `DD/MM/YYYY` e `DD/MM` (legado, ano corrente).  
- **PASS (com patch):** export usa parse robusto (`getDateParts`) no recorte temporal e ordenação.

### 3) Status, recorrência e automáticos (P0)
- **PASS parcial:** status `Confirmado` segue base para KPIs; `Cancelado` não entra em `isConf`.  
- **PASS:** recorrência usa id determinístico (já no patch anterior).  
- **PASS:** imposto automático em projeções marcado com id determinístico (`data-auto-id`).

### 4) Lógica financeira (P0/P1)
- **PASS parcial:** guardas NaN/Infinity já existentes nos KPIs; `calcTax` consistente em 6%.  
- **P1 aberto:** definição de runway quando burn=0 mantém regra atual (`99+`), sem erro matemático.

### 5) DRE & Balanço (P1)
- **PASS parcial:** DRE, overview e annual compartilham base de filtro/status `Confirmado`.  
- **P1 aberto:** validação exaustiva com dataset controlado depende execução E2E completa.

### 6) Projeções (P1)
- **PASS parcial:** consolidado trimestral soma mês a mês e imposto 6%.  
- **PASS:** auto-item de imposto com identificador determinístico estável.

### 7) Export (P1)
- **PASS (com patch):** CSV já tinha escaping RFC4180 + prevenção de fórmula; mantido.  
- **PASS (com patch):** parse de data no range de export corrigido para formatos legados.

### 8) UX operacional (P0)
- **PASS (com patch):** `pushSync()` retorna booleano e mutações registram `ok` real no ciclo operacional.
- **PASS parcial:** em erro de sync continua sinalização por `syncUI('err')` e toast já existente.

### 9) Performance/escala (P2)
- **FAIL (não validado):** sem evidência de benchmark 5k–10k por limitação de execução de Playwright no ambiente.

## Achados detalhados

### A1 — Export com parsing inconsistente (P0)
- Causa raiz: `runExport()` fazia split direto em `-` e não reutilizava normalização do app.
- Reprodução: item com `data=15/03/2026` pode não entrar no filtro de período exportado.
- Impacto: relatório incompleto e divergente dos KPIs/tabelas.
- Fix aplicado: `getDateParts()` + uso em filtro e ordenação do export.

### A2 — Resultado operacional de save sem retorno explícito (P0)
- Causa raiz: `pushSync()` retornava `undefined` em sucesso/erro; mutações definiam `ok=true` após `await`.
- Reprodução: falha de push ainda podia encerrar ciclo com `ok=true` local na mutação.
- Impacto: inconsciência operacional em logs de mutação.
- Fix aplicado: `pushSync()` retorna boolean (`true` sucesso, `false` falha) e callers usam retorno real.

### A3 — Validação backend incompleta (P1)
- Causa raiz: API aceitava `projecoes` objeto sem validar arrays internas e timestamps CAS não eram validados.
- Reprodução: payload inválido em `projecoes` poderia gerar estado quebrado no frontend.
- Impacto: inconsistência funcional/sync.
- Fix aplicado: validação de `projecoes.entradas/saidas` e ISO parse para `updated_at/expected_updated_at`.

## Critérios de aceite por área

### KPIs
- Nunca exibir `NaN`/`Infinity`.
- Coerência com filtros de mês/ano/cliente/projeto.
- Receita/custos consistentes com status `Confirmado`.

### CRUD
- Salvar/editar/excluir sem perda em corrida de sync.
- Recorrência não duplica fora da regra esperada.
- IDs automáticos/recorrentes determinísticos.

### Sync
- Polling silencioso só aplica quando `updated_at` muda.
- Conflito 409 mescla e retry sem render intermediário de base remota.
- Erro de sync sinaliza estado operacional de forma consistente.

### Export
- CSV com escape RFC4180 + anti formula injection.
- Filtro temporal coerente com parsing do app.
- Ordem temporal consistente para dados legados e atuais.

## Evidências de execução
- Comandos de execução e limitações do ambiente (403 para Playwright) documentados em `MIXBUG-logs.md`.
- Suíte complementar criada: `tests/e2e/10-logic-usability.spec.js`.

## Evidência de testes executados nesta auditoria

Comandos executados:
- `node --check` em:
  - script extraído do `index.html`
  - `tests/e2e/09-mixbug.spec.js`
  - `tests/e2e/10-logic-usability.spec.js`
  - `tests/e2e/helpers.js`
  - `api/painel.js`
- `npx playwright test --config=playwright.config.js e2e/06-concurrency.spec.js`
- `npx playwright test --config=playwright.config.js e2e/07-persistence.spec.js e2e/08-dashboard-sync.spec.js e2e/09-mixbug.spec.js e2e/10-logic-usability.spec.js`

Resultado:
- Execução de browser E2E bloqueada no ambiente por ausência dos executáveis dos browsers Playwright (`chromium_headless_shell` / `webkit`), com instrução de `npx playwright install`.
- Também houve warning de env para credenciais Supabase ausentes no webServer local (`Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars`).

Impacto na auditoria:
- A auditoria entrega patches de lógica + suíte de edge-cases.
- A validação E2E completa fica pendente de ambiente com browsers Playwright instalados e credenciais de teste.
