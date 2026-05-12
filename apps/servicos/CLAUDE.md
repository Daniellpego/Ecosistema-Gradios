# Servicos — Sub-rota gradios.co/servicos (PLACEHOLDER)

> ⚠️ **Status atual: PLACEHOLDER.** App existe estruturalmente (Next.js 15 + Tailwind + assets/tailwind-config compartilhados) mas **`page.tsx` faz redirect 308 → https://gradios.co/solucoes.html**.
> **Não foi mencionado no README raiz original.** Auditoria 2026-05-11 identificou como "zumbi" do repo.
>
> Contexto global: ver [`../../CLAUDE.md`](../../CLAUDE.md).

---

## Por que existe

Esse app foi criado pra servir como sub-rota standalone `gradios.co/servicos` (Next.js separado), mas o desenvolvimento parou antes do `page.tsx`. Hipóteses:

1. **Era pra ser uma landing dedicada de serviços** (mais conversiva que `/solucoes.html` do site institucional estático)
2. **Foi POC abandonado**
3. **Foi começado e pausado por outra prioridade**

## Status atual (2026-05-11)

- ✅ `package.json` configurado (Next 15, React 19, `@gradios/tailwind-config`, `@gradios/assets`)
- ✅ `src/app/layout.tsx` com metadata SEO + Open Graph
- ✅ `src/app/globals.css`
- ✅ `next.config.mjs` configurado
- ✅ `tailwind.config.ts` herda do preset compartilhado
- ✅ **`src/app/page.tsx` ADICIONADO** (placeholder com redirect 308 pra `/solucoes.html`)
- ⚠️ Sem componentes próprios, sem testes, sem CLAUDE.md anterior

## Decisão pendente

**Próximos passos possíveis** (ordem de preferência):

### Opção A — Desenvolver landing de conversão dedicada
- Replicar estilo dos painéis (dark mode + brand-cyan) MAS pra público externo
- Foco: oferta de serviços (sites/sistemas/automações/IA) com CTA pra `/contato.html` ou WhatsApp
- Diferencial vs `/solucoes.html` do site estático: pode ter formulários dinâmicos, A/B test, integração com CRM via webhook
- **Esforço:** 1 sprint
- **ROI:** taxa de conversão melhor que página estática

### Opção B — Deletar e mover conteúdo pro site estático
- Sub-rota `/servicos` deixa de existir → tudo vive em `apps/site/solucoes.html` (ou novo `apps/site/servicos.html`)
- **Esforço:** 10min (deletar pasta + atualizar workspaces no package.json raiz)
- **Vantagem:** simplifica monorepo

### Opção C — Manter placeholder e desenvolver depois
- Estado atual (redirect 308). Sem custo de manutenção, sem confusão de "página vazia em produção"
- **Decidir até:** quando começar campanha de tráfego que aponte pra `/servicos` especificamente

## Stack atual (mínima)

- Next.js 15 App Router + React 19
- TypeScript 5
- Tailwind 3.4 (via `@gradios/tailwind-config`)
- Assets compartilhados (`@gradios/assets`)
- `prebuild` faz `sync.mjs servicos` (copia favicons/logos/splash do package `@gradios/assets`)

## Como rodar local

```bash
cd apps/servicos
npm install
npm run dev    # porta 3001 (cuidado: CRM também usa 3001 — conflito)
```

> **Conflito de porta:** `CRM` também usa `3001` no `dev`. Se ambos rodando, mudar `--port` de um deles. Sugestão: servicos → 3004.

## Não está no CI

`servicos` **não está no matrix de `ci.yml`** (que é `[cfo, cto, crm, site]`). Isso é proposital enquanto o app é placeholder. **Quando virar app real**, adicionar no matrix.

## Pra desenvolver

1. Decidir Opção A / B / C com o time
2. Se A: criar branch `feat/servicos-landing`, montar componentes em `src/components/`, escrever testes em `src/__tests__/`
3. Se B: deletar tudo, mover conteúdo HTML pro site institucional, atualizar `package.json` raiz pra remover `apps/servicos` do workspaces
4. Configurar Vercel: hoje provavelmente não há projeto Vercel pra esse subdomain — verificar
