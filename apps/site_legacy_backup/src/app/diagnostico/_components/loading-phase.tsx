"use client";

import { motion } from "framer-motion";

interface LoadingPhaseProps {
  empresa: string;
  city: string;
  loadingStep: number;
  gargalosCount: number;
  horasMes: string;
  setor: string;
}

export default function LoadingPhase({ empresa, city, loadingStep, gargalosCount, horasMes, setor }: LoadingPhaseProps) {
  const STEPS = [
    { label: `Mapeando ${gargalosCount} gargalos identificados`, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: `Calculando custo de ${horasMes}/mês em retrabalho`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
    { label: `Comparando com empresas de ${setor}`, icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
    { label: "Consultando base de soluções aplicáveis", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 2h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V3L8 2z" },
    { label: "Gerando plano de ação personalizado", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  ];
  return (
    <div className="animate-fade-slide-up">
      <div className="loading-container">
        {/* Background effects — brighter, more vibrant */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {/* Primary cyan glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-30 animate-pulse" style={{ background: "radial-gradient(circle, #00BFFF, transparent 65%)", animationDuration: "3s" }} />
          {/* Secondary blue glow */}
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20 animate-pulse" style={{ background: "radial-gradient(circle, #2546BD, transparent 70%)", animationDuration: "4s", animationDelay: "1s" }} />
          {/* Floating particles */}
          <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-[#00BFFF]/40 animate-pulse" style={{ animationDuration: "2s" }} />
          <div className="absolute top-[70%] right-[20%] w-1.5 h-1.5 rounded-full bg-[#2546BD]/30 animate-pulse" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
          <div className="absolute top-[40%] right-[10%] w-2.5 h-2.5 rounded-full bg-[#00BFFF]/25 animate-pulse" style={{ animationDuration: "2.5s", animationDelay: "1.5s" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated scanner ring — brighter colors */}
          <div className="w-24 h-24 mb-8 relative">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[#2546BD]/40" />
            <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#00BFFF] animate-spin" style={{ animationDuration: "1.2s", boxShadow: "0 0 15px #00BFFF40" }} />
            {/* Inner ring */}
            <div className="absolute inset-2 rounded-full border-2 border-[#2546BD]/30" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#2546BD] animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
            {/* Center pulse — much brighter glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#00BFFF] animate-pulse" style={{ boxShadow: "0 0 30px #00BFFF, 0 0 60px #00BFFF40", animationDuration: "1.5s" }} />
            </div>
          </div>

          <p className="text-white text-xl sm:text-2xl font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
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
                    ? "bg-[#10B981]/15 border border-[#10B981]/30 shadow-sm shadow-[#10B981]/10"
                    : loadingStep === idx
                    ? "bg-[#00BFFF]/15 border border-[#00BFFF]/40 shadow-md shadow-[#00BFFF]/20"
                    : "bg-[#131F35]/80 border border-[#2546BD]/20"
                }`}
              >
                {loadingStep > idx ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                ) : loadingStep === idx ? (
                  <div className="w-7 h-7 rounded-full border-2 border-[#00BFFF] border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full border border-[#2546BD]/30 bg-[#2546BD]/5 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
