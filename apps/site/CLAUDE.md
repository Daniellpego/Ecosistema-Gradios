# Gradios — Site institucional

Site institucional estático da Gradios (PT-BR), HTML + CSS + JS vanilla.
Sem build, sem framework, sem dependências locais.

## Como rodar

```bash
# Qualquer servidor estático funciona
python3 -m http.server 8000
# ou
npx serve .
```

Abrir `http://localhost:8000/index.html`.

## Estrutura

```
.
├── index.html              # Home (página principal, todas as seções)
├── solucoes.html           # Hub de soluções
├── sites.html              # Sites profissionais
├── sistemas.html           # Sistemas personalizados
├── automacoes.html         # Automações
├── ia.html                 # Inteligência Artificial
├── projetos.html           # Cases / portfólio
├── sobre.html              # Sobre a Gradios
├── contato.html            # Página de contato (com formulário)
├── sitemap.xml
├── robots.txt
│
├── assets/
│   ├── site.css            # CSS base + tokens + componentes globais
│   ├── extras.css          # Overrides leves
│   ├── proj-v2.css         # Seção Projetos (home) — mockups premium
│   ├── seo-v2.css          # Seção SEO + GEO (home)
│   ├── about-v2.css        # Seção Sobre (home)
│   ├── pre-section.css     # Seção "Antes de começar" (home)
│   ├── contact-home.css    # Seção Contato (home)
│   ├── cta-v2.css          # CTA final (home)
│   └── site.js             # JS global (header scroll, reveal, FAQ, tweaks, parallax)
│
└── design-system/
    ├── colors_and_type.css # Tokens canônicos (cores + tipografia)
    └── assets/
        ├── logo-mark.png
        ├── logo-wordmark.png
        └── ...
```

## Sistema de design

**Cores**
- Fundo principal: `#F5F5F7`
- Cards / superfície: `#FFFFFF`
- Bordas: `#E2E8F0` (`--border` / `--divider`)
- Texto: `#0A1B3D` (`--text`) · muted: `#475569` · soft: `#64748B`
- **Brand (azul Gradios):** `#2546BD` (`--brand`) — botões, links, destaques
- **Accent (ciano):** `#00BFFF` (`--accent`) — pulsos, dados live, highlights

**Tipografia**
- Fonte: Inter (Google Fonts CDN, definida em `colors_and_type.css`)
- Títulos com `letter-spacing: -0.024em`, line-height apertado
- Body 16–17px / 24–28px line-height

**Componentes globais** (em `assets/site.css`)
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-lg`, `.btn-arrow`
- `.section`, `.section-subtle`, `.section-eyebrow`, `.section-title`, `.section-lead`
- `.container`, `.container-narrow`
- `.site-header`, `.site-footer`
- `.card`, `.cards-grid`
- `.faq-list` / `.faq-item` (details/summary)
- `.cta-banner`
- `.tweaks-panel` (painel de cor primária — neutral / cyan / black)

**Padrões usados em seções específicas**
- `reveal-stagger` — entrada em cascata via IntersectionObserver (`site.js`)
- `data-screen-label` — label de cada section, usado para QA / comments
- Eyebrows em UPPERCASE com `letter-spacing: 0.10–0.16em`
- Cards: radius 12–14px, hover lift sutil + sombra `rgba(10,27,61,0.14)`
- Banners navy: `linear-gradient(180deg, #0E1B36 0%, #0A152B 100%)` + glow radial ciano/azul

## JS

`assets/site.js` controla:
- Estado scrolled do header
- IntersectionObserver para `.reveal-stagger`
- FAQ accordion (`details` nativo + animação)
- Painel Tweaks (alterna `data-primary` no `<body>`)
- Parallax sutil no hero
- Form de contato (estado de sucesso fake; trocar por integração real)
- Lucide icons (`lucide.createIcons()`)

## Ícones

Lucide via CDN, **pinado em versão estável** (não usar `@latest` em produção): `<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js" defer></script>`
Uso: `<i data-lucide="search" style="width:18px;height:18px;stroke-width:1.6"></i>`

## Notas de implementação

- O formulário de contato (em `contato.html` e na seção `#contato` da home) é um stub — `data-contact` é o seletor; o handler está em `site.js` (procurar por "contact" / "data-contact"). **Trocar por integração real (e-mail, CRM, webhook) antes de publicar.**
- O site é 100% estático: pode ser hospedado em Vercel, Netlify, GitHub Pages, S3+CloudFront, etc.
- Imagens em `design-system/assets/` são placeholders/logo. Imagens de cases nas páginas de projetos também são placeholders SVG/CSS — substituir por screenshots reais quando disponíveis.
- O site usa Lucide via CDN. Para deploy resiliente, considerar trazer os ícones para `assets/` ou usar um sprite SVG local.
- SEO: cada página tem `<title>`, `<meta description>`, Open Graph, e a home tem `Schema.org JSON-LD` (Organization + FAQPage). `sitemap.xml` e `robots.txt` na raiz.

## O que pode ser feito a seguir

- Integrar o formulário de contato com um endpoint real (Formspree / SendGrid / webhook).
- Substituir mockups CSS de projetos por screenshots reais.
- Migrar ícones Lucide CDN → sprite SVG local.
- Adicionar analytics (Plausible, Umami ou GA4).
- Considerar migrar para Astro / Next.js se for evoluir para conteúdo dinâmico (blog, cases CMS-driven, etc.) — a estrutura HTML já está pronta para componentização.
