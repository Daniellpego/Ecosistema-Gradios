"use client";

import { useRef, useState } from "react";

interface EmailGatePhaseProps {
  initialEmail: string;
  onSubmit: (email: string) => void;
  onSkip: () => void;
}

export default function EmailGatePhase({ initialEmail, onSubmit, onSkip }: EmailGatePhaseProps) {
  const [email, setEmail] = useState(initialEmail);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setShowError(true);
      inputRef.current?.focus();
      return;
    }
    onSubmit(email.trim());
  }

  return (
    <div
      className="animate-fade-slide-up"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
    >
      <div className="text-center mb-8">
        <span className="inline-flex items-center bg-[#00BFFF]/10 text-[#00BFFF] font-semibold border border-[#00BFFF]/20 rounded-pill text-xs px-3 py-1 tracking-wide">
          Pausa rápida
        </span>
        <h2
          className="mt-4 text-2xl sm:text-3xl font-bold text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          Seu resultado já está tomando forma.
        </h2>
        <p className="mt-2 text-[#94A3B8]">
          Para qual e-mail enviamos o diagnóstico completo?
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#131F35] border border-[#1E293B] rounded-card p-6 space-y-4"
        noValidate
      >
        <div className="-mx-6 -mt-6 mb-4 h-1 rounded-t-card bg-gradient-to-r from-[#2546BD] to-[#00BFFF]" />

        <div>
          <label htmlFor="gate-email" className="block text-base font-medium text-[#CBD5E1] mb-2">
            E-mail corporativo
          </label>
          <input
            ref={inputRef}
            id="gate-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-required="true"
            aria-invalid={showError && !isValid ? true : undefined}
            aria-describedby="gate-email-hint"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (showError) setShowError(false);
            }}
            placeholder="seu@empresa.com"
            className={`w-full px-4 py-4 rounded-card border bg-[#0F1D32] text-white text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/20 focus:border-[#00BFFF] transition-all ${
              showError && !isValid ? "border-[#EF4444]" : "border-[#1E293B]"
            }`}
          />
          {showError && !isValid && (
            <p className="text-xs text-[#EF4444] mt-1.5">Informe um e-mail válido.</p>
          )}
          <p id="gate-email-hint" className="text-xs text-[#64748B] mt-1.5">
            Faltam só 5 perguntas. Seu diagnóstico cai nessa caixa assim que terminar.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-pill px-8 py-4 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#00BFFF]/25 transition-all duration-300"
        >
          Continuar para as últimas perguntas →
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="block mx-auto py-2 px-3 text-xs font-medium text-[#64748B] hover:text-[#00BFFF] transition-colors"
        >
          Prefiro não informar agora
        </button>
      </form>
    </div>
  );
}
