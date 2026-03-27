"use client";

import { useState, useRef } from "react";
import { QUESTIONS, type LeadData } from "../_lib/data";

interface CapturePhaseProps {
  lead: LeadData;
  setLead: (fn: (prev: LeadData) => LeadData) => void;
  answers: Record<string, number[]>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function CapturePhase({ lead, setLead, answers, isSubmitting, onSubmit }: CapturePhaseProps) {
  const whatsAppDigits = lead.whatsapp.replace(/\D/g, "");
  const isWhatsAppValid = !lead.whatsapp.trim() || (whatsAppDigits.length >= 10 && whatsAppDigits.length <= 13);
  const isFilled = lead.nome.trim() && lead.empresa.trim() && lead.email.trim() && lead.whatsapp.trim() && whatsAppDigits.length >= 10 && whatsAppDigits.length <= 13;
  const [showErrors, setShowErrors] = useState(false);
  const whatsAppRef = useRef<HTMLInputElement>(null);
  const gargalosCount = answers.gargalos?.length ?? 0;
  const setor = answers.setor?.[0] != null ? QUESTIONS[2].opcoes[answers.setor[0]] : null;

  return (
    <div className="animate-fade-slide-up overflow-y-auto pb-32">
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
          O método Gradios vai cruzar seus dados em tempo real e entregar o diagnóstico completo com custo em R$, gargalos priorizados e plano de ação.
        </p>
      </div>

      {/* Preview teaser */}
      <div className="bg-[#00BFFF]/[0.04] border border-[#00BFFF]/10 rounded-card p-4 mb-6 space-y-3">
        <p className="text-[11px] font-semibold text-[#00BFFF] tracking-wider uppercase">Prévia do seu diagnóstico</p>
        <div className="flex items-center gap-4">
          {/* Icon instead of gauge */}
          <div className="relative w-14 h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#2546BD] to-[#00BFFF] flex items-center justify-center shadow-lg shadow-[#00BFFF]/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-bold">
              {gargalosCount} gargalos identificados · {setor || "Diagnóstico quase pronto"}
            </p>
            <p className="text-[#64748B] text-xs">
              O resultado completo inclui score, custo em R$ e plano de ação personalizado.
            </p>
          </div>
        </div>

        {/* What they'll get */}
        <div className="flex flex-wrap gap-2">
          {[
            "Custo do retrabalho em R$",
            "Análise Gradios",
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
          <label className="block text-base font-medium text-[#CBD5E1] mb-2">Nome completo *</label>
          <input
            type="text"
            value={lead.nome}
            onChange={(e) => setLead((p) => ({ ...p, nome: e.target.value }))}
            placeholder="Seu nome completo"
            className="w-full px-4 py-4 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-[#CBD5E1] mb-2">Empresa *</label>
          <input
            type="text"
            value={lead.empresa}
            onChange={(e) => setLead((p) => ({ ...p, empresa: e.target.value }))}
            placeholder="Nome da empresa"
            className="w-full px-4 py-4 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-[#CBD5E1] mb-2">E-mail corporativo *</label>
          <input
            type="email"
            value={lead.email}
            onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
            placeholder="seu@empresa.com"
            className="w-full px-4 py-4 rounded-card border border-[#1E293B] bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all"
          />
          <p className="text-xs text-[#64748B] mt-1.5">Só para enviar seu diagnóstico e dicas relevantes. Pode cancelar a qualquer momento.</p>
        </div>

        <div>
          <label className="block text-base font-medium text-[#CBD5E1] mb-2">WhatsApp *</label>
          <input
            ref={whatsAppRef}
            type="tel"
            value={lead.whatsapp}
            onChange={(e) => setLead((p) => ({ ...p, whatsapp: e.target.value }))}
            placeholder="(43) 98837-2540"
            className={`w-full px-4 py-4 rounded-card border bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all ${
              showErrors && !lead.whatsapp.trim() ? "border-[#EF4444]" : "border-[#1E293B]"
            }`}
          />
          {lead.whatsapp && !isWhatsAppValid && (
            <p className="text-xs text-[#EF4444] mt-1.5">Informe um WhatsApp válido (ex: 43 99999-9999)</p>
          )}
          <p className="text-xs text-[#64748B] mt-1.5">Para recebermos seu diagnóstico mais rápido e você poder tirar dúvidas direto com a equipe.</p>
        </div>

        <button
          onClick={() => {
            console.log("[Gradios Quiz] Submit clicked", {
              nome: !!lead.nome.trim(),
              empresa: !!lead.empresa.trim(),
              email: !!lead.email.trim(),
              whatsapp: lead.whatsapp,
              whatsappDigits: whatsAppDigits.length,
              isFilled,
            });
            if (!isFilled) {
              setShowErrors(true);
              if (!lead.whatsapp.trim() || whatsAppDigits.length < 10) {
                whatsAppRef.current?.focus();
              }
              return;
            }
            onSubmit();
          }}
          disabled={isSubmitting}
          className={`w-full mt-2 text-white rounded-pill px-8 py-4 font-bold transition-all duration-300 ${
            isFilled
              ? "bg-gradient-to-r from-[#2546BD] to-[#00BFFF] hover:opacity-90 hover:shadow-lg hover:shadow-[#00BFFF]/25"
              : "bg-gradient-to-r from-[#2546BD] to-[#00BFFF] opacity-70"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? "Gerando..." : "Ver meu resultado agora →"}
        </button>

        {showErrors && !isFilled && (
          <p className="text-xs text-[#F59E0B] mt-2 text-center animate-fade-slide-up">
            {!lead.nome.trim() ? "Preencha seu nome" :
             !lead.empresa.trim() ? "Preencha o nome da empresa" :
             !lead.email.trim() ? "Preencha seu e-mail" :
             !lead.whatsapp.trim() ? "Preencha seu WhatsApp para receber o diagnóstico" :
             "Informe um WhatsApp válido (ex: 43 99999-9999)"}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#64748B] mt-4">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            Dados protegidos
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Sem spam</span>
          <span className="hidden sm:inline">·</span>
          <span>Resultado instantâneo</span>
        </div>
      </div>
    </div>
  );
}
