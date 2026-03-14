# BG TECH — Site Principal (site-principal/)

> Brand Identity v3.0 | Março 2026 | bgtechsolucoes.com.br
> "O cérebro que sua operação precisa."

## IDENTIDADE VISUAL — LOGO OFICIAL

Arquivo: `/logo oficial bg.png`
Tipo: Cérebro estilizado minimalista com iniciais "B" (hemisfério esquerdo) e "G" (hemisfério direito) integradas organicamente. Estrela de 4 pontas no centro representando inteligência/IA.
Gradiente: Navy escuro → Cyan neon

### Regras absolutas da logo

- NUNCA distorcer, rotacionar ou alterar proporções
- NUNCA separar hemisfério B do hemisfério G
- NUNCA remover a estrela central
- NUNCA adicionar sombras ou efeitos externos
- NUNCA colocar em fundo branco sem aprovação
- NUNCA usar versão antiga da logo (2D, 3D neural com nós)
- Área de proteção: 1X (largura da estrela) em todos os lados
- Mínimo digital: 32px
- Fundo preferencial: #0A1628 (dark) ou transparente

## PALETA DE CORES (extraída da logo definitiva v3.0)

```css
/* BACKGROUNDS — Hierarquia de profundidade */
--bg-deep:      #0A1628;   /* Fundo principal do site e painéis */
--bg-card:      #0F1D32;   /* Cards, containers, seções alternadas */
--bg-surface:   #131F35;   /* Modais, drawers, elevações */
--bg-hover:     #182640;   /* Estados de hover, tooltips */
--bg-float:     #1E2D4A;   /* Dropdowns, popovers */

/* AZUIS — Do hemisfério B da logo */
--blue-navy:    #1B2138;   /* Lado esquerdo da logo, elementos pesados */
--blue-royal:   #0A3D91;   /* Transição central, bordas ativas */
--blue-inst:    #1A6AAA;   /* Cor institucional, links, bordas sutis */
--blue-mid:     #2B7AB5;   /* Elementos intermediários, hovers */

/* CYANS — Do hemisfério G da logo (COR PRINCIPAL) */
--cyan-electric: #00C8F0;  /* CTAs, botões, destaques primários */
--cyan-neon:     #00E5FF;  /* Hover de CTAs, glow effects, badges ativos */
--cyan-light:    #40D8EE;  /* Links hover, textos de destaque */
--cyan-glow:     #80EEFF;  /* Brilho sutil, reflexos, bordas glow */

/* GRADIENTES — Assinatura da marca */
--gradient-brand:  linear-gradient(135deg, #1B2138 0%, #00E5FF 100%);
--gradient-subtle: linear-gradient(135deg, #0A1628 0%, #0A3D91 100%);
--gradient-glow:   linear-gradient(135deg, #00C8F0 0%, #80EEFF 100%);
--gradient-depth:  linear-gradient(180deg, #0A1628 0%, #0F1D32 100%);

/* SEMÂNTICAS */
--color-success: #10B981;  /* Receita, ganho, confirmado, ativo */
--color-danger:  #EF4444;  /* Custo, perda, cancelado, erro */
--color-warning: #F59E0B;  /* Alerta, previsto, pendente */
--color-info:    #3B82F6;  /* Informativo, neutro */

/* TEXTO — Hierarquia de leitura */
--text-primary:   #F0F4F8; /* Títulos, valores, conteúdo principal */
--text-secondary: #94A3B8; /* Labels, descrições, apoio */
--text-muted:     #475569; /* Placeholders, desabilitado */
--text-ghost:     #334155; /* Texto quase invisível, watermarks */
```

## TIPOGRAFIA — SOMENTE POPPINS

```
font-family: 'Poppins', sans-serif;

H1 — Bold 700, 28-32px, tracking -0.02em → Títulos de página
H2 — Bold 700, 22-24px, tracking -0.01em → Seções
H3 — SemiBold 600, 18-20px → Subtítulos
KPI Label — Medium 500, 11-12px, UPPERCASE 0.05em → Labels de cards
KPI Value — Bold 700, 26-32px, tracking -0.02em → Valores grandes
Body — Regular 400, 14-15px → Texto padrão
Caption — Light 300, 11-12px, tracking 0.02em → Legendas
Badge — SemiBold 600, 10-11px, UPPERCASE 0.05em → Status tags
Button — SemiBold 600, 13-14px, tracking 0.02em → Botões
```

## COMPONENTES

```css
/* CARDS */
/* Background: var(--bg-card)
   Border: 1px solid rgba(26, 106, 170, 0.12)
   Border-radius: 16px
   Padding: 24px
   Hover: border-color rgba(0, 200, 240, 0.2) + box-shadow 0 0 20px rgba(0, 200, 240, 0.03)
   Destaque: border-left 3px solid var(--cyan-electric) */

/* BOTÕES */
/* Primário: background var(--gradient-brand), text #0A1628, radius 12px
   Hover: brightness(1.1) + box-shadow 0 0 24px rgba(0, 200, 240, 0.25)
   Secundário: bg var(--bg-card), border 1.5px solid rgba(26, 106, 170, 0.25), text white
   Ghost: bg transparent, text var(--cyan-electric), hover bg rgba(0, 200, 240, 0.06) */

/* GLOW EFFECTS (inspirado na logo) */
/* Neural: box-shadow 0 0 40px rgba(0, 200, 240, 0.06), 0 0 80px rgba(0, 200, 240, 0.03)
   Line: height 1px, bg linear-gradient(90deg, transparent, rgba(0, 200, 240, 0.4), transparent)
   Dot: 8px, #00E5FF, box-shadow 0 0 8px, animation pulse 2s infinite */
```

## DADOS DA EMPRESA

```
Razão Social: BG Tech Soluções em Tecnologia LTDA
Nome Fantasia: BG Tech
CNPJ:     65.663.208/0001-36
Endereço: R. Joaquim Antônio dos Santos, 148 — Jardim Tarumã
Cidade:   Londrina/PR — CEP 86.038-610
Tel:      (43) 99780-0051
Email:    contato@bgtechsolucoes.com.br
Site:     bgtechsolucoes.com.br
WhatsApp: 5543997800051
Fundação: 13 de Março de 2026
Slogan:   O cérebro que sua operação precisa.

Sócios:
  Daniel Pego    — CEO & Head de Projetos
  Gustavo Batista — CFO & Head de Inovação
  Bryan Gradi    — CTO & Head de Engenharia
```

## TOM DE VOZ

- Linguagem direta, de dono para dono
- Métricas reais: 47+ empresas, R$4.8M protegidos, 7d go-live
- NUNCA jargão genérico ("soluções inovadoras", "transformação digital sinérgica")
- SIM: "Sua operação pode render 40% mais.", "Sem achômetro. Com dados."

## DARK MODE ONLY

- Nenhuma seção usa background branco ou claro
- Todas as seções usam variações de navy (#0A1628 → #0F1D32 → #131F35)
- Cards: bg-card (#0F1D32) com borda rgba(26, 106, 170, 0.12)
