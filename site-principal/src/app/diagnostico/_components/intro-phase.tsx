"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface IntroPhaseProps {
  onStart: () => void;
}

/* ═══════════════════════════════════════════════════════════
   TYPEWRITER HOOK
   ═══════════════════════════════════════════════════════════ */

function useTypewriter(text: string, speed = 35, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(delayTimer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED GRID DOTS (subtle neural network feel)
   ═══════════════════════════════════════════════════════════ */

function NeuralGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 191, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 191, 255, 1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow center */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #00BFFF, transparent 70%)" }}
      />
      {/* Secondary glow bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] opacity-[0.05]"
        style={{ background: "radial-gradient(ellipse, #2546BD, transparent 70%)" }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTRO PHASE — Dark Mode + Typewriter + Neural Immersion
   ═══════════════════════════════════════════════════════════ */

export default function IntroPhase({ onStart }: IntroPhaseProps) {
  const headline = "Empresas do seu porte perdem R$ 8 mil a R$ 47 mil por mês em retrabalho. Quanto a sua perde?";
  const { displayed, done } = useTypewriter(headline, 30, 800);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-[70vh] flex flex-col items-center justify-center">
      <NeuralGrid />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        {/* AI avatar + status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2546BD] to-[#00BFFF] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#080E1A] animate-status-pulse" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Diagnóstico Gradios</p>
            <p className="text-[#64748B] text-xs">Pronto para começar</p>
          </div>
        </motion.div>

        {/* Typewriter headline */}
        <div className="min-h-[120px] sm:min-h-[140px] flex items-center justify-center">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            {displayed}
            {!done && (
              <span
                className="inline-block w-0.5 h-8 sm:h-10 ml-1 align-middle"
                style={{
                  background: "linear-gradient(to bottom, #00BFFF, #2546BD)",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              />
            )}
          </h1>
        </div>

        {/* Content — visível imediatamente, sem depender do typewriter */}
        <AnimatePresence>
          {true && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="mt-6"
            >
              {/* Subheadline */}
              <p className="text-[#94A3B8] text-base sm:text-lg mb-4">
                10 perguntas. 2 minutos. Um diagnóstico real com custo em reais.
              </p>

              {/* Prévia do resultado */}
              <div className="bg-[#131F35] border border-[#1E293B] rounded-xl p-4 mb-8 text-left max-w-sm mx-auto">
                <p className="text-[10px] font-semibold text-[#00BFFF] tracking-wider uppercase mb-3">Você vai receber</p>
                <div className="space-y-2.5">
                  {[
                    "Quais processos estão drenando mais tempo e dinheiro",
                    "O custo mensal exato do retrabalho na sua operação",
                    "Por onde começar a automatizar (plano gerado por IA)",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0">
                        <path d="M3 7L6 10L11 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[#CBD5E1] text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-pill px-8 py-4 font-bold text-lg shadow-lg shadow-[#2546BD]/30 hover:shadow-xl hover:shadow-[#00BFFF]/20 transition-shadow duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Descobrir meu custo em 2 minutos</span>
                <div className="absolute inset-0 bg-white/10 -translate-x-full skew-x-12 hover:translate-x-[200%] transition-transform duration-700" />
              </motion.button>

              {/* Trust metrics */}
              <div className="mt-10 flex items-center justify-center gap-8 sm:gap-12">
                {[
                  { value: "2 min", label: "do seu tempo" },
                  { value: "IA", label: "análise real" },
                  { value: "R$", label: "valor na ponta do lápis" },
                ].map((item, i) => (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * i, duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-2xl font-black bg-gradient-to-r from-[#2546BD] to-[#00BFFF] bg-clip-text text-transparent">
                      {item.value}
                    </span>
                    <span className="text-[#64748B] text-xs mt-0.5">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Social proof bar — fotos reais */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex items-center justify-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[
                    { src: "/logo-cliente-1.webp", alt: "Cliente 1" },
                    { src: "/logo-cliente-2.webp", alt: "Cliente 2" },
                    { src: "/logo-cliente-4.webp", alt: "Cliente 3" },
                    { src: "/logo-cliente-5.webp", alt: "Cliente 4" },
                  ].map((client, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#0A1628] overflow-hidden flex-shrink-0"
                      style={{ zIndex: 4 - i }}
                    >
                      <Image src={client.src} alt={client.alt} width={28} height={28} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-[#64748B] text-sm">
                  <span className="font-bold text-[#94A3B8]">8 setores</span> · R$ 47k/mês economizados em média
                </p>
              </motion.div>

              {/* Case real — dado verificável, não depoimento fictício */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 max-w-md mx-auto"
              >
                <div className="bg-[#131F35] border border-[#1E293B] rounded-card p-4 text-left">
                  <p className="text-[10px] font-semibold text-[#00BFFF] tracking-wider uppercase mb-2">Case real · Setor financeiro</p>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-center">
                      <p className="text-lg font-black text-[#EF4444]">3 dias</p>
                      <p className="text-[10px] text-[#64748B]">antes</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00BFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <div className="text-center">
                      <p className="text-lg font-black text-[#10B981]">4 horas</p>
                      <p className="text-[10px] text-[#64748B]">depois</p>
                    </div>
                  </div>
                  <p className="text-[#CBD5E1] text-sm leading-relaxed">
                    Fechamento financeiro mensal. Holding com 3 empresas em Londrina/PR. Automação de conciliação bancária e relatórios.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
