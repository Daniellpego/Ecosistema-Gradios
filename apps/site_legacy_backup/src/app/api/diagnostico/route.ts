import { NextRequest } from "next/server";
import { QUESTIONS, SECTOR_CONTEXT, getTier } from "../../diagnostico/_lib/data";

export const runtime = "edge";

// Server-controlled LLM parameters — never accepted from the client
const FIXED_MODEL = "claude-sonnet-4-20250514";
const FIXED_MAX_TOKENS = 600;

// Rate limiting is handled globally by src/middleware.ts (Upstash Redis).
// The per-instance in-memory guard has been removed to avoid dual-counting.

// Maximum allowed length for free-text lead fields (prompt injection mitigation)
const MAX_FIELD_LEN = 120;

interface DiagnosticoPayload {
  lead: { nome: string; empresa: string };
  score: number;
  answers: Record<string, number[]>;
  city?: string;
}

/** Strip control characters and limit length to prevent prompt injection. */
function sanitizeField(value: unknown, maxLen = MAX_FIELD_LEN): string {
  if (typeof value !== "string") return "";
  // Remove ASCII control chars (including newlines that could break prompt structure)
  return value.replace(/[\x00-\x1F\x7F]/g, " ").trim().slice(0, maxLen);
}

/** Safely resolve a single-select answer index against a question's options list. */
function safeOption(questionIdx: number, answerIdx: number | undefined): string {
  if (answerIdx == null) return "Não informado";
  const opts = QUESTIONS[questionIdx]?.opcoes;
  if (!opts || answerIdx < 0 || answerIdx >= opts.length) return "Não informado";
  return opts[answerIdx];
}

/** Safely resolve multiple indices for multi-select questions. */
function safeMultiOptions(questionIdx: number, indices: number[] | undefined): string {
  if (!Array.isArray(indices) || indices.length === 0) return "Nenhum";
  const opts = QUESTIONS[questionIdx]?.opcoes ?? [];
  return (
    indices
      .filter((i) => typeof i === "number" && i >= 0 && i < opts.length)
      .map((i) => opts[i])
      .join(", ") || "Nenhum"
  );
}

/** Build the system prompt entirely on the server from validated, structured data. */
function buildSystemPrompt(payload: DiagnosticoPayload): string {
  const { lead, score, answers, city } = payload;

  const nomeSanitized = sanitizeField(lead.nome);
  const empresaSanitized = sanitizeField(lead.empresa);
  const citySanitized = sanitizeField(city ?? "", 80);
  const primeiroNome = nomeSanitized.split(/\s+/)[0] || "Lead";

  const setor = safeOption(2, answers.setor?.[0]);

  // Explicit bounds-check so an out-of-range index never silently degrades
  // to "não informado" and wastes a full LLM call with missing context.
  const TEMPO_EXPANDIDO = [
    "menos de 5h/semana (~20h/mês)",
    "5 a 15h/semana (~40-60h/mês)",
    "16 a 40h/semana (~65-160h/mês)",
    "mais de 40h/semana (+160h/mês — equivale a uma pessoa inteira)",
  ] as const;
  const tempoIdx = answers.tempo?.[0];
  const tempoExpandido =
    tempoIdx != null && tempoIdx >= 0 && tempoIdx < TEMPO_EXPANDIDO.length
      ? TEMPO_EXPANDIDO[tempoIdx]
      : "não informado";

  const gargalosLabels = safeMultiOptions(3, answers.gargalos);
  const impactosLabels = safeMultiOptions(7, answers.impactos);
  const sectorCtx = SECTOR_CONTEXT[setor] ?? SECTOR_CONTEXT["Outro"];
  const prioridadeLabel = safeOption(10, answers.prioridade?.[0]);
  const budgetLabel = safeOption(9, answers.budget?.[0]);

  return `Você é o Gustavo, sócio da Gradios. Londrina, PR. Automação de processos, integrações sob medida, software custom. Você fala como um cara técnico que entende de negócio. Direto, sem firula, com autoridade.

DADOS DO LEAD (use TODOS no texto, não invente nada):
- Nome: ${primeiroNome}
- Empresa: ${empresaSanitized}
- Cidade: ${citySanitized || "não informada"}
- Cargo: ${safeOption(0, answers.cargo?.[0])}
- Porte: ${safeOption(1, answers.tamanho?.[0])} colaboradores
- Setor: ${setor}
- Gargalos marcados: ${gargalosLabels}
- Processos manuais: ${safeOption(4, answers.processos?.[0])}
- Sistemas que não conversam: ${safeOption(5, answers.sistemas?.[0])}
- Tempo perdido em retrabalho: ${tempoExpandido}
- Impactos reais: ${impactosLabels}
- Urgência: ${safeOption(8, answers.urgencia?.[0])}
- Budget disponível: ${budgetLabel}
- Prioridade: ${prioridadeLabel}
- Score: ${score}/100

CONTEXTO REAL DO SETOR (referência para o diagnóstico):
${sectorCtx}

FORMATO: texto corrido, 5 blocos separados por linha em branco. Sem markdown. Sem asteriscos. Sem bullet points. Sem títulos.

BLOCO 1 (ABERTURA - 2 frases):
Chame pelo primeiro nome. Mencione a cidade se disponível. Diga que cruzou os dados da ${empresaSanitized} e o resultado é claro. Tom direto, como se já conhecesse a empresa. Não diga "obrigado por responder".

BLOCO 2 (DIAGNÓSTICO - 3-4 frases):
Vá direto nos problemas. Cite os gargalos EXATOS que o lead marcou, os ${tempoExpandido} de retrabalho, os sistemas desconectados. Use números reais das respostas. Explique o custo invisível disso (horas desperdiçadas, decisões atrasadas, operação frágil). Fale como quem já viu esse cenário 50 vezes.

BLOCO 3 (CONTEXTO DO SETOR - 2 frases):
Compare com empresas parecidas do mesmo setor. Cite resultados reais que a Gradios entrega (use o contexto do setor acima). Números concretos (% de redução, horas economizadas).

BLOCO 4 (O QUE A GRADIOS FARIA - 2-3 frases):
Baseado na prioridade "${prioridadeLabel}" e no budget disponível "${budgetLabel}", diga EXATAMENTE o que a Gradios faria primeiro. Seja específico (qual sistema conectar com qual, qual processo automatizar, que tipo de dashboard montar). Se budget for baixo, sugira quick wins. Se for alto, sugira solução robusta. Nada vago.

BLOCO 5 (FECHAMENTO - 1 frase):
Diga que nos próximos dias a equipe vai entrar em contato para uma conversa rápida de 10 minutos. Sem compromisso, sem proposta, só pra entender a operação de perto.

REGRAS ABSOLUTAS (VIOLAÇÃO = DIAGNÓSTICO REJEITADO):
- Máximo 280 palavras
- LISTA PROIBIDA (se usar UMA palavra dessa lista, o diagnóstico será REJEITADO e você terá que refazer): "incrível", "fantástico", "transformação digital", "disruptivo", "revolucionário", "jornada", "alavancar", "potencializar", "ecossistema", "sinergia", "robusto", "escalável", "holístico", "paradigma", "agregar valor", "inteligência artificial", "machine learning", "inovação", "otimizar".
- SUBSTITUA POR: automatizar, conectar, integrar, eliminar, reduzir, mapear, simplificar, acelerar, unificar.
- NÃO comece frases com "Com base nas suas respostas" ou "Analisando o questionário"
- Tom: consultor que cobra caro e fala pouco. Cada frase tem que ter peso.
- Use vírgulas curtas. Frases diretas. Parece conversa de bar entre dois donos de empresa, não relatório corporativo.
- Se você usar qualquer palavra da LISTA PROIBIDA, o diagnóstico será descartado automaticamente.

EXEMPLO DE OUTPUT EXATO (Tom, Estilo e Tamanho):
João, cruzei os dados da Alfa LTDA e o cenário é claro.

Com 3 a 5 processos mapeados e o uso de 8 a 15 sistemas fragmentados, vocês perdem de 16 a 40 horas por mês em retrabalho puro. O financeiro lento e a dificuldade de escalar não são coincidências; a operação depende de pessoas pivotando dados, o que gera erros e custa receita.

Empresas de serviços do seu porte que automatizam essa camada reduzem o custo operacional em até 30% e dão escala sem precisar inchar a folha.

Para resolver a gestão cega, começaríamos conectando o faturamento e as vendas num fluxo único, sem intervenção humana. Cortar essa digitação cruzada é o que vai dar visibilidade de caixa imediata.

Nos próximos dias nossa equipe vai entrar em contato para uma conversa rápida de 10 minutos. Sem proposta, só pra entender a operação de perto.`;
}

/** Validate the incoming payload shape without trusting any client-controlled LLM params. */
function validatePayload(body: unknown): DiagnosticoPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  // Honeypot check — if the hidden `website` field is filled the sender is a bot.
  // Return null to 400 without revealing the reason.
  if (typeof b.website === "string" && b.website.trim() !== "") return null;

  if (typeof b.lead !== "object" || b.lead === null) return null;
  const lead = b.lead as Record<string, unknown>;
  if (typeof lead.nome !== "string" || typeof lead.empresa !== "string") return null;
  if (typeof b.score !== "number" || b.score < 0 || b.score > 100) return null;
  if (typeof b.answers !== "object" || b.answers === null) return null;

  return {
    lead: { nome: lead.nome, empresa: lead.empresa },
    score: b.score,
    answers: b.answers as Record<string, number[]>,
    city: typeof b.city === "string" ? b.city : undefined,
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = validatePayload(rawBody);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Invalid request payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // System prompt and user message are built entirely on the server.
  // The client no longer controls any part of the LLM call.
  const systemPrompt = buildSystemPrompt(payload);
  const tierInfo = getTier(payload.score);
  const primeiroNome = sanitizeField(payload.lead.nome).split(/\s+/)[0] || "Lead";
  const userMessage = `Gere o diagnóstico para ${primeiroNome} da empresa ${sanitizeField(payload.lead.empresa)}. Score: ${payload.score}/100 (Tier ${tierInfo.tier}).`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: FIXED_MODEL,
      max_tokens: FIXED_MAX_TOKENS,
      stream: true,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "Unknown error");
    return new Response(JSON.stringify({ error: text }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the response through to the client
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
