"use client";

interface LoadingPhaseProps {
  empresa: string;
  city: string;
  loadingStep: number;
}

const STEPS = [
  { label: "Mapeando gargalos operacionais", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "Calculando custo invisível do retrabalho", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
  { label: "Cruzando dados com empresas do setor", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
  { label: "Consultando base de soluções aplicáveis", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 2h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V3L8 2z" },
  { label: "Gerando diagnóstico personalizado com IA", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

export default function LoadingPhase({ empresa, city, loadingStep }: LoadingPhaseProps) {
  return (
    <div className="animate-fade-slide-up">
      <div className="loading-container">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20 animate-pulse" style={{ background: "radial-gradient(circle, #00BFFF, transparent 70%)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated scanner ring */}
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 rounded-full border-2 border-[#1E293B]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00BFFF] animate-spin" style={{ animationDuration: "1.5s" }} />
            <div className="absolute inset-2 rounded-full border border-[#1E293B]" />
            <div className="absolute inset-2 rounded-full border border-transparent border-b-[#0A1B5C] animate-spin" style={{ animationDuration: "2.5s", animationDirection: "reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#00BFFF] animate-pulse" style={{ boxShadow: "0 0 20px #00BFFF60" }} />
            </div>
          </div>

          <p className="text-white text-xl sm:text-2xl font-black mb-1" style={{ letterSpacing: "-0.02em" }}>
            Analisando {empresa}
          </p>
          {city && <p className="text-[#64748B] text-sm mb-8">{city}</p>}
          {!city && <div className="mb-8" />}

          {/* Steps */}
          <div className="space-y-3 w-full max-w-sm text-left">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                  loadingStep > idx
                    ? "bg-[#10B981]/10 border border-[#10B981]/20"
                    : loadingStep === idx
                    ? "bg-[#00BFFF]/10 border border-[#00BFFF]/20"
                    : "bg-[#0F172A]/50 border border-[#1E293B]"
                }`}
              >
                {loadingStep > idx ? (
                  <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : loadingStep === idx ? (
                  <div className="w-7 h-7 rounded-full border-2 border-[#00BFFF] border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full border border-[#1E293B] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={step.icon} />
                    </svg>
                  </div>
                )}
                <span className={`text-sm transition-all duration-300 ${
                  loadingStep > idx ? "text-[#10B981] font-medium" :
                  loadingStep === idx ? "text-white font-medium" :
                  "text-[#475569]"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
