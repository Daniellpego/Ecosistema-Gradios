"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */

type Phase = "intro" | "quiz" | "capture" | "loading" | "result";

interface Question {
  id: string;
  categoria: string;
  pergunta: string;
  sub: string;
  tipo: "single" | "multi";
  opcoes: string[];
  scores: number[] | null;
  horasMap?: string[];
}

interface LeadData {
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
}

/* ════════════════════════════════════════════════════════════
   QUESTIONS DATA
   ════════════════════════════════════════════════════════════ */

const QUESTIONS: Question[] = [
  {
    id: "cargo",
    categoria: "Perfil",
    pergunta: "Com quem a gente está falando?",
    sub: "Isso personaliza o seu diagnóstico.",
    tipo: "single",
    opcoes: [
      "Sócio(a)/Fundador(a)",
      "Diretor(a)/CEO/C-level",
      "Head/Gerente",
      "Coordenador(a)",
      "Analista/Operação",
      "Outro",
    ],
    scores: [10, 10, 7, 3, 0, 3],
  },
  {
    id: "tamanho",
    categoria: "Empresa",
    pergunta: "Qual é o porte da empresa hoje?",
    sub: "Cada tamanho tem gargalos diferentes.",
    tipo: "single",
    opcoes: ["Até 10", "11 a 50", "51 a 200", "201 a 500", "Mais de 500"],
    scores: [2, 5, 10, 10, 8],
  },
  {
    id: "setor",
    categoria: "Empresa",
    pergunta: "Em qual setor vocês atuam?",
    sub: "A Gradios atende vários setores — cada um tem seu padrão de automação.",
    tipo: "single",
    opcoes: [
      "Varejo/E-commerce",
      "Indústria/Manufatura",
      "Logística/Distribuição",
      "Saúde/Clínicas",
      "Financeiro/Contabilidade",
      "SaaS/Tecnologia",
      "Serviços em geral",
      "Outro",
    ],
    scores: null,
  },
  {
    id: "gargalos",
    categoria: "Operação",
    pergunta: "Onde estão os maiores gargalos da operação hoje?",
    sub: "Selecione tudo que se aplica — seja honesto.",
    tipo: "multi",
    opcoes: [
      "Financeiro — fechamentos manuais",
      "Comercial — CRM desatualizado",
      "Atendimento — respostas lentas",
      "Operações — dependem de pessoas",
      "Logística/Estoque — planilha como sistema",
      "RH — onboarding manual",
      "Dados/Relatórios — fechamento leva dias",
    ],
    scores: null, // calculated by count
  },
  {
    id: "processos",
    categoria: "Operação",
    pergunta: "Quantos processos dependem de digitação manual hoje?",
    sub: "Pense nos que param se uma pessoa chave tirar férias.",
    tipo: "single",
    opcoes: ["Nenhum", "1 a 2", "3 a 5", "6 a 10", "Mais de 10"],
    scores: [0, 5, 12, 18, 20],
  },
  {
    id: "sistemas",
    categoria: "Operação",
    pergunta: "Quantos sistemas não conversam entre si?",
    sub: "ERP sem CRM. Planilha paralela. O sistema que só o João sabe usar.",
    tipo: "single",
    opcoes: [
      "Poucos sistemas",
      "2 a 3 parcialmente integrados",
      "4 a 6 desconectados",
      "7 ou mais",
    ],
    scores: [3, 8, 13, 15],
  },
  {
    id: "tempo",
    categoria: "Operação",
    pergunta: "Quanto tempo por semana vai para retrabalho manual?",
    sub: "Esse número vai aparecer no seu diagnóstico.",
    tipo: "single",
    opcoes: ["Menos de 5h", "5 a 15h", "16 a 40h", "Mais de 40h"],
    scores: [3, 8, 13, 15],
    horasMap: ["~20h", "~40-60h", "~65-160h", "+160h"],
  },
  {
    id: "impactos",
    categoria: "Operação",
    pergunta: "O que esse cenário causa na prática?",
    sub: "Selecione tudo que acontece com frequência.",
    tipo: "multi",
    opcoes: [
      "Atrasos em entregas",
      "Erros por dado desatualizado",
      "Decisões sem dado em tempo real",
      "Custo alto com equipe em tarefas automáticas",
      "Perda de cliente por lentidão",
      "Dificuldade de escalar",
    ],
    scores: null,
  },
  {
    id: "urgencia",
    categoria: "Prioridade",
    pergunta: "Quando vocês precisam resolver isso?",
    sub: "Sem julgamento — queremos entender sua urgência real.",
    tipo: "single",
    opcoes: [
      "Só estou mapeando",
      "Próximos 6 meses",
      "Próximos 3 meses",
      "Próximos 30 dias",
      "Prioridade imediata",
    ],
    scores: [1, 4, 7, 9, 10],
  },
  {
    id: "prioridade",
    categoria: "Prioridade",
    pergunta: "Se a Gradios resolvesse uma coisa agora, o que seria?",
    sub: "Define a recomendação personalizada do diagnóstico.",
    tipo: "single",
    opcoes: [
      "Eliminar processos manuais",
      "Integrar sistemas",
      "Software sob medida",
      "Dashboard e KPIs",
      "IA no atendimento/análise",
      "Ainda não sei",
    ],
    scores: null,
  },
];

/* ════════════════════════════════════════════════════════════
   SCORE CALCULATION
   ════════════════════════════════════════════════════════════ */

function multiScore(count: number, max: number): number {
  if (max === 7) {
    // gargalos
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 3;
    if (count <= 5) return 5;
    return 7;
  }
  // impactos (max 6)
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 3;
  if (count <= 5) return 5;
  return 7;
}

function calculateScore(answers: Record<string, number[]>): number {
  let raw = 0;

  // P1 cargo
  if (answers.cargo?.[0] != null) raw += [10, 10, 7, 3, 0, 3][answers.cargo[0]];
  // P2 tamanho
  if (answers.tamanho?.[0] != null) raw += [2, 5, 10, 10, 8][answers.tamanho[0]];
  // P3 setor — não pontua
  // P4 gargalos — multi
  if (answers.gargalos) raw += multiScore(answers.gargalos.length, 7);
  // P5 processos
  if (answers.processos?.[0] != null) raw += [0, 5, 12, 18, 20][answers.processos[0]];
  // P6 sistemas
  if (answers.sistemas?.[0] != null) raw += [3, 8, 13, 15][answers.sistemas[0]];
  // P7 tempo
  if (answers.tempo?.[0] != null) raw += [3, 8, 13, 15][answers.tempo[0]];
  // P8 impactos — multi
  if (answers.impactos) raw += multiScore(answers.impactos.length, 6);
  // P9 urgencia
  if (answers.urgencia?.[0] != null) raw += [1, 4, 7, 9, 10][answers.urgencia[0]];
  // P10 prioridade — não pontua

  let score = Math.min(100, Math.round((raw / 94) * 100));

  // Hard filter 1: Analista/Operação → score máximo = 50
  if (answers.cargo?.[0] === 4) score = Math.min(score, 50);

  // Soft override: Prioridade imediata → tier B mínimo (score >= 55)
  if (answers.urgencia?.[0] === 4) score = Math.max(score, 55);

  // Hard filter 2: Até 10 colaboradores + Só estou mapeando → tier D direto
  if (answers.tamanho?.[0] === 0 && answers.urgencia?.[0] === 0) {
    score = Math.min(score, 39);
  }

  return score;
}

function getTier(score: number): { label: string; tier: string; color: string } {
  if (score >= 75) return { label: "Potencial Alto", tier: "A", color: "#16a34a" };
  if (score >= 55) return { label: "Potencial Moderado", tier: "B", color: "#d97706" };
  if (score >= 40) return { label: "Potencial Inicial", tier: "C", color: "#0A1B5C" };
  return { label: "Em Desenvolvimento", tier: "D", color: "#64748B" };
}

/* ════════════════════════════════════════════════════════════
   SECTOR CONTEXT FOR AI PROMPT
   ════════════════════════════════════════════════════════════ */

const SECTOR_CONTEXT: Record<string, string> = {
  "Varejo/E-commerce":
    "Sistemas como VTEX, Tiny, Bling, Shopify raramente conversam com o financeiro sem integração. Gargalo típico: pedido entra, estoque não atualiza, NF emitida manualmente. Divergência de estoque vira rotina. Resultado esperado com automação: fechamento de 3 dias para 2 horas, eliminação de divergência de estoque, pedido→estoque→financeiro rodando sem intervenção humana.",
  "Indústria/Manufatura":
    "ERP existe (Totvs, SAP, Senior) mas não está integrado ao chão de fábrica. Apontamento de produção manual, OEE invisível, relatórios de produção chegam com 24-48h de atraso. Decisões tomadas com dados de ontem. Resultado esperado: visibilidade em tempo real do chão de fábrica, redução de 40% no retrabalho, relatórios automáticos no fechamento do turno.",
  "Logística/Distribuição":
    "Emissão manual de NF + comunicação com transportadora feita uma por uma. WMS não conectado ao ERP do cliente. Rastreamento depende de ligação. Resultado esperado: eliminar 80% das ligações de status, NF emitida automaticamente ao confirmar pedido, tracking integrado ao sistema do cliente.",
  "Saúde/Clínicas":
    "Confirmação de consulta ainda por ligação manual, prontuário + agendamento + faturamento em sistemas separados, risco de glosa no faturamento ao plano de saúde. Retrabalho constante na conciliação. Resultado esperado: redução de 35% no no-show com confirmação automática, aceleração do ciclo de recebimento, faturamento ao convênio sem retrabalho.",
  "Financeiro/Contabilidade":
    "Case real da Gradios — fechamento mensal de 3 dias para 4 horas com automação de conciliação bancária e fluxo de aprovações. Lançamentos manuais e relatórios gerenciais sempre atrasados. Planilhas paralelas como fonte de verdade. Resultado esperado: conciliação automática, relatórios em tempo real, fluxo de aprovação digital sem e-mail.",
  "SaaS/Tecnologia":
    "Onboarding do cliente manual e lento, integração CRM (HubSpot, Pipedrive) + billing (Stripe, Iugu) + suporte feita por gambiarras ou Zapier frágil. CS sem visão completa do cliente. Resultado esperado: redução de 50% no time-to-value, CS com dashboard unificado, churn detectado antes de acontecer.",
  "Serviços em geral":
    "Proposta + contrato + NF + cobrança ainda por e-mail manual, follow-up dependente de memória, CRM inexistente ou subutilizado. Vendedor gasta mais tempo em admin do que vendendo. Resultado esperado: ciclo de vendas 30% mais rápido com fluxo automatizado de proposta→contrato→NF→cobrança.",
  Outro:
    "Diagnóstico consultivo amplo, foco nos gargalos específicos mencionados pelo lead. Análise cruzada entre processos manuais, sistemas desconectados e impacto financeiro do retrabalho.",
};

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   SUPABASE HELPERS
   ════════════════════════════════════════════════════════════ */

function getOptionText(questionId: string, answerIndex: number | undefined): string {
  if (answerIndex == null) return "Não informado";
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q?.opcoes[answerIndex] ?? "Não informado";
}

function getMultiOptionTexts(questionId: string, answerIndexes: number[] | undefined): string[] {
  if (!answerIndexes || answerIndexes.length === 0) return [];
  const q = QUESTIONS.find((q) => q.id === questionId);
  if (!q) return [];
  return answerIndexes.map((i) => q.opcoes[i]).filter(Boolean);
}

function getHorasMes(tempoIndex: number | undefined): string {
  if (tempoIndex == null) return "Não informado";
  return ["~20h/mês", "~40-60h/mês", "~65-160h/mês", "+160h/mês"][tempoIndex] ?? "Não informado";
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function DiagnosticoPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [city, setCity] = useState<string>("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [lead, setLead] = useState<LeadData>({
    nome: "",
    empresa: "",
    email: "",
    whatsapp: "",
  });
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiText, setAiText] = useState("");
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const streamRef = useRef<boolean>(false);
  const leadRowIdRef = useRef<string | null>(null);
  const diagSavedRef = useRef<boolean>(false);

  // Detect city
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (d?.city) setCity(d.city);
      })
      .catch(() => {});
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Diagnóstico Gratuito | Gradios";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Descubra em 2 minutos onde sua empresa perde tempo e dinheiro com processos manuais. Diagnóstico personalizado por IA."
      );
    }
  }, []);

  // Animated score counter
  useEffect(() => {
    if (phase !== "result") return;
    let current = 0;
    const target = score;
    const interval = setInterval(() => {
      current += 1;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, 20);
    return () => clearInterval(interval);
  }, [phase, score]);

  // Supabase — salvar diagnostico_ia quando o stream completar
  useEffect(() => {
    if (phase !== "result" || !aiText || diagSavedRef.current) return;
    // Detecta que o stream terminou: texto existe e termina com ponto
    const streamDone = aiText.length > 50 && aiText.trimEnd().endsWith(".");
    if (!streamDone) return;
    if (!leadRowIdRef.current) return;

    diagSavedRef.current = true;
    (async () => {
      try {
        await supabase
          .from("quiz_leads")
          .update({ diagnostico_ia: aiText })
          .eq("id", leadRowIdRef.current!);
      } catch {
        console.log("Supabase update diagnostico_ia falhou.");
      }
    })();
  }, [phase, aiText]);

  const q = QUESTIONS[currentQ];

  /* ── Quiz answer handlers ── */

  function handleSingleSelect(optionIdx: number) {
    setAnswers((prev) => ({ ...prev, [q.id]: [optionIdx] }));
  }

  function handleMultiToggle(optionIdx: number) {
    setAnswers((prev) => {
      const current = prev[q.id] || [];
      if (current.includes(optionIdx)) {
        return { ...prev, [q.id]: current.filter((i) => i !== optionIdx) };
      }
      return { ...prev, [q.id]: [...current, optionIdx] };
    });
  }

  function canAdvance(): boolean {
    const a = answers[q.id];
    if (!a || a.length === 0) return false;
    return true;
  }

  function nextQuestion() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      setPhase("capture");
    }
  }

  function prevQuestion() {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  }

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

      const gargalosLabels =
        answers.gargalos?.map((i) => QUESTIONS[3].opcoes[i]).join(", ") || "Nenhum";
      const impactosLabels =
        answers.impactos?.map((i) => QUESTIONS[7].opcoes[i]).join(", ") || "Nenhum";

      const sectorCtx = SECTOR_CONTEXT[setor] || SECTOR_CONTEXT["Outro"];

      const systemPrompt = `Você é consultor sênior de automação da Gradios, empresa de Londrina, PR, especializada em automação de processos, integrações e software sob medida.
Escreva um diagnóstico personalizado e cirúrgico para este lead. Nada genérico.

PERFIL:
- Nome: ${lead.nome.split(" ")[0]} — use apenas o primeiro nome
- Empresa: ${lead.empresa}
- Cidade: ${city || "não detectada"}
- Cargo: ${answers.cargo?.[0] != null ? QUESTIONS[0].opcoes[answers.cargo[0]] : "Não informado"}
- Porte: ${answers.tamanho?.[0] != null ? QUESTIONS[1].opcoes[answers.tamanho[0]] : "Não informado"}
- Setor: ${setor}
- Gargalos: ${gargalosLabels}
- Processos manuais: ${answers.processos?.[0] != null ? QUESTIONS[4].opcoes[answers.processos[0]] : "Não informado"}
- Sistemas desconectados: ${answers.sistemas?.[0] != null ? QUESTIONS[5].opcoes[answers.sistemas[0]] : "Não informado"}
- Tempo perdido: ${tempoExpandido}
- Impactos: ${impactosLabels}
- Urgência: ${answers.urgencia?.[0] != null ? QUESTIONS[8].opcoes[answers.urgencia[0]] : "Não informado"}
- Prioridade: ${answers.prioridade?.[0] != null ? QUESTIONS[9].opcoes[answers.prioridade[0]] : "Não informado"}
- Score: ${finalScore}/100

CONTEXTO DO SETOR (use para personalizar o diagnóstico):
${sectorCtx}

ESTRUTURA OBRIGATÓRIA — 4 parágrafos, linha em branco entre cada, sem títulos, sem markdown, sem asteriscos:

Parágrafo 1 (2 frases): chame pelo primeiro nome, mencione a cidade de forma natural se disponível, diga que analisou as respostas da empresa. Tom: colega de confiança.

Parágrafo 2 (3-4 bullets com •): achados com os dados REAIS — inclua as horas/mês, os sistemas desconectados, as áreas marcadas como gargalo. Números concretos.

Parágrafo 3 (2 frases): diagnóstico do setor específico — o que empresas similares ganham ao automatizar os gargalos identificados. Use o contexto do setor acima.

Parágrafo 4 (1 frase): diga que a equipe da Gradios vai entrar em contato nas próximas horas para uma conversa de 30 minutos.

PROIBIDO: "incrível", "fantástico", "transformação digital", "jornada", "alavancar", "potencializar", "ecossistema", linguagem corporativa vaga. Máximo 220 palavras.`;

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 600,
            stream: true,
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
          setAiText(
            "Diagnóstico em processamento. Nossa equipe entrará em contato com os resultados completos."
          );
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
              if (
                parsed.type === "content_block_delta" &&
                parsed.delta?.type === "text_delta"
              ) {
                setAiText((prev) => prev + parsed.delta.text);
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      } catch {
        setAiText(
          "Diagnóstico em processamento. Nossa equipe entrará em contato com os resultados completos."
        );
      }
    },
    [answers, city, lead]
  );

  /* ── Submit lead & start loading ── */

  async function handleSubmitLead() {
    const finalScore = calculateScore(answers);
    setScore(finalScore);
    const tierInfo = getTier(finalScore);

    const setor =
      answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "Não informado";
    const cargo =
      answers.cargo?.[0] != null ? QUESTIONS[0].opcoes[answers.cargo[0]] : "Não informado";
    const porte =
      answers.tamanho?.[0] != null ? QUESTIONS[1].opcoes[answers.tamanho[0]] : "Não informado";
    const gargalos =
      answers.gargalos?.map((i: number) => QUESTIONS[3].opcoes[i]).join(", ") || "Nenhum";
    const processos =
      answers.processos?.[0] != null ? QUESTIONS[4].opcoes[answers.processos[0]] : "Não informado";
    const sistemas =
      answers.sistemas?.[0] != null ? QUESTIONS[5].opcoes[answers.sistemas[0]] : "Não informado";
    const tempo =
      answers.tempo?.[0] != null ? QUESTIONS[6].opcoes[answers.tempo[0]] : "Não informado";
    const impactos =
      answers.impactos?.map((i: number) => QUESTIONS[7].opcoes[i]).join(", ") || "Nenhum";
    const urgencia =
      answers.urgencia?.[0] != null ? QUESTIONS[8].opcoes[answers.urgencia[0]] : "Não informado";
    const prioridade =
      answers.prioridade?.[0] != null ? QUESTIONS[9].opcoes[answers.prioridade[0]] : "Não informado";

    // Webhook (fire & forget)
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🎯 **NOVO LEAD — DIAGNÓSTICO**\n\n**Nome:** ${lead.nome}\n**Empresa:** ${lead.empresa}\n**Email:** ${lead.email}\n**WhatsApp:** ${lead.whatsapp || "não informado"}\n**Cidade:** ${city || "não detectada"}\n\n**Score:** ${finalScore}/100 — **Tier ${tierInfo.tier}**\n**Cargo:** ${cargo}\n**Porte:** ${porte}\n**Setor:** ${setor}\n**Gargalos:** ${gargalos}\n**Processos manuais:** ${processos}\n**Sistemas desconectados:** ${sistemas}\n**Tempo perdido:** ${tempo}\n**Impactos:** ${impactos}\n**Urgência:** ${urgencia}\n**Prioridade:** ${prioridade}`,
          }),
        }).catch(() => {});
      } catch {
        console.log("Webhook não enviado — continuando normalmente.");
      }
    } else {
      console.log("WEBHOOK_URL não definido — lead capturado localmente:", {
        nome: lead.nome,
        empresa: lead.empresa,
        email: lead.email,
        score: finalScore,
        tier: tierInfo.tier,
      });
    }

    // Meta Pixel — lead captured
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq(
        "track",
        "lead_captured",
        { setor, tier: tierInfo.tier, score: finalScore }
      );
    }

    // Supabase — salvar lead (fire & forget, nunca bloqueia o fluxo)
    // Se der erro de permissão, rodar no Supabase SQL Editor:
    // create policy "allow insert from client" on quiz_leads for insert with check (true);
    // create policy "allow update from client" on quiz_leads for update using (true) with check (true);
    try {
      const params = new URLSearchParams(window.location.search);
      const { data } = await supabase
        .from("quiz_leads")
        .insert({
          nome: lead.nome,
          empresa: lead.empresa,
          email: lead.email,
          whatsapp: lead.whatsapp || null,
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
          prioridade: getOptionText("prioridade", answers.prioridade?.[0]),
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
        })
        .select("id")
        .single();

      if (data?.id) {
        leadRowIdRef.current = data.id;
      }
    } catch {
      console.log("Supabase insert falhou — continuando normalmente.");
    }

    setPhase("loading");

    // Start AI stream in parallel
    startAiStream(finalScore);

    // Animated loading steps
    const steps = [0, 1, 2, 3];
    for (const step of steps) {
      setLoadingStep(step);
      await new Promise((r) => setTimeout(r, 950));
    }

    // Move to result after all steps
    await new Promise((r) => setTimeout(r, 600));
    setPhase("result");
  }

  const isCaptureFilled = lead.nome.trim() && lead.empresa.trim() && lead.email.trim();
  const tierInfo = getTier(score);

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */

  return (
    <section className="relative z-10 min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* ═══ INTRO ═══ */}
        {phase === "intro" && (
          <div className="animate-fade-slide-up text-center">
            <span className="inline-flex items-center bg-primary/[0.08] text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide">
              Diagnóstico Gratuito
            </span>

            <h1
              className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black text-text leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Sua operação está te limitando ou impulsionando?
            </h1>

            {city && (
              <p className="mt-4 text-lg text-text-muted">
                {city}. Responda 10 perguntas e descubra onde sua empresa perde
                tempo e dinheiro.
              </p>
            )}
            {!city && (
              <p className="mt-4 text-lg text-text-muted">
                Responda 10 perguntas e descubra onde sua empresa perde tempo e
                dinheiro.
              </p>
            )}

            <button
              onClick={() => {
                setPhase("quiz");
                if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).fbq) {
                  (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "quiz_start");
                }
              }}
              className="mt-8 bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
            >
              Iniciar diagnóstico gratuito
            </button>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-text-muted">
              {[
                ["2 min", "para responder"],
                ["IA", "diagnóstico real"],
                ["30 min", "nossa conversa"],
              ].map(([big, small]) => (
                <div key={big} className="flex flex-col items-center">
                  <span className="text-2xl font-black text-primary">{big}</span>
                  <span>{small}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ QUIZ ═══ */}
        {phase === "quiz" && (
          <div className="animate-fade-slide-up">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-text-muted mb-2">
                <span>{q.categoria}</span>
                <span>
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>
              <div className="w-full h-2 bg-card-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gradient rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${((currentQ + 1) / QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-black text-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              {q.pergunta}
            </h2>
            <p className="mt-2 text-text-muted">{q.sub}</p>

            {q.tipo === "multi" && (
              <p className="mt-1 text-xs text-secondary font-medium">
                Selecione uma ou mais opções
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {q.opcoes.map((opt, idx) => {
                const selected = answers[q.id]?.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      q.tipo === "single"
                        ? handleSingleSelect(idx)
                        : handleMultiToggle(idx)
                    }
                    className={`w-full text-left px-5 py-4 rounded-card border transition-all duration-200 text-sm font-medium ${
                      selected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-card-border hover:border-primary/30 hover:bg-[#F5F5F7] text-text"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-${
                          q.tipo === "multi" ? "md" : "full"
                        } border-2 flex items-center justify-center transition-all ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-card-border"
                        }`}
                      >
                        {selected && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Voltar
              </button>
              <button
                onClick={nextQuestion}
                disabled={!canAdvance()}
                className="bg-brand-gradient text-white rounded-pill px-6 py-3 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
              >
                {currentQ === QUESTIONS.length - 1 ? "Continuar →" : "Próxima →"}
              </button>
            </div>
          </div>
        )}

        {/* ═══ CAPTURE ═══ */}
        {phase === "capture" && (
          <div className="animate-fade-slide-up">
            <div className="text-center mb-8">
              <span className="inline-flex items-center bg-primary/[0.08] text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide">
                Quase lá
              </span>
              <h2
                className="mt-4 text-2xl sm:text-3xl font-black text-text"
                style={{ letterSpacing: "-0.02em" }}
              >
                Preencha seus dados para gerar o diagnóstico
              </h2>
            </div>

            <div className="bg-white border border-card-border rounded-card p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={lead.nome}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, nome: e.target.value }))
                  }
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Empresa *
                </label>
                <input
                  type="text"
                  value={lead.empresa}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, empresa: e.target.value }))
                  }
                  placeholder="Nome da empresa"
                  className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  E-mail corporativo *
                </label>
                <input
                  type="email"
                  value={lead.email}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="seu@empresa.com"
                  className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  WhatsApp{" "}
                  <span className="text-text-muted font-normal">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={lead.whatsapp}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, whatsapp: e.target.value }))
                  }
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <button
                onClick={handleSubmitLead}
                disabled={!isCaptureFilled}
                className="w-full mt-2 bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
              >
                Gerar meu diagnóstico agora →
              </button>

              <p className="text-xs text-text-muted text-center mt-3">
                Sem spam. Dados usados apenas para o diagnóstico.
              </p>
            </div>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {phase === "loading" && (
          <div className="animate-fade-slide-up text-center">
            <div className="flex flex-col items-center">
              {/* Spinner */}
              <div className="w-16 h-16 rounded-full bg-brand-gradient p-0.5 mb-8">
                <div className="w-full h-full rounded-full bg-bg flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-[3px] border-card-border border-t-secondary animate-spin" />
                </div>
              </div>

              <p className="text-lg font-bold text-text">Analisando</p>
              <p className="text-primary font-semibold">{lead.empresa}</p>
              {city && <p className="text-text-muted text-sm">{city}</p>}

              <div className="mt-8 space-y-4 text-left w-full max-w-sm">
                {[
                  "Identificando gargalos operacionais...",
                  "Calculando impacto financeiro...",
                  "Analisando perfil do setor...",
                  "Gerando diagnóstico com IA...",
                ].map((label, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {loadingStep > idx ? (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M3 7L6 10L11 4"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : loadingStep === idx ? (
                      <div className="w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-card-border flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm transition-colors ${
                        loadingStep >= idx
                          ? "text-text font-medium"
                          : "text-text-muted"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {phase === "result" && (
          <div className="animate-fade-slide-up space-y-6">
            {/* Header */}
            <div className="bg-white border border-card-border rounded-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center bg-primary/[0.08] text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide">
                  Diagnóstico Gradios
                </span>
              </div>
              <p className="text-lg font-bold text-text">{lead.empresa}</p>
              <div className="flex flex-wrap gap-x-4 text-sm text-text-muted mt-1">
                {city && <span>{city}</span>}
                <span>{lead.email}</span>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white border border-card-border rounded-card p-6 shadow-sm">
              <div className="flex items-end gap-4 mb-4">
                <span
                  className="text-6xl font-black leading-none"
                  style={{ color: tierInfo.color }}
                >
                  {animatedScore}
                </span>
                <span className="text-2xl text-text-muted font-bold mb-1">
                  /100
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-card-border rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${animatedScore}%`,
                    backgroundColor: tierInfo.color,
                  }}
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-pill"
                  style={{
                    color: tierInfo.color,
                    backgroundColor: `${tierInfo.color}15`,
                  }}
                >
                  {tierInfo.label}
                </span>
                <div className="flex gap-1 text-[10px] text-text-muted">
                  <span>Em desenvolvimento</span>
                  <span>→</span>
                  <span>Potencial alto</span>
                </div>
              </div>

              {/* Tier action indicator */}
              {tierInfo.tier === "A" && (
                <div className="rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20 px-4 py-3 text-sm text-[#16a34a] font-medium">
                  ✓ Perfil qualificado — contato em até 2 horas
                </div>
              )}
              {tierInfo.tier === "B" && (
                <div className="rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 px-4 py-3 text-sm text-[#d97706] font-medium">
                  ✓ Bom potencial — contato ainda hoje
                </div>
              )}
              {tierInfo.tier === "C" && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary font-medium">
                  → Potencial inicial — contato em 24h
                </div>
              )}
              {tierInfo.tier === "D" && (
                <div className="rounded-xl bg-text-muted/10 border border-text-muted/20 px-4 py-3 text-sm text-text-muted font-medium">
                  → Fase de mapeamento — enviaremos conteúdo
                </div>
              )}
            </div>

            {/* AI Diagnosis */}
            <div className="bg-white border border-card-border rounded-card p-6 shadow-sm">
              <p
                className="text-sm text-text leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {aiText}
                {aiText && !aiText.endsWith(".") && (
                  <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                )}
              </p>
              {!aiText && (
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  Gerando diagnóstico...
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-white border border-card-border rounded-card p-6 shadow-sm text-center">
              {tierInfo.tier === "A" && (
                <>
                  <p className="text-lg font-bold text-text mb-2">Nossa equipe entra em contato nas próximas 2 horas</p>
                  <p className="text-sm text-text-muted mb-5">
                    {lead.nome.split(" ")[0]}, seu perfil indica urgência real e alto potencial de automação. Um especialista da Gradios vai te ligar nas próximas 2 horas para mapear por onde começar — sem proposta pronta, sem enrolação.
                  </p>
                </>
              )}
              {tierInfo.tier === "B" && (
                <>
                  <p className="text-lg font-bold text-text mb-2">Nossa equipe entra em contato ainda hoje</p>
                  <p className="text-sm text-text-muted mb-5">
                    {lead.nome.split(" ")[0]}, sua operação tem gargalos claros e perfil adequado para automação. Um especialista da Gradios vai entrar em contato ainda hoje para entender melhor o seu cenário antes de propor qualquer coisa.
                  </p>
                </>
              )}
              {tierInfo.tier === "C" && (
                <>
                  <p className="text-lg font-bold text-text mb-2">Nossa equipe entra em contato nas próximas 24 horas</p>
                  <p className="text-sm text-text-muted mb-5">
                    {lead.nome.split(" ")[0]}, você está no início da jornada — e já identificamos áreas importantes para trabalhar. Um especialista entra em contato nas próximas 24 horas com material específico para o setor de {answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "sua empresa"}.
                  </p>
                </>
              )}
              {tierInfo.tier === "D" && (
                <>
                  <p className="text-lg font-bold text-text mb-2">Vamos te enviar conteúdo prático sobre automação</p>
                  <p className="text-sm text-text-muted mb-5">
                    {lead.nome.split(" ")[0]}, pelo diagnóstico, o momento ideal ainda está chegando — e quando chegar, você vai querer já ter mapeado o caminho. Vamos te enviar conteúdo sobre automação para empresas de {answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "seu setor"}.
                  </p>
                </>
              )}

              <a
                href={`https://wa.me/5543988372540?text=${encodeURIComponent(
                  tierInfo.tier === "A"
                    ? `Oi! Fiz o diagnóstico da Gradios agora mesmo. Sou ${lead.nome} da ${lead.empresa}, score ${score}/100 — Tier A. Aguardo o contato!`
                    : tierInfo.tier === "B"
                    ? `Oi! Acabei de fazer o diagnóstico da Gradios. Sou ${lead.nome} da ${lead.empresa}, score ${score}/100. Podem me ligar ainda hoje?`
                    : `Oi! Fiz o diagnóstico da Gradios. Sou ${lead.nome} da ${lead.empresa}, score ${score}/100. Quero saber mais sobre automação para ${answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "meu setor"}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-pill px-6 py-3 font-bold hover:opacity-90 transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
