# Quiz Gradios — Email Nurturing (n8n)

## Fluxo: `quiz-email-nurturing.json`

Sequência de **6 emails × 4 tiers** que dispara automaticamente quando um lead completa o quiz de diagnóstico.

### Cronograma

| Email | Dia | Conteúdo | Subject (varia por tier) |
|-------|-----|----------|--------------------------|
| E1 | 0 (imediato) | Resultado + ROI + CTA WhatsApp | "Seu diagnóstico chegou — e o resultado é sério" |
| E2 | 2 | Aprofunda gargalo principal | "O gargalo que mais custa pra [Empresa]" |
| E3 | 4 | Case real do setor | "Como uma empresa de [setor] eliminou [horas] de retrabalho" |
| E4 | 7 | Dica prática implementável | "Uma coisa que você pode fazer hoje (sem custo)" |
| E5 | 10 | Follow-up suave + opt-out | "[Nome], ainda faz sentido conversar?" |
| E6 | 14 | Oferta direta (R$10k, 14 dias) | "Última mensagem — proposta específica" |

### Como importar no n8n

1. Abra o n8n → **Workflows** → **Import from file**
2. Selecione `quiz-email-nurturing.json`
3. O workflow aparece com todos os nodes conectados

### Configuração necessária

#### 1. Credencial Gmail
- Crie uma credencial OAuth2 do Gmail no n8n
- Substitua `"GMAIL_CREDENTIAL_ID"` pelo ID real da credencial em todos os 6 nodes de envio

#### 2. Webhook URL
- Após importar, abra o node **Webhook Trigger**
- Copie a **Production URL** gerada
- Cole no `.env` do site-principal:
  ```
  NEXT_PUBLIC_N8N_EMAIL_WEBHOOK_URL=https://seu-n8n.com/webhook/quiz-lead-nurturing
  ```

#### 3. Condição de parada (opcional mas recomendado)
- Adicione uma coluna `nurturing_paused` (boolean, default false) na tabela `quiz_leads` do Supabase
- No node **Check Pause Flag**, substitua o placeholder por uma chamada HTTP ao Supabase:
  ```
  GET https://urpuiznydrlwmaqhdids.supabase.co/rest/v1/quiz_leads?id=eq.{{lead_id}}&select=nurturing_paused
  ```
- Adicione um IF node: se `nurturing_paused = true`, para a sequência

#### 4. Ativar o workflow
- Clique em **Active** (toggle) no canto superior direito
- Teste com um lead real ou via webhook manual

### Dados recebidos no webhook

O site-principal envia o seguinte payload (já configurado em `page.tsx`):

```json
{
  "nome": "Daniel Lopes",
  "email": "daniel@empresa.com",
  "empresa": "Empresa X",
  "whatsapp": "43999999999",
  "setor": "SaaS/Tecnologia",
  "cargo": "Diretor(a)/CEO/C-level",
  "porte": "51 a 200",
  "score": 78,
  "tier": "A",
  "gargalo_principal": "Financeiro",
  "gargalos": "Financeiro, Comercial, Dados/Relatórios",
  "processos": "6 a 10",
  "sistemas": "4 a 6 desconectados",
  "tempo": "16 a 40h",
  "tempo_horas_mes": "~65-160h/mês",
  "impactos": "Erros por dado desatualizado, Decisões sem dado em tempo real",
  "urgencia": "Próximos 30 dias",
  "prioridade": "Integrar sistemas",
  "cidade": "Londrina"
}
```

### Arquitetura

```
Quiz → page.tsx (POST webhook) → n8n Webhook Trigger
                                    ↓
                              Prepare Variables (normaliza dados, calcula ROI)
                                    ↓
                              Email 1 (imediato) → Gmail
                                    ↓
                              Wait 2 days
                                    ↓
                              Check Pause → Email 2 → Gmail
                                    ↓
                              Wait 2 days → Email 3 → Gmail
                                    ↓
                              Wait 3 days → Email 4 → Gmail
                                    ↓
                              Wait 3 days → Email 5 → Gmail
                                    ↓
                              Wait 4 days → Email 6 → Gmail (fim)
```
