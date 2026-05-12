# Design System — Ecossistema Gradios

> **Propósito deste arquivo:** contrato único de design pra IA (Claude Code) e humanos. Em vez de ler 5 arquivos pra entender o design system, leia este. Tokens originais ficam em [`packages/tailwind-config/tokens.ts`](packages/tailwind-config/tokens.ts) — esse arquivo é a **fonte de verdade**, este é o resumo navegável.

---

## 🚨 Importante: dois design systems

| Sistema | Onde aplica | Modo |
|---|---|---|
| **Painéis** (CFO/CRM/CTO) | `apps/cfo`, `apps/crm`, `apps/cto` | **Dark mode forçado** (sem toggle) — fundo navy |
| **Site Institucional** | `apps/site/` (HTML estático) | **Light mode** — fundo cinza claro |

Os tokens semânticos em `packages/tailwind-config/` cobrem **ambos**, mas cada app importa a paleta que precisa.

---

## 🎨 Paleta — Painéis (Dark Mode)

Aplica em: **CFO, CRM, CTO**

### Backgrounds
```
bg-navy            #0A1628    ← background principal das páginas
bg-card            #131F35    ← cards (sempre com .card-glass)
brand-blue-deep    #06103D    ← seções/banners mais escuros
brand-blue         #0A1B5C    ← elementos secundários
```

### Brand / accent
```
brand-cyan         #00BFFF    ← CTAs, links ativos, destaques, focus rings
brand-cyan-light   #33CCFF    ← hovers
brand-cyan-lighter #66D9FF    ← variações suaves
brand-blue-secondary #14298A  ← elementos secundários
```

### Texto sobre fundo escuro
```
ink.onDark         #F0F4F8    ← texto principal (--text-primary)
ink.secondary      #64748B    ← subtextos
ink.muted          #94A3B8    ← labels, hints
```
> **Decisão histórica:** `text.muted = #94A3B8` (vindo de CRM/CTO) supera `#B0BEC5` (CFO antigo) por melhor contraste WCAG AA.

### Status (cores semânticas)
```
status.positive    #10B981    ← valores positivos (success), receitas, lucro
status.negative    #EF4444    ← valores negativos, alertas críticos, despesas
status.warning     #F59E0B    ← alertas amarelos
status.info        #00BFFF    ← informações (= brand-cyan)
```

### Glow / focus
```
shadow.glow        0 0 20px rgba(0, 191, 255, 0.35)
shadow.focus       0 0 0 2px rgba(0, 191, 255, 0.5)
```

---

## 🎨 Paleta — Site Institucional (Light Mode)

Aplica em: **`apps/site/`** (definida em `apps/site/design-system/colors_and_type.css` + `assets/site.css`)

```
--bg               #F5F5F7    ← fundo principal
--surface          #FFFFFF    ← cards / superfície
--border           #E2E8F0    ← bordas + divisores
--text             #0A1B3D    ← texto principal
--text-muted       #475569    ← subtexto
--text-soft        #64748B    ← legendas
--brand            #2546BD    ← azul Gradios (botões, links)
--accent           #00BFFF    ← ciano (pulsos, live data, highlights)
```

Banners navy do site: `linear-gradient(180deg, #0E1B36 0%, #0A152B 100%)` + glow radial ciano/azul.

---

## ✍️ Tipografia

### Painéis (CFO/CRM/CTO)
**Fonte:** Poppins (300, 400, 500, 600, 700)
**Como carregar:** `next/font/google` em `layout.tsx` com `variable: '--font-poppins'`
**Stack Tailwind:**
```ts
fontFamily: {
  sans:    ['var(--font-poppins)', 'system-ui', 'sans-serif'],
  poppins: ['var(--font-poppins)', 'sans-serif'],
}
```

### Site
**Fonte:** Inter (Google Fonts via CDN, definida em `design-system/colors_and_type.css`)
**Títulos:** `letter-spacing: -0.024em`, line-height apertado
**Body:** 16-17px / 24-28px line-height
**Eyebrows:** UPPERCASE com `letter-spacing: 0.10-0.16em`

### Escala (compartilhada)
| Tailwind | Px | Line-height |
|---|---|---|
| `text-xs` | 12px | 16px |
| `text-sm` | 14px | 20px |
| `text-base` | 16px | 24px |
| `text-lg` | 18px | 28px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 36px |
| `text-4xl` | 36px | 40px |
| `text-5xl` | 48px | 1.1 |

---

## 📐 Border Radius

```
radius.sm     0.25rem    (4px)
radius.md     0.5rem     (8px)
radius.lg     0.75rem    (12px)
radius.xl     1rem       (16px)
radius.2xl    1.5rem     (24px)
radius.card   14px       ← padrão pra todos os cards
```

---

## 🎬 Motion (Framer Motion + transitions)

### Duração
```
fast    150ms
normal  300ms
slow    500ms
```

### Easing
```
out-expo     cubic-bezier(0.16, 1, 0.3, 1)    ← entrada (default pra PageTransition)
in-expo      cubic-bezier(0.7, 0, 0.84, 0)    ← saída
in-out-expo  cubic-bezier(0.87, 0, 0.13, 1)   ← elementos que aparecem e somem
```

### Animações pré-definidas (Tailwind)
```
animate-pulse-glow      pulseGlow 2s ease-in-out infinite
animate-accordion-down  accordion-down 0.2s ease-out
animate-accordion-up    accordion-up 0.2s ease-out
animate-fade-in         fadeIn 0.3s ease-out
animate-slide-up        slideUp 0.3s out-expo
```

### Padrão obrigatório
Toda rota dos painéis usa `<PageTransition>` (componente em `apps/{app}/src/components/motion.tsx`) que envolve `children` com fade + slide-up suave. **Não pular esse wrapper** em nenhuma página nova.

---

## 📦 Componentes globais

### Painéis (CFO/CRM/CTO)

| Componente | Onde | Uso |
|---|---|---|
| `card-glass` | classe Tailwind global | TODOS os cards. Fundo `bg-card` + border sutil + sombra |
| `<PageTransition>` | `components/motion.tsx` | Wrap obrigatório em cada `page.tsx` |
| `<SkeletonCard>` | `components/skeleton-card.tsx` | Substitui spinners — sempre usar |
| `<Sidebar>` | `components/sidebar.tsx` | Navegação lateral compartilhada |
| `<PeriodFilter>` | `components/period-filter.tsx` | Filtro de período (CFO) |
| Charts | `components/charts/` | Wrappers Recharts (ComposedChart, Pie, Line, Area) |
| Radix primitives | `components/ui/` | Dialog, Sheet, Select, Tooltip, etc. (wrapped) |
| `@gradios/ui` | package compartilhado | Componentes cross-app (Button, Card, Input base) |

### Site

| Classe | Uso |
|---|---|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-lg`, `.btn-arrow` | Botões |
| `.section`, `.section-subtle`, `.section-eyebrow`, `.section-title`, `.section-lead` | Estrutura de seção |
| `.container`, `.container-narrow` | Wrappers de largura |
| `.site-header`, `.site-footer` | Layout |
| `.card`, `.cards-grid` | Cards |
| `.faq-list` / `.faq-item` | FAQ (details/summary nativo) |
| `.cta-banner` | Banner de chamada |
| `.tweaks-panel` | Painel de cor primária (neutral / cyan / black) |
| `.reveal-stagger` | Entrada em cascata via IntersectionObserver |

---

## 📱 Breakpoints

```
xs    380px      ← mobile pequeno (do CTO — adotado como base)
sm    640px
md    768px      ← tablet
lg    1024px     ← desktop
xl    1280px
2xl   1536px
```

Container max-width: `1400px` (no `2xl`).

---

## ✅ Convenções (todos os apps)

1. **Dark mode only** nos painéis (sem toggle ativo; `darkMode: 'class'` habilitado pra futuro)
2. **Mobile-first** responsive (default = mobile, breakpoints adicionam complexidade)
3. **Skeleton loaders sempre** — `<SkeletonCard />` em vez de spinners genéricos
4. **`card-glass`** em TODOS os cards dos painéis
5. **`<PageTransition>`** envolve TODA page do painel
6. **Formulários em Dialog/Sheet modal**, não em página separada
7. **TanStack Query** com `invalidateQueries` após cada mutation
8. **Sombras:** usar `shadow-card` (default) e `shadow-card-hover` (hover) — definidas no preset
9. **Glow:** `shadow-glow` em CTAs principais, `shadow-focus` em focus rings
10. **Cores semânticas > literais:** use `text-success` em vez de `text-green-500`

---

## 🛠️ Pra criar componente novo

1. Verificar se já existe em `@gradios/ui` (cross-app) — usar de lá se sim
2. Se for específico do app → criar em `apps/{app}/src/components/`
3. Importar tokens do Tailwind (`bg-card`, `text-primary`, `brand-cyan`, `radius-card`) — **nunca hardcodar hex**
4. Usar `class-variance-authority` (CVA) pra variants
5. Wrap em `forwardRef` se for input/button (acessibilidade)
6. Acessibilidade: aria labels + suporte a teclado (especialmente em Radix)
7. Skeleton loader correspondente em `components/skeleton-*`

---

## 🚫 Anti-patterns (não fazer)

- ❌ Spinners genéricos (CircularProgress, etc.) — usar Skeleton
- ❌ Cores hex hardcoded em componente (`bg-[#0A1628]` em vez de `bg-navy`)
- ❌ `<div>` clicável sem aria — usar `<button>` ou Radix Slot
- ❌ Container sem `card-glass` em painel (quebra consistência visual)
- ❌ Página sem `<PageTransition>` (gera saltos visuais)
- ❌ Formulário em página própria (deve ser Dialog/Sheet)
- ❌ Tooltip nativo `title=` (usar Radix Tooltip)
- ❌ `style={{ ... }}` inline pra valores que já existem em tokens
- ❌ Animação > 500ms (slow) — sensação de lentidão; usar `normal` ou `fast`

---

## 📚 Fontes

- **Tokens (single source of truth):** [`packages/tailwind-config/tokens.ts`](packages/tailwind-config/tokens.ts)
- **Preset Tailwind:** [`packages/tailwind-config/tailwind.preset.ts`](packages/tailwind-config/tailwind.preset.ts)
- **Componentes UI compartilhados:** [`packages/ui/src/`](packages/ui/src/)
- **Motion compartilhado:** [`packages/motion/src/`](packages/motion/src/)
- **Assets (logos/favicons/splash):** [`packages/assets/`](packages/assets/)
- **Brand book inline:** [`CLAUDE.md`](CLAUDE.md) raiz (seção Brand Book)
- **Site design system:** [`apps/site/CLAUDE.md`](apps/site/CLAUDE.md) (paleta light separada)

---

## 🔄 Histórico de mudanças

- **2026-05-11:** arquivo criado consolidando 5 fontes (CLAUDE.md raiz, CLAUDE.md site, tokens.ts, preset.ts, packages). Pilar #6 MAESTRIA — `.md como contrato` reduz custo de tokens da IA em ~200×.
- **2026-04-15:** `text.muted` consolidado em `#94A3B8` (CRM/CTO supera CFO antigo `#B0BEC5`) por contraste WCAG AA.
