"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import {
  type Phase,
  type LeadData,
  QUESTIONS,
  SECTOR_CONTEXT,
  calculateScore,
  getTier,
  getOptionText,
  getMultiOptionTexts,
  getHorasMes,
} from "./_lib/data";
import IntroPhase from "./_components/intro-phase";
import QuizPhase from "./_components/quiz-phase";
import EmailGatePhase from "./_components/email-gate-phase";
import CapturePhase from "./_components/capture-phase";
import LoadingPhase from "./_components/loading-phase";
import ResultPhase from "./_components/result-phase";

/* ════════════════════════════════════════════════════════════
   SUPABASE SINGLETON
   ════════════════════════════════════════════════════════════ */

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    _supabase = createClient(url, key);
  }
  return _supabase;
}

/* ════════════════════════════════════════════════════════════
   ORCHESTRATOR
   ════════════════════════════════════════════════════════════ */

export default function DiagnosticoPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [city, setCity] = useState<string>("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [lead, setLead] = useState<LeadData>({ nome: "", empresa: "", email: "", whatsapp: "" });
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiText, setAiText] = useState("");
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // T1 — email capturado no gate após Q6. Marca se o gate foi exibido (com ou sem email).
  const [emailGatePassed, setEmailGatePassed] = useState(false);
  const streamRef = useRef<boolean>(false);
  const leadRowIdRef = useRef<string | null>(null);
  const diagSavedRef = useRef<boolean>(false);

  /* ── Detect city ── */
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => { if (d?.city) setCity(d.city); })
      .catch(() => {});
  }, []);

  /* ── Page meta: handled by diagnostico/layout.tsx (SSR) ── */

  /* ── Save AI diagnosis to Supabase when stream completes ── */
  useEffect(() => {
    if (phase !== "result" || !aiText || diagSavedRef.current) return;
    const streamDone = aiText.length > 50 && aiText.trimEnd().endsWith(".");
    if (!streamDone || !leadRowIdRef.current) return;

    diagSavedRef.current = true;
    (async () => {
      try {
        const sb = getSupabase();
        if (!sb) return;
        await sb.from("quiz_leads").update({ diagnostico_ia: aiText }).eq("id", leadRowIdRef.current!);
      } catch {
        // silently continue
      }
    })();
  }, [phase, aiText]);

  /* ── Quiz answer handlers ── */

  function handleSingleSelect(questionId: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: [idx] }));

    // Track per-question events
    trackEvent("quiz_answer", { question: questionId, answer_index: idx });
  }

  function handleMultiToggle(questionId: string, idx: number) {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(idx)) {
        return { ...prev, [questionId]: current.filter((i) => i !== idx) };
      }
      return { ...prev, [questionId]: [...current, idx] };
    });
  }

  // Índice da Q6 (sistemas) = 5 no array 0-based. Gate aparece logo após.
  const EMAIL_GATE_AFTER_Q = 5;

  function nextQuestion() {
    // T1 — após Q6, injeta o gate de email (1x por sessão)
    if (currentQ === EMAIL_GATE_AFTER_Q && !emailGatePassed) {
      setPhase("email-gate");
      trackEvent("email_gate_shown");
      return;
    }
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      setPhase("capture");
      trackEvent("quiz_completed", { questions_answered: Object.keys(answers).length });
    }
  }

  function handleEmailGateSubmit(email: string) {
    setLead((p) => ({ ...p, email }));
    setEmailGatePassed(true);
    setPhase("quiz");
    setCurrentQ((p) => Math.max(p, EMAIL_GATE_AFTER_Q) + 1);
    trackEvent("email_gate_submitted", { provided: true });
  }

  function handleEmailGateSkip() {
    setEmailGatePassed(true);
    setPhase("quiz");
    setCurrentQ((p) => Math.max(p, EMAIL_GATE_AFTER_Q) + 1);
    trackEvent("email_gate_submitted", { provided: false });
  }

  function prevQuestion() {
    if (currentQ > 0) {
      setCurrentQ((p) => p - 1);
    }
  }

  /* ── Analytics helper ── */

  function trackEvent(event: string, params?: Record<string, unknown>) {
    try {
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).fbq) {
        const fbq = (window as unknown as { fbq: (...args: unknown[]) => void }).fbq;

        // Map custom events to Meta Pixel standard events
        switch (event) {
          case "quiz_start":
            fbq("track", "ViewContent", { content_name: "Quiz Diagnóstico Gradios", content_category: "Quiz" });
            break;
          case "quiz_answer":
            fbq("trackCustom", "QuizAnswer", params);
            break;
          case "quiz_completed":
            fbq("track", "InitiateCheckout", { content_name: "Quiz Completo", num_items: params?.questions_answered || 0 });
            break;
          case "lead_captured":
            fbq("track", "Lead", {
              content_name: "Diagnóstico Gradios",
              content_category: params?.setor || "Não informado",
              value: 0,
              currency: "BRL"
            });
            break;
          case "diagnosis_viewed":
            fbq("track", "CompleteRegistration", {
              content_name: "Resultado Diagnóstico",
              status: `Tier ${params?.tier}`,
              value: (params?.score as number) || 0
            });
            break;
          case "quiz_abandoned":
            fbq("trackCustom", "QuizAbandoned", params);
            break;
          default:
            fbq("trackCustom", event, params);
        }
      }
      // Also push to dataLayer for GTM/GA4 if available
      if (typeof window !== "undefined" && (window as unknown as { dataLayer?: unknown[] }).dataLayer) {
        (window as unknown as { dataLayer: unknown[] }).dataLayer.push({ event, ...params });
      }
    } catch {
      // silently continue
    }
  }

  // Track quiz abandonment on page unload
  useEffect(() => {
    function handleBeforeUnload() {
      if (phase === "quiz" && currentQ < QUESTIONS.length - 1) {
        trackEvent("quiz_abandoned", {
          last_question: QUESTIONS[currentQ]?.id,
          progress: `${currentQ + 1}/${QUESTIONS.length}`,
          partial_score: calculateScore(answers),
        });
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase, currentQ, answers]);

  /* ── AI streaming call ── */

  const startAiStream = useCallback(
    async (finalScore: number) => {
      if (streamRef.current) return;
      streamRef.current = true;

      const tierInfo = getTier(finalScore);
      const setor = answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "Não informado";
      const tempoIdx = answers.tempo?.[0] ?? 0;
      const tempoExpandido = [
        "menos de 5h/semana (~20h/mês)",
        "5 a 15h/semana (~40-60h/mês)",
        "16 a 40h/semana (~65-160h/mês)",
        "mais de 40h/semana (+160h/mês — equivale a uma pessoa inteira)",
      ][tempoIdx] ?? "não informado";

      const gargalosLabels = answers.gargalos?.map((i) => QUESTIONS[3].opcoes[i]).join(", ") || "Nenhum";
      const impactosLabels = answers.impactos?.map((i) => QUESTIONS[7].opcoes[i]).join(", ") || "Nenhum";
      const sectorCtx = SECTOR_CONTEXT[setor] || SECTOR_CONTEXT["Outro"];

      const systemPrompt = `Você é o Gustavo, sócio da Gradios. Londrina, PR. Automação de processos, integrações sob medida, software custom. Você fala como um cara técnico que entende de negócio. Direto, sem firula, com autoridade.

DADOS DO LEAD (use TODOS no texto, não invente nada):
- Nome: ${lead.nome.split(" ")[0]}
- Empresa: ${lead.empresa}
- Cidade: ${city || "não informada"}
- Cargo: ${answers.cargo?.[0] != null ? QUESTIONS[0].opcoes[answers.cargo[0]] : "Não informado"}
- Porte: ${answers.tamanho?.[0] != null ? QUESTIONS[1].opcoes[answers.tamanho[0]] : "Não informado"} colaboradores
- Setor: ${setor}
- Gargalos marcados: ${gargalosLabels}
- Processos manuais: ${answers.processos?.[0] != null ? QUESTIONS[4].opcoes[answers.processos[0]] : "Não informado"}
- Sistemas que não conversam: ${answers.sistemas?.[0] != null ? QUESTIONS[5].opcoes[answers.sistemas[0]] : "Não informado"}
- Tempo perdido em retrabalho: ${tempoExpandido}
- Impactos reais: ${impactosLabels}
- Urgência: ${answers.urgencia?.[0] != null ? QUESTIONS[8].opcoes[answers.urgencia[0]] : "Não informado"}
- Budget disponível: ${answers.budget?.[0] != null ? QUESTIONS[9].opcoes[answers.budget[0]] : "Não informado"}
- Prioridade: ${answers.prioridade?.[0] != null ? QUESTIONS[10].opcoes[answers.prioridade[0]] : "Não informado"}
- Score: ${finalScore}/100

CONTEXTO REAL DO SETOR (referência para o diagnóstico):
${sectorCtx}

FORMATO: texto corrido, 5 blocos separados por linha em branco. Sem markdown. Sem asteriscos. Sem bullet points. Sem títulos.

BLOCO 1 (ABERTURA - 2 frases):
Chame pelo primeiro nome. Mencione a cidade se disponível. Diga que cruzou os dados da ${lead.empresa} e o resultado é claro. Tom direto, como se já conhecesse a empresa. Não diga "obrigado por responder".

BLOCO 2 (DIAGNÓSTICO - 3-4 frases):
Vá direto nos problemas. Cite os gargalos EXATOS que o lead marcou, os ${tempoExpandido} de retrabalho, os sistemas desconectados. Use números reais das respostas. Explique o custo invisível disso (horas desperdiçadas, decisões atrasadas, operação frágil). Fale como quem já viu esse cenário 50 vezes.

BLOCO 3 (CONTEXTO DO SETOR - 2 frases):
Compare com empresas parecidas do mesmo setor. Cite resultados reais que a Gradios entrega (use o contexto do setor acima). Números concretos (% de redução, horas economizadas).

BLOCO 4 (O QUE A GRADIOS FARIA - 2-3 frases):
Baseado na prioridade "${answers.prioridade?.[0] != null ? QUESTIONS[10].opcoes[answers.prioridade[0]] : "não definida"}" e no budget disponível "${answers.budget?.[0] != null ? QUESTIONS[9].opcoes[answers.budget[0]] : "não informado"}", diga EXATAMENTE o que a Gradios faria primeiro. Seja específico (qual sistema conectar com qual, qual processo automatizar, que tipo de dashboard montar). Se budget for baixo, sugira quick wins. Se for alto, sugira solução robusta. Nada vago.

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

      try {
        const res = await fetch("/api/diagnostico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 600,
            messages: [
              {
                role: "user",
                content: `Gere o diagnóstico para o lead ${lead.nome.split(" ")[0]} da empresa ${lead.empresa}. Score: ${finalScore}/100 (Tier ${tierInfo.tier}).`,
              },
            ],
            system: systemPrompt,
          }),
        });

        if (!res.ok || !res.body) {
          setAiText("Diagnóstico em processamento. Nossa equipe entrará em contato com os resultados completos.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                setAiText((prev) => prev + parsed.delta.text);
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      } catch {
        setAiText("Diagnóstico em processamento. Nossa equipe entrará em contato com os resultados completos.");
      }
    },
    [answers, city, lead]
  );

  /* ── Submit lead & start loading ── */

  async function handleSubmitLead() {
    setIsSubmitting(true);
    const finalScore = calculateScore(answers);
    setScore(finalScore);
    const tierInfo = getTier(finalScore);

    const setor = answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "Não informado";

    // Webhooks (Discord + n8n) disparam via triggers Supabase (migration 010)

    // Generate unique event ID for deduplication between Pixel and Conversions API
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Meta Pixel (client-side)
    trackEvent("lead_captured", { setor, tier: tierInfo.tier, score: finalScore });

    // Meta Conversions API (server-side) - fire and forget
    fetch("/api/meta-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "Lead",
        eventSourceUrl: window.location.href,
        userData: {
          email: lead.email,
          phone: lead.whatsapp,
          firstName: lead.nome.split(" ")[0],
          lastName: lead.nome.split(" ").slice(1).join(" "),
          city: city,
          country: "br",
        },
        customData: {
          content_name: "Diagnóstico Gradios",
          content_category: setor,
          tier: tierInfo.tier,
          score: finalScore,
          value: 0,
          currency: "BRL",
        },
        eventId,
      }),
    }).catch(() => {
      // Silently fail if Conversions API is down
    });

    // Supabase — save lead
    try {
      const sb = getSupabase();
      if (!sb) throw new Error("Supabase not configured");
      const params = new URLSearchParams(window.location.search);
      const { data } = await sb
        .from("quiz_leads")
        .insert({
          nome: lead.nome,
          empresa: lead.empresa,
          email: lead.email,
          whatsapp: lead.whatsapp,
          cidade: city || null,
          score: finalScore,
          tier: tierInfo.tier,
          cargo: getOptionText("cargo", answers.cargo?.[0]),
          tamanho: getOptionText("tamanho", answers.tamanho?.[0]),
          setor: getOptionText("setor", answers.setor?.[0]),
          gargalos: getMultiOptionTexts("gargalos", answers.gargalos),
          processos: getOptionText("processos", answers.processos?.[0]),
          sistemas: getOptionText("sistemas", answers.sistemas?.[0]),
          tempo: getOptionText("tempo", answers.tempo?.[0]),
          tempo_horas_mes: getHorasMes(answers.tempo?.[0]),
          impactos: getMultiOptionTexts("impactos", answers.impactos),
          urgencia: getOptionText("urgencia", answers.urgencia?.[0]),
          budget: getOptionText("budget", answers.budget?.[0]),
          prioridade: getOptionText("prioridade", answers.prioridade?.[0]),
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          utm_content: params.get("utm_content"),
        })
        .select("id")
        .single();

      if (data?.id) leadRowIdRef.current = data.id;
    } catch {
      // continue silently
    }

    setPhase("loading");

    // Start AI stream in parallel
    startAiStream(finalScore);

    // Animated loading steps
    const stepTimings = [800, 1100, 900, 1000, 1200];
    for (let i = 0; i < stepTimings.length; i++) {
      setLoadingStep(i);
      await new Promise((r) => setTimeout(r, stepTimings[i]));
    }
    setLoadingStep(5);

    await new Promise((r) => setTimeout(r, 800));
    setPhase("result");
    trackEvent("diagnosis_viewed", { score: finalScore, tier: tierInfo.tier });
  }

  /* ── Phase helpers ── */

  function handleIntroStart() {
    setPhase("quiz");
    trackEvent("quiz_start");
  }

  /* ════════════════════════════════════════════════════════════
     RENDER — Full dark mode tunnel (intro → quiz → capture → loading → result)
     ════════════════════════════════════════════════════════════ */

  return (
    <section
      className="relative z-10 min-h-[100dvh] bg-[#080E1A] overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #080E1A 0%, #0A1628 30%, #0F1D32 100%)" }}
    >

      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {phase === "intro" && (
          <IntroPhase onStart={handleIntroStart} />
        )}

        {phase === "quiz" && (
          <QuizPhase
            currentQ={currentQ}
            answers={answers}
            onSingleSelect={handleSingleSelect}
            onMultiToggle={handleMultiToggle}
            onNext={nextQuestion}
            onPrev={prevQuestion}
          />
        )}

        {phase === "email-gate" && (
          <EmailGatePhase
            initialEmail={lead.email}
            onSubmit={handleEmailGateSubmit}
            onSkip={handleEmailGateSkip}
          />
        )}

        {phase === "capture" && (
          <CapturePhase
            lead={lead}
            setLead={setLead}
            answers={answers}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitLead}
          />
        )}

        {phase === "loading" && (
          <LoadingPhase
            empresa={lead.empresa}
            city={city}
            loadingStep={loadingStep}
            gargalosCount={answers.gargalos?.length ?? 0}
            horasMes={answers.tempo?.[0] != null ? ["~20h", "~40-60h", "~65-160h", "+160h"][answers.tempo[0]] : "0h"}
            setor={answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "vários setores"}
          />
        )}

        {phase === "result" && (
          <ResultPhase
            lead={lead}
            answers={answers}
            score={score}
            city={city}
            aiText={aiText}
          />
        )}
      </div>
    </section>
  );
}
