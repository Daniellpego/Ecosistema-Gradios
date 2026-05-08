# Pasta de screenshots reais dos cases

Esta pasta guarda imagens reais de projetos entregues pela Gradios.

## Como adicionar o screenshot da Clínica Nelson Shirabe

O HTML em `index.html` (spotlight da seção Projetos) e `projetos.html` já está
pronto. Basta colocar a imagem com o nome certo aqui — não precisa editar HTML.

### 1) Capturar

- **Apenas o site público** (`https://clinicanelsonshirabe.com.br/`).
- Não capturar áreas logadas, painel interno, agenda, lista de pacientes ou
  conversas reais de WhatsApp.
- Browser em **desktop** (~1500 px de largura).
- Capturar o **viewport visível** (não a página inteira) para um enquadramento
  que mostre hero + um bloco a seguir — fica próximo ao formato do nosso slot.

Sugestões de ferramenta:
- macOS: `Cmd + Shift + 4` → arrastar área (~1500×1000)
- Windows: `Win + Shift + S`
- Extensões: GoFullPage, Awesome Screenshot
- Linha de comando: `chromium --headless --window-size=1500,1000 --screenshot=clinica.png https://clinicanelsonshirabe.com.br/`

### 2) Especificações

| Item | Valor |
|---|---|
| Nome do arquivo PNG | `clinica-nelson-shirabe.png` |
| Nome do arquivo WebP (opcional) | `clinica-nelson-shirabe.webp` |
| Proporção | 3:2 (ex.: 1500×1000) |
| Resolução mínima | 1200×800 |
| Resolução recomendada | 1500×1000 |
| Tamanho do arquivo PNG | < 400 KB |
| Tamanho do arquivo WebP | < 200 KB |

### 3) Otimizar

**PNG:**
- [tinypng.com](https://tinypng.com/) — drag & drop, gratuito, ~70% redução.
- Linha de comando: `pngquant --quality=70-85 --strip clinica-nelson-shirabe.png -o clinica-nelson-shirabe.png`

**WebP (opcional, mas recomendado):**
- Online: [squoosh.app](https://squoosh.app/) — escolher WebP, qualidade 80, 4:2:0 chroma.
- Linha de comando: `cwebp -q 82 clinica-nelson-shirabe.png -o clinica-nelson-shirabe.webp`

Browsers modernos usam o WebP automaticamente via `<picture>`. Browsers
antigos caem para o PNG sem mudanças no HTML.

### 4) Salvar aqui

```
Site 2/cases/
├── clinica-nelson-shirabe.png   ← obrigatório
├── clinica-nelson-shirabe.webp  ← opcional, performance
└── README.md
```

### 5) Pronto

Não precisa editar HTML. O `<picture>` já está plugado na home e em
`projetos.html`. Comportamento:

| Cenário | O que acontece |
|---|---|
| Imagem presente | Browser frame premium (50px de barra) com a imagem dentro substitui o mockup CSS. Sem flash. |
| WebP presente + browser moderno | Carrega o WebP (mais leve). |
| Apenas PNG presente | Carrega o PNG normalmente. |
| Nenhum arquivo presente | Mockup CSS com WhatsApp + agenda fictícia continua mostrando como está hoje. |
| Imagem corrompida ou 404 | `onerror` esconde o `<img>`, mockup CSS volta. Sem ícone quebrado. |

## Como testar

1. Subir servidor estático:
   ```bash
   cd "Site 2" && python3 -m http.server 8000
   ```
2. Abrir `http://localhost:8000/index.html#projetos` (e também `/projetos.html`).
3. Sem imagem → ver mockup CSS atual (browser pequeno + WhatsApp + Painel).
4. Adicionar imagem → recarregar → ver browser frame full-size com screenshot real
   e os mockups decorativos some.
5. Renomear temporariamente para forçar 404 → mockup volta.

## Direitos de imagem

- Nome da Clínica Nelson Shirabe e domínio público são citáveis.
- Screenshot do site público é uso institucional aceitável (apresentação de
  case de fornecedor de tecnologia).
- Antes de publicar, recomendado pedir aval por mensagem rápida ao cliente —
  formalidade boa, evita atrito futuro.

## Próximos cases

A mesma estrutura serve para qualquer cliente novo: criar o slot HTML análogo
no card correspondente (similar ao `.pa-browser-real` da Clínica) e colocar
`cases/<slug-do-cliente>.png` aqui.
