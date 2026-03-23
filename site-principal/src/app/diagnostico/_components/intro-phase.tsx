"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroPhaseProps {
  city: string;
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

export default function IntroPhase({ city, onStart }: IntroPhaseProps) {
  const [showContent, setShowContent] = useState(false);
  const headline = city
    ? `${city}. Detectamos uma ineficiência na sua operação.`
    : "Detectamos uma ineficiência na sua operação.";
  const { displayed, done } = useTypewriter(headline, 30, 800);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show content after typewriter finishes
  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [done]);

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
            <p className="text-white text-sm font-semibold">Gradios Neural Engine</p>
            <p className="text-[#64748B] text-xs">Analisando em tempo real</p>
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

        {/* Content reveals after typewriter */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              {/* Subheadline */}
              <p className="text-[#94A3B8] text-base sm:text-lg mb-8">
                10 perguntas. 2 minutos. Diagnóstico real da sua operação, gerado por IA na hora.
              </p>

              {/* CTA */}
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-pill px-8 py-4 font-bold text-lg shadow-lg shadow-[#2546BD]/30 hover:shadow-xl hover:shadow-[#00BFFF]/20 transition-shadow duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Iniciar diagnóstico</span>
                <div className="absolute inset-0 bg-white/10 -translate-x-full skew-x-12 hover:translate-x-[200%] transition-transform duration-700" />
              </motion.button>

              {/* Trust metrics */}
              <div className="mt-10 flex items-center justify-center gap-8 sm:gap-12">
                {[
                  { value: "2 min", label: "para responder" },
                  { value: "IA", label: "diagnóstico real" },
                  { value: "R$", label: "custo calculado" },
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

              {/* Social proof bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex items-center justify-center gap-3"
              >
                <div className="flex -space-x-2">
                  {["#2546BD", "#1856C0", "#0090D9", "#00BFFF"].map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#0A1628] flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: c, zIndex: 4 - i }}
                    >
                      {["G", "M", "R", "T"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-[#64748B] text-sm">
                  <span className="font-bold text-[#94A3B8]">2.400+</span> empresas diagnosticadas
                </p>
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 max-w-md mx-auto"
              >
                <div className="bg-[#131F35] border border-[#1E293B] rounded-card p-4 text-left">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#CBD5E1] text-sm leading-relaxed">
                    &ldquo;Fizemos o diagnóstico achando que era mais um quiz genérico. Em 2 minutos, mostraram que a gente perdia <strong className="text-white">R$14 mil/mês</strong> em retrabalho. Fechamos na mesma semana.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2546BD] to-[#00BFFF] flex items-center justify-center text-white text-[10px] font-bold">
                      RM
                    </div>
                    <div>
                      <p className="text-[#CBD5E1] text-xs font-bold">Rafael M.</p>
                      <p className="text-[#475569] text-[10px]">COO · Logística · 120 func.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
