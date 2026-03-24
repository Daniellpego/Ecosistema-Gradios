"use client";

import { useEffect, useState } from "react";
import {
  QUESTIONS,
  calculateROI,
  formatBRL,
  getTier,
  isAnalista,
  type LeadData,
} from "../_lib/data";

interface ResultPhaseProps {
  lead: LeadData;
  answers: Record<string, number[]>;
  score: number;
  city: string;
  aiText: string;
}

export default function ResultPhase({ lead, answers, score, city, aiText }: ResultPhaseProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const tierInfo = getTier(score);

  // Animated score counter
  useEffect(() => {
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
  }, [score]);

  const setor = answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : "Não informado";
  const gargalosTexts = answers.gargalos?.map((i) => QUESTIONS[3].opcoes[i]) || [];
  const impactosTexts = answers.impactos?.map((i) => QUESTIONS[7].opcoes[i]) || [];
  const horasMes = answers.tempo?.[0] != null ? ["~20h", "~40-60h", "~65-160h", "+160h"][answers.tempo[0]] : null;
  const sistemasLabel = answers.sistemas?.[0] != null ? QUESTIONS[5].opcoes[answers.sistemas[0]] : null;
  const processosLabel = answers.processos?.[0] != null ? QUESTIONS[4].opcoes[answers.processos[0]] : null;
  const prioridadeLabel = answers.prioridade?.[0] != null ? QUESTIONS[9].opcoes[answers.prioridade[0]] : null;
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (circumference * animatedScore) / 100;
  const roi = calculateROI(answers);

  // Parse AI text into visual blocks
  const aiBlocks = aiText.split("\n\n").filter((b) => b.trim());

  function trackCta(cta: string) {
    try {
      if (typeof window !== "undefined" && (window as unknown as { dataLayer?: unknown[] }).dataLayer) {
        (window as unknown as { dataLayer: unknown[] }).dataLayer.push({ event: "cta_clicked", cta, tier: tierInfo.tier, score });
      }
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).fbq) {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "cta_clicked", { cta, tier: tierInfo.tier });
      }
    } catch { /* silent */ }
  }

  function handlePrint() {
    trackCta("save_pdf");
    window.print();
  }

  function handleShare() {
    trackCta("share");
    if (navigator.share) {
      navigator.share({
        title: `Diagnóstico ${lead.empresa} | Gradios`,
        text: `Fiz o diagnóstico de automação da Gradios e tirei ${score}/100. Descubra o seu:`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  const cargoLabel = answers.cargo?.[0] != null ? QUESTIONS[0].opcoes[answers.cargo[0]] : "profissional";
  const tamanhoLabel = answers.tamanho?.[0] != null ? QUESTIONS[1].opcoes[answers.tamanho[0]] : "vários";
  const gargaloPrincipal = gargalosTexts.length > 0 ? gargalosTexts[0].split(" — ")[0] : null;
  const horasSemana = answers.tempo?.[0] != null ? ["~3h", "~10h", "~28h", "50+"][answers.tempo[0]] : null;
  const whatsAppMsg = encodeURIComponent(
    `Oi! Acabei de fazer o diagnóstico da Gradios. Sou ${cargoLabel} de uma empresa de ${setor} com ${tamanhoLabel} funcionários.${gargaloPrincipal ? ` Nosso maior gargalo é ${gargaloPrincipal.toLowerCase()}` : ""}${horasSemana ? ` e perdemos cerca de ${horasSemana} horas por semana com retrabalho manual` : ""}. Recebi resultado ${tierInfo.tier} e quero entender como resolver isso.`
  );

  return (
    <div className="result-container print-area">
      {/* ── HERO ── */}
      <div className="result-hero animate-fade-slide-up" style={{ animationDelay: "0s" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${tierInfo.color}, transparent 70%)` }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #00BFFF, transparent 70%)" }} />
        </div>

        <div className="relative z-10">
          <p className="text-[#00BFFF] text-xs font-semibold tracking-[0.2em] uppercase mb-6">Diagnóstico Gradios</p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2" style={{ letterSpacing: "-0.03em" }}>
            {lead.nome.split(" ")[0]}, seu diagnóstico<br />está pronto.
          </h1>
          <p className="text-[#94A3B8] text-sm sm:text-base">
            {lead.empresa}{city ? ` · ${city}` : ""} · {setor}
          </p>

          {/* Circular Score Gauge */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1E293B" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={tierInfo.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="gauge-ring"
                  style={{ filter: `drop-shadow(0 0 8px ${tierInfo.color}60)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white leading-none">{animatedScore}</span>
                <span className="text-xs text-[#64748B] font-medium">/100</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <span
                className="inline-block text-sm font-bold px-4 py-1.5 rounded-pill mb-3"
                style={{ color: tierInfo.color, backgroundColor: `${tierInfo.color}20`, border: `1px solid ${tierInfo.color}40` }}
              >
                {tierInfo.label}
              </span>
              <p className="text-[#CBD5E1] text-sm max-w-xs">
                {tierInfo.tier === "A" && "Sua operação tem alto potencial de automação. Os gargalos são claros e o retorno é rápido."}
                {tierInfo.tier === "B" && "Identificamos gargalos concretos. Com as automações certas, o ganho operacional é significativo."}
                {tierInfo.tier === "C" && "Existem oportunidades iniciais de automação que já trariam resultado no curto prazo."}
                {tierInfo.tier === "D" && "O momento é de mapeamento. Quando decidir automatizar, o caminho já vai estar claro."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── HOURS + ROI HIGHLIGHT (two metric cards side by side) ── */}
      {answers.tempo?.[0] != null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.12s" }}>
          {/* Hours lost per week */}
          <div className="bg-[#0F172A] border border-[#EF4444]/20 rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-5xl sm:text-6xl font-black text-white leading-none mb-2">
              {["~3h", "~10h", "~28h", "50h+"][answers.tempo[0]]}
            </p>
            <p className="text-[#EF4444] text-xs font-semibold tracking-wider uppercase">
              perdidas por semana
            </p>
          </div>

          {/* Monthly cost */}
          {roi && (
            <div className="bg-[#0F172A] border border-[#EF4444]/20 rounded-2xl p-5 sm:p-6 text-center">
              <p className="text-4xl sm:text-5xl font-black text-white leading-none mb-2">
                {formatBRL(roi.monthlyCost)}
              </p>
              <p className="text-[#EF4444] text-xs font-semibold tracking-wider uppercase">
                custo mínimo estimado/mês
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── ROI DETAIL (annual projection) ── */}
      {roi && (
        <div className="roi-card opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.18s" }}>
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #EF4444, transparent 70%)" }} />
          </div>
          <div className="relative z-10">
            <p className="text-[#FCA5A5] text-[10px] font-semibold tracking-wider uppercase mb-1">Estimativa conservadora de retrabalho</p>
            <p className="text-[#94A3B8] text-sm mb-4">
              {roi.monthlyHours}h/mês × {formatBRL(roi.hourlyCost)}/hora (média {setor}) × fator conservador
            </p>
            <div className="flex items-center gap-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-[#FCA5A5] text-sm font-medium">
                Sendo conservador, no mínimo <span className="text-white font-black">{formatBRL(roi.annualCost)}</span>/ano em economia
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── DATA CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.28s" }}>
        {horasMes && (
          <div className="result-data-card col-span-2 sm:col-span-1">
            <p className="text-[#64748B] text-[10px] font-semibold tracking-wider uppercase">Retrabalho/mês</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{horasMes}</p>
            <p className="text-[#EF4444] text-xs font-medium mt-1">desperdiçadas</p>
          </div>
        )}
        {sistemasLabel && (
          <div className="result-data-card">
            <p className="text-[#64748B] text-[10px] font-semibold tracking-wider uppercase">Sistemas</p>
            <p className="text-lg font-bold text-white mt-1">{sistemasLabel}</p>
            <p className="text-[#F59E0B] text-xs font-medium mt-1">desconectados</p>
          </div>
        )}
        {processosLabel && (
          <div className="result-data-card">
            <p className="text-[#64748B] text-[10px] font-semibold tracking-wider uppercase">Processos manuais</p>
            <p className="text-lg font-bold text-white mt-1">{processosLabel}</p>
            <p className="text-[#F59E0B] text-xs font-medium mt-1">dependem de digitação</p>
          </div>
        )}
      </div>

      {/* ── BOTTLENECKS ── */}
      {gargalosTexts.length > 0 && (
        <div className="result-section opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.35s" }}>
          <p className="text-[#64748B] text-[10px] font-semibold tracking-wider uppercase mb-3">Gargalos identificados</p>
          <div className="flex flex-wrap gap-2">
            {gargalosTexts.map((g, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#7DD3FC] text-xs font-medium px-3 py-1.5 rounded-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]" />
                {g.split(" — ")[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── IMPACTS ── */}
      {impactosTexts.length > 0 && (
        <div className="result-section opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-[#64748B] text-[10px] font-semibold tracking-wider uppercase mb-3">Impactos na operação</p>
          <div className="flex flex-wrap gap-2">
            {impactosTexts.map((imp, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-[#00BFFF]/8 border border-[#00BFFF]/15 text-[#7DD3FC] text-xs font-medium px-3 py-1.5 rounded-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]/60" />
                {imp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── AI DIAGNOSIS (split into visual blocks) ── */}
      <div className="result-section opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A1B5C] to-[#00BFFF] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold">Análise da Gradios</p>
            <p className="text-[#64748B] text-[10px]">Gerado por IA com dados reais da sua operação</p>
          </div>
        </div>

        {aiText ? (
          <div className="space-y-3">
            {aiBlocks.length > 1 ? (
              aiBlocks.map((block, i) => {
                const isClosing = i === aiBlocks.length - 1;
                const isDiagnostic = i === 1;

                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 sm:p-5 ${
                      isDiagnostic
                        ? "bg-[#0F172A] border border-[#EF4444]/15"
                        : isClosing
                        ? "bg-[#00BFFF]/5 border border-[#00BFFF]/15"
                        : "bg-[#0F172A] border border-[#1E293B]"
                    }`}
                  >
                    {isDiagnostic && (
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-[#EF4444]/60 mb-2">Diagnóstico</p>
                    )}
                    {isClosing && (
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-[#00BFFF]/60 mb-2">Próximo passo</p>
                    )}
                    {i === 2 && aiBlocks.length >= 4 && (
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-[#64748B] mb-2">Contexto do setor</p>
                    )}
                    {i === 3 && aiBlocks.length >= 5 && (
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-[#00BFFF]/60 mb-2">O que a Gradios faria</p>
                    )}
                    <p className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed">{block}</p>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 sm:p-6">
                <p className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                  {aiText}
                  {!aiText.endsWith(".") && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle" style={{ background: "linear-gradient(to bottom, #00BFFF, #0A1B5C)" }} />
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5">
            <div className="flex items-center gap-3 text-[#64748B] text-sm">
              <div className="w-4 h-4 border-2 border-[#00BFFF] border-t-transparent rounded-full animate-spin" />
              Gerando diagnóstico personalizado...
            </div>
          </div>
        )}
      </div>

      {/* ── PRIORITY ── */}
      {prioridadeLabel && (
        <div className="result-section opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.6s" }}>
          <p className="text-[#64748B] text-[10px] font-semibold tracking-wider uppercase mb-3">Sua prioridade</p>
          <div className="bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00BFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-bold">{prioridadeLabel}</p>
              <p className="text-[#64748B] text-xs">É por aqui que a Gradios começaria</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALISTA ROUTING (Champion) ── */}
      {isAnalista(answers) && (
        <div className="result-section opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.65s" }}>
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-2xl p-5">
            <p className="text-[#FCD34D] text-sm font-bold mb-2">
              Para implementar, você vai precisar do aval da diretoria.
            </p>
            <p className="text-[#CBD5E1] text-sm">
              A gente monta um resumo executivo com ROI e diagnóstico formatado pra decisor — pronto pra você apresentar.
            </p>
            <a
              href={`https://wa.me/5543988372540?text=${encodeURIComponent(
                `Oi! Sou ${lead.nome} da ${lead.empresa}. Fiz o diagnóstico e preciso de material executivo para apresentar à diretoria.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 bg-[#F59E0B]/20 text-[#FCD34D] rounded-pill px-5 py-2.5 font-semibold text-sm hover:bg-[#F59E0B]/30 transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Quero material para o gestor
            </a>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="result-cta opacity-0 animate-fade-slide-up" style={{ animationDelay: "0.75s" }}>
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #00BFFF, transparent 70%)" }} />
        </div>

        <div className="relative z-10 text-center">
          <p className="text-white text-xl sm:text-2xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
            {tierInfo.tier === "A" ? "Respondemos em até 2 horas." :
             tierInfo.tier === "B" ? "Vamos conversar sobre isso?" :
             tierInfo.tier === "C" ? "Quer entender por onde começar?" :
             "Tem dúvida? A gente explica sem compromisso."}
          </p>
          <p className="text-[#94A3B8] text-sm max-w-md mx-auto mb-6">
            {tierInfo.tier === "A"
              ? `${lead.nome.split(" ")[0]}, seu cenário tem urgência real. Manda uma mensagem e um especialista da Gradios te responde hoje.`
              : tierInfo.tier === "B"
              ? `${lead.nome.split(" ")[0]}, os gargalos são claros. Uma conversa rápida de 15 minutos mostra exatamente o que dá pra resolver primeiro.`
              : tierInfo.tier === "C"
              ? `${lead.nome.split(" ")[0]}, identificamos por onde começar. Se quiser entender melhor, é só chamar. Sem compromisso nenhum.`
              : `${lead.nome.split(" ")[0]}, mesmo com perfil inicial, já tem coisa que dá pra resolver. Manda um oi quando quiser.`
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/5543988372540?text=${whatsAppMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("whatsapp")}
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white rounded-pill px-7 py-3.5 font-bold hover:bg-[#20BD5A] hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar com a Gradios
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white border border-[#1E293B] hover:border-[#334155] rounded-pill px-6 py-3.5 font-medium transition-all duration-300 text-sm print:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Salvar PDF
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white border border-[#1E293B] hover:border-[#334155] rounded-pill px-6 py-3.5 font-medium transition-all duration-300 text-sm print:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Compartilhar
            </button>
          </div>

          <p className="text-[#475569] text-xs mt-6 print:hidden">
            Diagnóstico gerado em {new Date().toLocaleDateString("pt-BR")} · Dados protegidos · Gradios © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
