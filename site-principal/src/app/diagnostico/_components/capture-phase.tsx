"use client";

import { calculatePartialScore, QUESTIONS, type LeadData } from "../_lib/data";

interface CapturePhaseProps {
  lead: LeadData;
  setLead: (fn: (prev: LeadData) => LeadData) => void;
  answers: Record<string, number[]>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function CapturePhase({ lead, setLead, answers, isSubmitting, onSubmit }: CapturePhaseProps) {
  const isFilled = lead.nome.trim() && lead.empresa.trim() && lead.email.trim();
  const partialScore = calculatePartialScore(answers);
  const gargalosCount = answers.gargalos?.length ?? 0;
  const setor = answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : null;

  return (
    <div className="animate-fade-slide-up">
      <div className="text-center mb-8">
        <span className="inline-flex items-center bg-[#00BFFF]/10 text-[#00BFFF] font-semibold border border-[#00BFFF]/20 rounded-pill text-sm px-4 py-1.5 tracking-wide">
          Última etapa
        </span>
        <h2
          className="mt-4 text-2xl sm:text-3xl font-bold text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          Seu resultado está pronto.
          <br />
          <span className="text-[#00BFFF]">Para quem a gente envia?</span>
        </h2>
        <p className="mt-2 text-[#94A3B8] text-sm">
          Preencha abaixo e receba a análise completa com custo em reais.
        </p>
      </div>

      {/* Preview teaser */}
      <div className="bg-[#00BFFF]/[0.04] border border-[#00BFFF]/10 rounded-card p-4 mb-6 space-y-3">
        <p className="text-[10px] font-semibold text-[#00BFFF] tracking-wider uppercase">Prévia do seu diagnóstico</p>
        <div className="flex items-center gap-4">
          {/* Mini gauge */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#1E293B" strokeWidth="5" />
              <circle
                cx="30" cy="30" r="25" fill="none"
                stroke="#00BFFF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 25}
                strokeDashoffset={2 * Math.PI * 25 - (2 * Math.PI * 25 * partialScore) / 100}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{partialScore}</span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-bold">
              {gargalosCount} gargalos identificados
              {setor ? ` · ${setor}` : ""}
            </p>
            <p className="text-[#64748B] text-xs">
              Score parcial: {partialScore}/100 · O diagnóstico completo calcula seu custo mensal em reais.
            </p>
          </div>
        </div>

        {/* What they'll get */}
        <div className="flex flex-wrap gap-2">
          {[
            "Custo do retrabalho em R$",
            "Análise por IA",
            "Gargalos priorizados",
            "Plano de ação",
          ].map((item) => (
            <span key={item} className="inline-flex items-center gap-1 bg-[#0F1D32] border border-[#1E293B] text-[#CBD5E1] text-[11px] font-medium px-2.5 py-1 rounded-pill">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Form — dark glass card */}
      <div className="bg-[#131F35] border border-[#1E293B] rounded-card p-6 space-y-4">
        <div className="-mx-6 -mt-6 mb-4 h-1 rounded-t-card bg-gradient-to-r from-[#2546BD] to-[#00BFFF]" />

        <div>
          <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">Nome completo *</label>
          <input
            type="text"
            value={lead.nome}
            onChange={(e) => setLead((p) => ({ ...p, nome: e.target.value }))}
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-sm placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">Empresa *</label>
          <input
            type="text"
            value={lead.empresa}
            onChange={(e) => setLead((p) => ({ ...p, empresa: e.target.value }))}
            placeholder="Nome da empresa"
            className="w-full px-4 py-3 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-sm placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">E-mail corporativo *</label>
          <input
            type="email"
            value={lead.email}
            onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
            placeholder="seu@empresa.com"
            className="w-full px-4 py-3 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-sm placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
          <p className="text-[10px] text-[#475569] mt-1">Só para enviar seu diagnóstico e dicas relevantes. Pode cancelar a qualquer momento.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
            Telefone para agendamento <span className="text-[#64748B] font-normal">(opcional)</span>
          </label>
          <input
            type="tel"
            value={lead.whatsapp}
            onChange={(e) => setLead((p) => ({ ...p, whatsapp: e.target.value }))}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-3 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-sm placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!isFilled || isSubmitting}
          className="w-full mt-2 bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-pill px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#00BFFF]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Gerando..." : "Ver meu resultado agora →"}
        </button>

        <div className="flex items-center justify-center gap-4 text-[10px] text-[#475569] mt-3">
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            Dados protegidos
          </span>
          <span>·</span>
          <span>Sem spam</span>
          <span>·</span>
          <span>Resultado instantâneo</span>
        </div>
      </div>
    </div>
  );
}
