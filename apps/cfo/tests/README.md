# Painel CFO — E2E Tests (Playwright)

> Pacote standalone (lockfile separado). Instalado só quando rodar E2E.

## Status

- ✅ Estrutura mínima criada (2026-05-11)
- ✅ `e2e/01-smoke.spec.js` — 4 testes smoke (redirect auth, login renderiza, security headers, 404)
- ⏳ Specs 06-10 (concurrency, persistence, dashboard-sync, mixbug, logic-usability) **ainda não escritos** — workflow `painel-cfo-playwright.yml` os referencia mas não roda eles

## Rodar local

```bash
# 1. Sobe o painel CFO em outro terminal
cd apps/cfo
npm install
npm run build
npm run start          # porta 3000

# 2. Em outro terminal, roda os testes
cd apps/cfo/tests
npm install            # baixa @playwright/test
npx playwright install --with-deps chromium   # baixa browser (1x)
npm test               # roda specs
npm run report         # abre report HTML do último run
```

## Rodar contra preview Vercel

```bash
BASE_URL=https://cfo-preview-XYZ.vercel.app npm test
```

## CI (`painel-cfo-playwright.yml`)

- Trigger: `workflow_dispatch` (só manual por enquanto — não bloqueia PR)
- Pra habilitar em PR/push em main: editar o trigger no workflow
- Pra promover, escrever specs 06-10 reais antes

## Escrever spec novo

1. Criar `e2e/NN-nome.spec.js`
2. Padrão: `test.describe('Suíte', () => { test('caso', async ({ page }) => { ... }) })`
3. Asserts críticos da CFO:
   - Cálculos financeiros (DRE cascade)
   - MRR (`recorrente=true AND status='confirmado'`)
   - Burn rate
   - Runway
   - Filtros de período
4. Authentication: usar fixture que setup cookie de sessão Supabase (criar `fixtures/auth.fixture.js`)

## Ver também

- [`apps/cfo/CLAUDE.md`](../CLAUDE.md) — contexto local CFO
- [`../../SECURITY_REPORT.md`](../../../SECURITY_REPORT.md) — auditoria de segurança 10/10
- [`../../DEPLOY_CHECKLIST.md`](../../../DEPLOY_CHECKLIST.md) — fase 2 de validação pós-deploy
