import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── AI Provider with Automatic Fallback ─────────────────────
// Tries Groq first (fastest) → falls back to OpenRouter (Nemotron 3 Super, free)

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // 1. Try Groq first
  try {
    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (groqKey) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }

      console.warn('Groq falhou, tentando OpenRouter...', response.status)
    }
  } catch (error) {
    console.warn('Groq erro, tentando OpenRouter...', error)
  }

  // 2. Fallback: OpenRouter with Nemotron 3 Super (free)
  try {
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterKey) throw new Error('OPENROUTER_API_KEY não configurada')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://bgtechsolucoes.com.br',
        'X-Title': 'Gradios Paineis',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) throw new Error(`OpenRouter falhou: ${response.status}`)

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Ambos falharam:', error)
    throw new Error('Não foi possível gerar análise. Tente novamente em instantes.')
  }
}

// ─── Edge Function Handler ───────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, context, systemPrompt } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build system prompt
    const system = systemPrompt ?? `Você é um analista financeiro e de negócios da Gradios, uma empresa de automação e tecnologia.
Responda de forma objetiva, direta e em português brasileiro.
Use dados concretos quando disponíveis.
Formate a resposta em tópicos claros.`

    // Build user prompt with context if provided
    let userMessage = prompt
    if (context && Object.keys(context).length > 0) {
      userMessage = `Contexto dos dados:\n${JSON.stringify(context, null, 2)}\n\nPergunta/Análise:\n${prompt}`
    }

    const analysis = await callAI(system, userMessage)

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Não foi possível gerar análise. Tente novamente em instantes.'

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
