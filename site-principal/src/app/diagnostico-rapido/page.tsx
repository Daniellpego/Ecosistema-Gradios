"use client";

import { useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   SUPABASE
   ════════════════════════════════════════════════════════════ */

let _sb: SupabaseClient | null = null;
function getSb() {
  if (!_sb) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    _sb = createClient(url, key);
  }
  return _sb;
}

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const QUESTIONS = [
  {
    id: "gargalo",
    pergunta: "O que mais trava sua operação hoje?",
    sub: "Escolha o que mais pesa no dia a dia.",
    opcoes: [
      "Processos manuais",
      "Sistemas desconectados",
      "Falta de dados pra decidir",
      "Retrabalho constante",
    ],
    icons: [
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      "M13 10V3L4 14h7v7l9-11h-7z",
      "M18 20V10M12 20V4M6 20v-6",
      "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    ],
  },
  {
    id: "tamanho",
    pergunta: "Quantas pessoas na sua empresa?",
    sub: "Isso nos ajuda a calibrar a solução.",
    opcoes: ["1 a 10", "11 a 50", "51 a 200", "200+"],
    icons: [
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    ],
  },
  {
    id: "urgencia",
    pergunta: "Com que urgência quer resolver isso?",
    sub: "Sem compromisso — só pra entender seu momento.",
    opcoes: [
      "Agora (próximos 30 dias)",
      "Este trimestre",
      "Estou avaliando",
      "Só curiosidade",
    ],
    icons: [
      "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    ],
  },
];

type Phase = "quiz" | "capture" | "done";

/* ════════════════════════════════════════════════════════════
   ANALYTICS
   ════════════════════════════════════════════════════════════ */

function trackEvent(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined") {
      const w = window as unknown as Record<string, unknown>;
      if (w.fbq) {
        const fbq = w.fbq as (...args: unknown[]) => void;
        if (event === "lead_captured") {
          fbq("track", "Lead", { content_name: "Mini Quiz Gradios", ...params });
        } else {
          fbq("trackCustom", event, params);
        }
      }
      if ((w as { dataLayer?: unknown[] }).dataLayer) {
        ((w as { dataLayer: unknown[] }).dataLayer).push({ event, ...params });
      }
    }
  } catch { /* silent */ }
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */

export default function DiagnosticoRapidoPage() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const whatsAppRef = useRef<HTMLInputElement>(null);

  const whatsAppDigits = whatsapp.replace(/\D/g, "");
  const isWhatsAppValid = whatsAppDigits.length >= 10 && whatsAppDigits.length <= 13;

  function handleSelect(idx: number) {
    const q = QUESTIONS[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    trackEvent("mini_quiz_answer", { question: q.id, answer: q.opcoes[idx] });

    // Auto-advance after 500ms
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((p) => p + 1);
      } else {
        setPhase("capture");
      }
    }, 500);
  }

  async function handleSubmit() {
    if (!nome.trim() || !isWhatsAppValid) {
      setShowErrors(true);
      if (!isWhatsAppValid) whatsAppRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const gargalo = QUESTIONS[0].opcoes[answers.gargalo ?? 0];
    const tamanho = QUESTIONS[1].opcoes[answers.tamanho ?? 0];
    const urgencia = QUESTIONS[2].opcoes[answers.urgencia ?? 0];

    trackEvent("lead_captured", { origem: "mini_quiz", gargalo, tamanho, urgencia });

    try {
      const sb = getSb();
      if (sb) {
        await sb.from("lead_ads").insert({
          nome,
          whatsapp,
          gargalo,
          empresa: null,
          origem: "mini_quiz",
          status: "novo",
          meta: { tamanho, urgencia },
        });
      }
    } catch { /* silent */ }

    setPhase("done");
    setIsSubmitting(false);
  }

  const progress = phase === "quiz"
    ? ((currentQ + 1) / QUESTIONS.length) * 100
    : 100;

  return (
    <section
      className="relative z-10 min-h-[100dvh] overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #080E1A 0%, #0A1628 30%, #0F1D32 100%)" }}
    >
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-20">

        {/* Progress */}
        {phase !== "done" && (
          <div className="mb-8">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#00BFFF] font-semibold bg-[#00BFFF]/10 px-2 py-0.5 rounded-full">
                {phase === "quiz" ? `${currentQ + 1} de ${QUESTIONS.length}` : "Última etapa"}
              </span>
              <span className="text-[#64748B]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2546BD] to-[#00BFFF] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ─── QUIZ PHASE ─── */}
        <AnimatePresence mode="wait">
          {phase === "quiz" && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                {QUESTIONS[currentQ].pergunta}
              </h2>
              <p className="text-[#94A3B8] text-sm mb-6">{QUESTIONS[currentQ].sub}</p>

              <div className="grid grid-cols-2 gap-3">
                {QUESTIONS[currentQ].opcoes.map((opt, idx) => {
                  const selected = answers[QUESTIONS[currentQ].id] === idx;
                  const icon = QUESTIONS[currentQ].icons[idx];
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      whileTap={{ scale: 0.96 }}
                      className={`text-left rounded-2xl p-4 transition-all duration-200 ${
                        selected
                          ? "border border-[#00BFFF] bg-[#00BFFF]/10 text-[#00BFFF] shadow-sm shadow-[#00BFFF]/10"
                          : "bg-[#0F1D32] border border-[#1E293B] hover:border-[#00BFFF]/30 hover:bg-[#131F35] text-[#CBD5E1]"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 mb-3 ${selected ? "text-[#00BFFF]" : "text-[#475569]"}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d={icon} />
                      </svg>
                      <span className="text-sm font-medium leading-snug block">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ((p) => p - 1)}
                  className="mt-6 text-sm text-[#64748B] hover:text-[#00BFFF] transition-colors"
                >
                  ← Voltar
                </button>
              )}
            </motion.div>
          )}

          {/* ─── CAPTURE PHASE ─── */}
          {phase === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Quase pronto.
                <br />
                <span className="text-[#00BFFF]">Pra quem a gente manda?</span>
              </h2>
              <p className="text-[#94A3B8] text-sm mb-6">
                A gente analisa e te chama no WhatsApp com a solução certa.
              </p>

              <div className="bg-[#131F35] border border-[#1E293B] rounded-2xl p-6 space-y-4">
                <div className="-mx-6 -mt-6 mb-4 h-1 rounded-t-2xl bg-gradient-to-r from-[#2546BD] to-[#00BFFF]" />

                <div>
                  <label className="block text-base font-medium text-[#CBD5E1] mb-2">Seu nome *</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como podemos te chamar?"
                    className={`w-full px-4 py-4 rounded-2xl border bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all ${
                      showErrors && !nome.trim() ? "border-[#EF4444]" : "border-[#1E293B]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-[#CBD5E1] mb-2">WhatsApp *</label>
                  <input
                    ref={whatsAppRef}
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(43) 98837-2540"
                    className={`w-full px-4 py-4 rounded-2xl border bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all ${
                      showErrors && (!whatsapp.trim() || !isWhatsAppValid) ? "border-[#EF4444]" : "border-[#1E293B]"
                    }`}
                  />
                  {showErrors && (!whatsapp.trim() || !isWhatsAppValid) && (
                    <p className="text-xs text-[#EF4444] mt-1.5">Informe um WhatsApp válido</p>
                  )}
                  <p className="text-xs text-[#64748B] mt-1.5">Enviamos o resultado direto no seu WhatsApp</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-full px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#00BFFF]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Receber análise no WhatsApp →"}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-[#64748B] mt-3">
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    Dados protegidos
                  </span>
                  <span>·</span>
                  <span>Sem spam</span>
                </div>
              </div>

              <button
                onClick={() => { setPhase("quiz"); setCurrentQ(QUESTIONS.length - 1); }}
                className="mt-4 text-sm text-[#64748B] hover:text-[#00BFFF] transition-colors"
              >
                ← Voltar às perguntas
              </button>
            </motion.div>
          )}

          {/* ─── DONE PHASE ─── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", damping: 20 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2546BD] to-[#00BFFF] flex items-center justify-center shadow-lg shadow-[#00BFFF]/20">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                style={{ letterSpacing: "-0.02em" }}
              >
                Recebemos, {nome.split(" ")[0]}.
              </h2>
              <p className="text-[#94A3B8] text-base mb-8 max-w-sm mx-auto">
                Analisamos seu perfil e vamos te chamar no WhatsApp com a solução certa pra sua operação.
              </p>

              <div className="bg-[#131F35] border border-[#1E293B] rounded-2xl p-5 mb-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-bold">Tempo de resposta</p>
                    <p className="text-[#10B981] text-xs font-semibold">Até 2 horas no WhatsApp</p>
                  </div>
                </div>
                <p className="text-[#64748B] text-xs">
                  Se preferir, você pode nos chamar direto:
                </p>
                <a
                  href={`https://wa.me/5543988372540?text=${encodeURIComponent(`Oi! Sou ${nome.split(" ")[0]}, fiz o diagnóstico rápido da Gradios. Meu maior gargalo é: ${QUESTIONS[0].opcoes[answers.gargalo ?? 0]}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-[#10B981] text-white rounded-full px-6 py-3 text-sm font-bold hover:opacity-90 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chamar no WhatsApp agora
                </a>
              </div>

              <a
                href="/diagnostico"
                className="text-sm text-[#00BFFF] hover:underline"
              >
                Quer o diagnóstico completo com custo em R$? Clique aqui →
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
