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
        <span className="inline-flex items-center bg-primary/[0.08] text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide">
          Última etapa
        </span>
        <h2
          className="mt-4 text-2xl sm:text-3xl font-black text-text"
          style={{ letterSpacing: "-0.02em" }}
        >
          Seu diagnóstico está pronto.
          <br />
          <span className="text-secondary">Só falta você.</span>
        </h2>
        <p className="mt-2 text-text-muted text-sm">
          Preencha seus dados para gerar o diagnóstico completo com IA.
        </p>
      </div>

      {/* Preview teaser */}
      <div className="bg-primary/[0.04] border border-primary/10 rounded-card p-4 mb-6 space-y-3">
        <p className="text-[10px] font-semibold text-primary tracking-wider uppercase">Prévia do seu diagnóstico</p>
        <div className="flex items-center gap-4">
          {/* Mini gauge */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#E2E8F0" strokeWidth="5" />
              <circle
                cx="30" cy="30" r="25" fill="none"
                stroke="#0A1B5C"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 25}
                strokeDashoffset={2 * Math.PI * 25 - (2 * Math.PI * 25 * partialScore) / 100}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-text">{partialScore}</span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-text text-sm font-bold">
              {gargalosCount} gargalos identificados
              {setor ? ` · ${setor}` : ""}
            </p>
            <p className="text-text-muted text-xs">
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
            <span key={item} className="inline-flex items-center gap-1 bg-white border border-card-border text-text text-[11px] font-medium px-2.5 py-1 rounded-pill">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-card-border rounded-card p-6 shadow-sm space-y-4">
        <div className="-mx-6 -mt-6 mb-4 h-1 rounded-t-card bg-gradient-primary" />

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nome completo *</label>
          <input
            type="text"
            value={lead.nome}
            onChange={(e) => setLead((p) => ({ ...p, nome: e.target.value }))}
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 rounded-card border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Empresa *</label>
          <input
            type="text"
            value={lead.empresa}
            onChange={(e) => setLead((p) => ({ ...p, empresa: e.target.value }))}
            placeholder="Nome da empresa"
            className="w-full px-4 py-3 rounded-card border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">E-mail corporativo *</label>
          <input
            type="email"
            value={lead.email}
            onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
            placeholder="seu@empresa.com"
            className="w-full px-4 py-3 rounded-card border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            WhatsApp <span className="text-text-muted font-normal">(opcional, para contato mais rápido)</span>
          </label>
          <input
            type="tel"
            value={lead.whatsapp}
            onChange={(e) => setLead((p) => ({ ...p, whatsapp: e.target.value }))}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-3 rounded-card border border-card-border bg-white text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!isFilled || isSubmitting}
          className="w-full mt-2 bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
        >
          {isSubmitting ? "Gerando..." : "Gerar meu diagnóstico completo →"}
        </button>

        <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted mt-3">
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
