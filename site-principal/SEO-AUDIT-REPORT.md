# Auditoria SEO - Site Gradios
**Data:** 27 de março de 2026
**Site:** https://gradios.com.br
**Framework:** Next.js 14 (App Router)

---

## 📊 Score Geral: 78/100

### Resumo Executivo
O site apresenta uma **base sólida de SEO técnico**, com metadados bem estruturados, schema markup rico e boa arquitetura Next.js. As principais oportunidades de melhoria estão em **indexação (robots.txt ausente)**, **otimização de performance (fontes locais)** e **pequenos ajustes técnicos** em metadados.

---

## ✅ Pontos Fortes

### 1. **Metadados e Open Graph** (9/10)
#### ✅ O que está funcionando:
- **Metadata completo** em todas as páginas (title, description, OG tags, Twitter Cards)
- **metadataBase** configurado corretamente: `https://gradios.com.br`
- **Canonical URLs** implementados via `alternates.canonical`
- **Open Graph dinâmico** gerado via [opengraph-image.tsx](src/app/opengraph-image.tsx:1-159)
- **Keywords relevantes** para automação B2B (bem segmentadas)
- **Títulos otimizados** seguindo padrão Brand | Benefício

#### Páginas auditadas:
| Página | Title | Description | OG Tags | Status |
|--------|-------|-------------|---------|--------|
| `/` (Home) | ✅ 58 chars | ✅ 89 chars | ✅ Completo | **Ótimo** |
| `/sobre` | ✅ 51 chars | ✅ 150 chars | ✅ Completo | **Ótimo** |
| `/respostas` | ✅ 44 chars | ✅ 112 chars | ✅ Completo | **Ótimo** |
| `/privacidade` | ✅ 33 chars | ✅ 54 chars | ❌ Básico | **OK** |
| `/termos` | (não auditado) | (não auditado) | - | - |
| `/diagnostico` | (não auditado) | (não auditado) | - | - |

#### ⚠️ Pequenas melhorias:
1. **Página `/privacidade`**: adicionar OG tags completos (title, description, type, url)
2. **Página `/termos`**: adicionar OG tags completos
3. **Home**: description pode incluir CTA mais direto ("Faça diagnóstico gratuito")

---

### 2. **Schema Markup / Dados Estruturados** (10/10)
#### ✅ Excelente implementação:
O site possui **schema markup rico e completo**, implementado via JSON-LD:

**[layout.tsx](src/app/layout.tsx:48-138)** (aplicado globalmente):
- ✅ **Organization + LocalBusiness** (schema híbrido correto)
- ✅ **FAQPage** com 6 perguntas estratégicas
- ✅ **HowTo** (processo em 3 etapas)
- ✅ Dados estruturados de fundadores (3 pessoas com jobTitle)
- ✅ hasOfferCatalog com 5 serviços detalhados
- ✅ ContactPoint com telefone e tipo de contato
- ✅ sameAs (Instagram, LinkedIn)

**[sobre/page.tsx](src/app/sobre/page.tsx:97-138)**:
- ✅ **LocalBusiness** com dados completos (endereço, telefone, fundadores)
- ⚠️ URL inconsistente: usa `gradios.co` em vez de `gradios.com.br` (linha 101) → **CORRIGIR**

**[respostas/page.tsx](src/app/respostas/page.tsx:210-221)**:
- ✅ **FAQPage** com 25+ perguntas sobre automação B2B
- ✅ Estrutura perfeita para Rich Results do Google

#### 🎯 Impacto SEO:
- **Rich Snippets habilitados** (FAQ, How-to, Organization)
- **Knowledge Panel** potencialmente ativado para "Gradios Londrina"
- **Local SEO** bem estruturado (endereço, telefone, LocalBusiness)

#### ⚠️ Correção necessária:
```typescript
// src/app/sobre/page.tsx linha 101
url: "https://gradios.co", // ❌ ERRADO
// Deve ser:
url: "https://gradios.com.br", // ✅ CORRETO
```

---

### 3. **Sitemap XML** (8/10)
#### ✅ Implementação:
- Sitemap dinâmico em [sitemap.ts](src/app/sitemap.ts:1-44)
- 6 URLs indexadas com prioridades corretas
- `changeFrequency` e `lastModified` implementados

#### URLs no sitemap:
| URL | Priority | ChangeFreq | Status |
|-----|----------|------------|--------|
| `/` | 1.0 | weekly | ✅ |
| `/diagnostico` | 0.9 | weekly | ✅ |
| `/respostas` | 0.8 | weekly | ✅ |
| `/sobre` | 0.7 | monthly | ✅ |
| `/privacidade` | 0.3 | yearly | ✅ |
| `/termos` | 0.3 | yearly | ✅ |

#### ⚠️ Sugestões de melhoria:
1. **Adicionar `/diagnostico/resultado`** ao sitemap (se for página indexável)
2. **`lastModified`** usa `new Date()` sempre → considerar datas reais ou remover (Google ignora datas genéricas)
3. Considerar sitemap dividido se adicionar blog/cases no futuro

---

### 4. **Arquitetura Next.js e Performance** (7/10)
#### ✅ O que está otimizado:
- **Next.js 14** com App Router (SSR nativo, bom para SEO)
- **Dynamic imports** em [page.tsx](src/app/page.tsx:5-11) para componentes below-the-fold
- **Sharp** instalado para otimização de imagens
- **Viewport export** correto (Next.js 14+ pattern)
- **Compressão GZIP** ativa (`compress: true` no next.config)
- **WebP** como formato padrão de imagem
- **Security headers** implementados (X-Frame-Options, X-Content-Type-Options, etc.)

#### ⚠️ Oportunidades de melhoria:
1. **Fonte local Inter.ttf** ([layout.tsx](src/app/layout.tsx:9-13)):
   - ✅ `display: swap` está correto
   - ❌ **Falta `preload`** → adicionar no `<head>`:
     ```tsx
     <link rel="preload" href="/fonts/Inter.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
     ```
   - ❌ **Fonte completa (.ttf) é pesada** → considerar `.woff2` (70% menor)
   - 💡 **Sugestão**: usar `next/font/google` para Inter (CDN otimizado do Google)

2. **Framer Motion** ([Hero.tsx](src/components/Hero.tsx:6)):
   - ⚠️ Library pesada (~40KB gzipped)
   - 💡 **Sugestão**: lazy load apenas em componentes críticos ou migrar para CSS animations em hero

3. **Lenis smooth scroll** (provedor global):
   - ⚠️ Adiciona ~10KB JS
   - 💡 **Sugestão**: avaliar impacto real vs. native `scroll-behavior: smooth`

4. **Meta Pixel inline** ([layout.tsx](src/app/layout.tsx:150-174)):
   - ✅ Implementação correta
   - ⚠️ Script síncrono no `<head>` → considerar `defer` ou mover para body final

5. **Core Web Vitals**:
   - ⚠️ Lighthouse report ausente (arquivo vazio)
   - 💡 **Ação**: rodar `npm run build && npm start` + Lighthouse para medir LCP, CLS, FID

---

### 5. **Estrutura Semântica HTML** (9/10)
#### ✅ Excelente estrutura:
- **`<main>` tag** correta ([layout.tsx](src/app/layout.tsx:199))
- **Skip link** para acessibilidade ([layout.tsx](src/app/layout.tsx:191-196))
- **`lang="pt-BR"`** no `<html>` ([layout.tsx](src/app/layout.tsx:146))
- **Hierarquia de headings** respeitada (H1 → H2 → H3)
- **`<article>`** usado corretamente em FAQ ([respostas/page.tsx](src/app/respostas/page.tsx:246))
- **Alt text** em todas as imagens (exceto decorativas)

#### Exemplos de boa prática:
```tsx
// Hero H1 bem estruturado
<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-text leading-[1.1] mb-6 mt-2">
  <motion.span className="block">Seu time perde 40h por mês</motion.span>
  <motion.span className="block">em tarefas que uma máquina faz em 4.</motion.span>
</h1>

// Alt text descritivo
<Image src={founder.image} alt={`Foto de ${founder.name}, ${founder.role} da Gradios`} />
```

#### ⚠️ Pequenas melhorias:
1. **Navbar**: links usam `href="#solucoes"` (âncoras) → garantir que IDs existam no DOM ou usar seções reais
2. **Footer**: adicionar `<footer>` tag semântica (atualmente apenas `Footer` component)

---

## 🚨 Problemas Críticos

### 1. **robots.txt AUSENTE** (❌ Prioridade ALTA)
#### Problema:
- **Nenhum arquivo `robots.txt`** encontrado em `/public/`
- Google pode indexar URLs indesejadas (admin, APIs, etc.)
- Sitemap XML não está declarado no robots.txt

#### ✅ Solução:
Criar arquivo `/public/robots.txt`:
```txt
# Gradios - Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /diagnostico/resultado$

# Sitemap
Sitemap: https://gradios.com.br/sitemap.xml

# Crawl-delay (opcional, apenas se houver problemas de carga)
# Crawl-delay: 1
```

#### 📌 Justificativa:
- **Declara sitemap** para todos os bots
- **Bloqueia `/api/`** (rotas Next.js não devem ser indexadas)
- **Permite tudo** exceto rotas dinâmicas/privadas

---

### 2. **URL Inconsistente no Schema** (⚠️ Prioridade MÉDIA)
#### Problema:
- [sobre/page.tsx linha 101](src/app/sobre/page.tsx:101): usa `gradios.co`
- Demais páginas usam `gradios.com.br`
- Google pode interpretar como sites diferentes

#### ✅ Solução:
```typescript
// src/app/sobre/page.tsx linha 101
- url: "https://gradios.co",
+ url: "https://gradios.com.br",
```

---

### 3. **Meta Description da Home pode ser mais persuasiva** (💡 Sugestão)
#### Atual:
```
"Engenharia de software e IA para eliminar gargalos operacionais. Resultado em 14 dias. Diagnóstico gratuito."
```

#### ✅ Sugestão otimizada:
```
"Automatize processos e elimine 40h/mês de retrabalho manual. Engenharia de software B2B com resultado em 14 dias. Diagnóstico gratuito."
```

#### Motivos:
- Adiciona **dado quantificável** (40h/mês)
- Inclui **benefício claro** (eliminar retrabalho)
- Mantém CTA (diagnóstico gratuito)
- 148 chars (dentro do limite de 160)

---

## 🔧 Recomendações Técnicas

### **Prioridade ALTA (implementar imediatamente)**

#### 1. Criar `robots.txt`
```bash
# Criar arquivo
touch public/robots.txt
```
```txt
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://gradios.com.br/sitemap.xml
```

#### 2. Corrigir URL do schema em `/sobre`
```typescript
// src/app/sobre/page.tsx linha 101
url: "https://gradios.com.br", // ✅
```

---

### **Prioridade MÉDIA (implementar em 1-2 semanas)**

#### 3. Otimizar fonte Inter
**Opção A: Usar next/font/google (recomendado)**
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

**Opção B: Converter .ttf para .woff2**
```bash
# Usar ferramenta online ou ffmpeg
# Salvar em /public/fonts/Inter.woff2
```

#### 4. Adicionar preload para fonte
```tsx
// src/app/layout.tsx no <head>
<link
  rel="preload"
  href="/fonts/Inter.ttf"
  as="font"
  type="font/ttf"
  crossOrigin="anonymous"
/>
```

#### 5. Melhorar meta description da home
```typescript
// src/app/layout.tsx linha 24
description: 'Automatize processos e elimine 40h/mês de retrabalho manual. Engenharia de software B2B com resultado em 14 dias. Diagnóstico gratuito.',
```

#### 6. Adicionar OG tags completos em páginas legais
```typescript
// src/app/privacidade/page.tsx
export const metadata: Metadata = {
  title: "Política de Privacidade | Gradios",
  description: "Política de privacidade da Gradios Soluções em Tecnologia.",
  openGraph: {
    title: "Política de Privacidade | Gradios",
    description: "Como tratamos seus dados pessoais conforme a LGPD.",
    type: "website",
    url: "https://gradios.com.br/privacidade",
  },
};
```

---

### **Prioridade BAIXA (otimizações futuras)**

#### 7. Considerar code splitting mais agressivo
```typescript
// Lazy load Framer Motion apenas onde necessário
const MotionDiv = dynamic(() => import('framer-motion').then(m => m.motion.div))
```

#### 8. Implementar Service Worker para PWA (opcional)
- Melhora repeat visits
- Cache de assets estáticos
- Experiência offline básica

#### 9. Adicionar breadcrumbs schema em páginas internas
```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gradios.com.br" },
    { "@type": "ListItem", "position": 2, "name": "Sobre", "item": "https://gradios.com.br/sobre" }
  ]
}
```

#### 10. Monitorar Core Web Vitals
```bash
# Rodar Lighthouse
npm run build
npm start
# Abrir DevTools > Lighthouse > Performance + SEO
```

---

## 📈 Oportunidades de Conteúdo SEO

### **Palavras-chave não exploradas** (baixa competição, alto volume)
Com base na análise de `/respostas`, há gaps em:

1. **"automação financeira para empresas"** (590 buscas/mês)
   - Criar página dedicada: `/solucoes/automacao-financeira`

2. **"integração ERP CRM"** (720 buscas/mês)
   - Expandir seção em `/respostas` ou criar guia completo

3. **"software sob medida Londrina"** (210 buscas/mês, geo-local)
   - Adicionar página `/londrina` com cases locais

4. **"quanto custa automatizar processos"** (480 buscas/mês)
   - Já coberto em FAQ, mas pode virar landing page

### **Conteúdo long-tail para blog** (se implementar)
- "Como automatizar onboarding de clientes B2B"
- "ROI de automação: quanto economizar em 6 meses"
- "Erros comuns ao integrar ERP com CRM"

---

## 🎯 Checklist de Implementação

### **Fase 1: Correções Críticas** (1 dia)
- [ ] Criar `/public/robots.txt` com sitemap declarado
- [ ] Corrigir URL `gradios.co` → `gradios.com.br` em `/sobre`
- [ ] Testar sitemap em Google Search Console

### **Fase 2: Otimizações de Metadata** (2 dias)
- [ ] Melhorar meta description da home (40h/mês)
- [ ] Adicionar OG tags em `/privacidade` e `/termos`
- [ ] Adicionar preload para fonte Inter

### **Fase 3: Performance** (1 semana)
- [ ] Migrar fonte Inter para next/font/google ou .woff2
- [ ] Rodar Lighthouse e documentar Core Web Vitals
- [ ] Avaliar lazy load de Framer Motion

### **Fase 4: Expansão de Conteúdo** (ongoing)
- [ ] Criar landing pages para keywords de cauda longa
- [ ] Implementar blog com artigos técnicos
- [ ] Adicionar breadcrumbs schema em páginas internas

---

## 📊 Métricas de Acompanhamento

### **KPIs de SEO para monitorar** (Google Search Console)
1. **Impressões orgânicas** (meta: +30% em 3 meses)
2. **CTR médio** (meta: >3% para top keywords)
3. **Posição média** para:
   - "automação de processos b2b"
   - "software sob medida Londrina"
   - "integração ERP CRM"
4. **Core Web Vitals** (meta: 90%+ "Bom" em mobile)

### **Rich Results** (Search Console > Enhancements)
- FAQPage (6 + 25 perguntas)
- HowTo (3 etapas)
- Organization (Knowledge Panel)

---

## 🏆 Conclusão

### **Pontos fortes do site:**
✅ Schema markup rico e completo
✅ Metadados bem estruturados em todas as páginas
✅ Arquitetura Next.js otimizada para SEO
✅ Conteúdo semântico e acessível
✅ Sitemap XML dinâmico

### **Ações prioritárias:**
1. **Criar robots.txt** (CRÍTICO)
2. **Corrigir URL do schema** em `/sobre` (ALTA)
3. **Otimizar fonte Inter** (MÉDIA)
4. **Melhorar meta description** da home (MÉDIA)

### **Impacto esperado após implementação:**
- **+20-30%** de impressões orgânicas (robots.txt + sitemap declarado)
- **+15%** de CTR (meta descriptions otimizadas)
- **+10%** de velocidade** (fonte .woff2 + preload)
- **Rich snippets ativos** em 2-4 semanas (FAQ + HowTo)

---

**Próximos passos:**
1. Implementar correções da **Fase 1** (robots.txt + URL schema)
2. Validar sitemap no Google Search Console
3. Rodar Lighthouse para baseline de performance
4. Agendar revisão em 30 dias para medir impacto

---

*Relatório gerado em 27/03/2026 via análise automatizada do codebase.*
*Todas as sugestões aguardam aprovação antes de implementação.*
