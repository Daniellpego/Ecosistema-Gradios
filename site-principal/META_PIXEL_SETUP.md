# Meta Pixel - Configuração Completa

## 📊 Informações do Pixel

- **Pixel ID**: `1826186485006703`
- **Access Token**: `EAF8ZAT6RwnPkBRIwuU25g1Q5WLDGBpLeBumTute6UgJxD1iP9YRpwG9rvcLJakAp5CP9MKfT3UuMOvKW6EbHQZASxApGofsbU4znWJqOts4MZBKTSxOHU7t5pt5z70tvVrcHbYqkDCkrSK1Q2W3iJK6ZCuPB1PECknqqdSO1MtctYvi2kYjucYrEJwZBX6wZDZD`
- **API Version**: v21.0

## 🎯 Eventos Configurados

### 1. **PageView** (Automático)
- **Onde**: Todas as páginas do site
- **Quando**: Carregamento da página
- **Arquivo**: `src/app/layout.tsx`
- **Tipo**: Standard Event

### 2. **ViewContent** - Quiz Iniciado
- **Onde**: Página de diagnóstico
- **Quando**: Usuário clica em "Começar diagnóstico"
- **Parâmetros**:
  - `content_name`: "Quiz Diagnóstico Gradios"
  - `content_category`: "Quiz"
- **Arquivo**: `src/app/diagnostico/page.tsx` (linha 128)
- **Tipo**: Standard Event

### 3. **QuizAnswer** (Custom Event)
- **Onde**: Página de diagnóstico
- **Quando**: Usuário responde cada pergunta do quiz
- **Parâmetros**:
  - `question`: ID da pergunta
  - `answer_index`: Índice da resposta selecionada
- **Arquivo**: `src/app/diagnostico/page.tsx` (linha 131)
- **Tipo**: Custom Event

### 4. **InitiateCheckout** - Quiz Completado
- **Onde**: Página de diagnóstico
- **Quando**: Usuário completa todas as 10 perguntas
- **Parâmetros**:
  - `content_name`: "Quiz Completo"
  - `num_items`: Número de perguntas respondidas
- **Arquivo**: `src/app/diagnostico/page.tsx` (linha 134)
- **Tipo**: Standard Event

### 5. **Lead** - Lead Capturado
- **Onde**: Página de diagnóstico
- **Quando**: Usuário preenche nome, empresa, email e WhatsApp
- **Parâmetros**:
  - `content_name`: "Diagnóstico Gradios"
  - `content_category`: Setor da empresa
  - `value`: 0
  - `currency`: "BRL"
- **Arquivo**:
  - Client-side: `src/app/diagnostico/page.tsx` (linha 137)
  - Server-side: `src/app/api/meta-conversion/route.ts` (Conversions API)
- **Tipo**: Standard Event
- **Conversions API**: ✅ Configurado com deduplicação via `event_id`

**Dados enviados via Conversions API (hasheados SHA256):**
- Email (em)
- Telefone (ph)
- Nome (fn + ln)
- Cidade (ct)
- País (country)
- IP do cliente
- User-Agent

### 6. **CompleteRegistration** - Diagnóstico Visualizado
- **Onde**: Página de diagnóstico
- **Quando**: Resultado do diagnóstico é exibido
- **Parâmetros**:
  - `content_name`: "Resultado Diagnóstico"
  - `status`: "Tier X" (tier do lead)
  - `value`: Score calculado (0-100)
- **Arquivo**: `src/app/diagnostico/page.tsx` (linha 145)
- **Tipo**: Standard Event

### 7. **QuizAbandoned** (Custom Event)
- **Onde**: Página de diagnóstico
- **Quando**: Usuário sai antes de completar o quiz
- **Parâmetros**:
  - `last_question`: ID da última pergunta respondida
  - `progress`: "N/10"
  - `partial_score`: Score parcial
- **Arquivo**: `src/app/diagnostico/page.tsx` (linha 152)
- **Tipo**: Custom Event

### 8. **CTAClick** (Custom Event)
- **Onde**: Hero, LeadForm, e outras seções com CTAs
- **Quando**: Usuário clica em qualquer CTA "Diagnóstico Gratuito"
- **Parâmetros**:
  - `cta_location`: Local do CTA (ex: "Hero", "Final CTA Section")
  - `cta_text`: Texto do botão
  - `destination`: URL de destino
- **Arquivos**:
  - `src/components/Hero.tsx` (linhas 171, 411)
  - `src/components/LeadForm.tsx` (linha 88)
- **Tipo**: Custom Event

### 9. **Contact** - WhatsApp
- **Onde**: Botão flutuante de WhatsApp
- **Quando**: Usuário clica no botão de WhatsApp
- **Parâmetros**:
  - `contact_method`: "whatsapp"
  - `source`: Página onde o clique ocorreu
- **Arquivo**: `src/components/WhatsAppFab.tsx` (linha 19)
- **Tipo**: Standard Event

## 📂 Arquivos Criados/Modificados

### Novos Arquivos
1. **`src/app/api/meta-conversion/route.ts`**
   - API Route para Meta Conversions API
   - Envia eventos server-side com dados hasheados
   - Deduplicação via `event_id`

2. **`src/lib/meta-pixel.ts`**
   - Funções utilitárias para tracking
   - Helpers para eventos standard e custom
   - Type-safe wrappers

### Arquivos Modificados
1. **`src/app/layout.tsx`**
   - Adicionado Meta Pixel base code
   - Script de inicialização + noscript fallback

2. **`src/app/diagnostico/page.tsx`**
   - Mapeamento de eventos do funil completo
   - Integração com Conversions API
   - Tracking de abandono

3. **`src/components/Hero.tsx`**
   - Tracking de cliques em CTAs principais
   - Tracking mobile sticky CTA

4. **`src/components/LeadForm.tsx`**
   - Tracking CTA seção final

5. **`src/components/WhatsAppFab.tsx`**
   - Tracking cliques WhatsApp

## 🔄 Funil de Conversão Completo

```
1. PageView (todas as páginas)
   ↓
2. CTAClick ("Diagnóstico Gratuito")
   ↓
3. ViewContent (Quiz iniciado)
   ↓
4. QuizAnswer (a cada pergunta)
   ↓
5. InitiateCheckout (quiz completo)
   ↓
6. Lead (dados capturados) ← CONVERSIONS API
   ↓
7. CompleteRegistration (resultado exibido)
```

**Alternativo:**
- **QuizAbandoned**: Dispara se usuário sair antes de completar

## 🧪 Como Testar

### 1. Pixel Helper (Chrome Extension)
- Instale: [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- Navegue pelo site e veja eventos disparando em tempo real

### 2. Events Manager (Meta Business Suite)
- Acesse: [Meta Events Manager](https://business.facebook.com/events_manager2/)
- Vá em "Test Events"
- Use o código de teste se configurado

### 3. Conversions API Test
- Use a ferramenta "Test Events" no Events Manager
- Verifique se eventos server-side aparecem com status "Deduped"

### 4. Verificação Manual
```bash
# Abra o console do navegador (F12)
# Cole este código:
fbq('track', 'PageView');
# Deve aparecer uma requisição para facebook.com/tr
```

## 🔐 Segurança

- ✅ Access Token **NÃO** é exposto no client-side
- ✅ Dados PII são hasheados (SHA256) antes de enviar à API
- ✅ Edge runtime para performance e segurança
- ✅ Deduplicação entre Pixel e Conversions API via `event_id`

## 📈 Próximos Passos

1. **Configurar Audiências Customizadas:**
   - Quiz iniciado mas não completado
   - Quiz completado mas não convertido em lead
   - Leads tier A/B/C

2. **Configurar Conversões Otimizadas:**
   - Otimização para evento "Lead"
   - Otimização para "CompleteRegistration"

3. **Remarketing:**
   - Anúncios para quem abandonou o quiz
   - Anúncios para leads tier A com urgência alta

4. **A/B Testing:**
   - Testar diferentes copys nos CTAs
   - Testar redução de perguntas no quiz

## 🆘 Troubleshooting

### Eventos não aparecem no Events Manager
1. Verifique se o Pixel ID está correto
2. Abra o console e procure por erros de JavaScript
3. Verifique se há bloqueadores de anúncios ativos
4. Use o Pixel Helper para debug

### Conversions API retorna erro
1. Verifique se o Access Token está válido
2. Confirme que o token tem permissões de "ads_management"
3. Verifique logs em `/api/meta-conversion`

### Eventos duplicados
- Isso é normal! O `event_id` garante deduplicação
- Verifique no Events Manager se eventos aparecem como "Deduped"

## 📞 Contato

Para dúvidas sobre esta configuração, contate o time de desenvolvimento.

---

**Última atualização**: 24/03/2026
**Configurado por**: Claude Code
