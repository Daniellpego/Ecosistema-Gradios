"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";

/* ── Neural Network — subtle overlay on white ── */
function NeuralNet({ chaos, side }: { chaos: number; side: "before" | "after" }) {
  const nodes = useMemo(() => {
    const seed = side === "before" ? 1 : 5;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + seed;
      const r = 18 + ((i * 17 + seed * 7) % 28);
      pts.push({
        x: 50 + Math.cos(angle) * r + ((i * 13 + seed * 3) % 8) - 4,
        y: 50 + Math.sin(angle) * r + ((i * 11 + seed * 5) % 8) - 4,
      });
    }
    return pts;
  }, [side]);

  const isBefore = side === "before";
  const jitter = chaos * 4;

  // Before: red tinted connections that glitch. After: stable cyan.
  const strokeColor = isBefore
    ? `rgba(220,38,38,${0.06 + chaos * 0.06})`
    : `rgba(37,70,189,${0.1 - chaos * 0.02})`;
  const fillColor = isBefore
    ? `rgba(220,38,38,${0.12 + chaos * 0.08})`
    : `rgba(0,191,255,${0.2 - chaos * 0.04})`;
  const strokeW = isBefore ? 0.2 + chaos * 0.12 : 0.15;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {nodes.map((node, i) =>
        nodes
          .slice(i + 1)
          .filter((_, j) => (i + j) % 3 === 0)
          .map((target, j) => {
            const x1 = node.x + (isBefore ? Math.sin(i * chaos * 0.6) * jitter : 0);
            const y1 = node.y + (isBefore ? Math.cos(i * chaos * 0.35) * jitter : 0);
            const x2 = target.x + (isBefore ? Math.sin(j * chaos * 0.8) * jitter : 0);
            const y2 = target.y + (isBefore ? Math.cos(j * chaos * 0.5) * jitter : 0);
            return (
              <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeW} />
            );
          })
      )}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x + (isBefore ? Math.sin(i * chaos * 0.7) * jitter : 0)}
          cy={node.y + (isBefore ? Math.cos(i * chaos * 0.5) * jitter : 0)}
          r={isBefore ? 0.7 + chaos * 0.25 : 0.9}
          fill={fillColor}
        />
      ))}
    </svg>
  );
}

export function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const beforeHours = 72;
  const afterHours = 4;
  const economyHours = Math.round((sliderPos / 100) * (beforeHours - afterHours));
  const chaosLevel = sliderPos / 100;

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
      setSliderPos(pct);
      if (!hasInteracted) setHasInteracted(true);
    },
    [hasInteracted]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Dynamic progress widths
  const fraudWidth = 70 + chaosLevel * 20;
  const afterExecWidth = 5.5 + (1 - chaosLevel) * 10;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden select-none touch-none cursor-col-resize border border-card-border"
      style={{ aspectRatio: "2/1" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* ═══ DEPOIS — fundo branco limpo + rede neural cyan sutil ═══ */}
      <div className="absolute inset-0 bg-white">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #2546BD 0.5px, transparent 0.5px)",
            backgroundSize: "20px 20px",
          }}
        />
        <NeuralNet chaos={chaosLevel} side="after" />

        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-8 lg:p-12">
          <div className="max-w-xs sm:max-w-sm ml-auto mr-4 sm:mr-8 lg:mr-16">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]" style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span className="text-[10px] sm:text-[10px] font-bold text-[#2546BD] uppercase tracking-widest">
                Sistema ativo
              </span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A1628] mb-1">4 horas</div>
            <p className="text-xs sm:text-sm text-[#2546BD]/60 mb-4">Automatizado. Zero erro. Relatório pronto.</p>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[10px] sm:text-[10px] mb-1">
                  <span className="text-text-muted">Conformidade</span>
                  <span className="text-[#2546BD] font-bold">100%</span>
                </div>
                <div className="h-1.5 bg-[#2546BD]/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.min(100, 85 + (1 - chaosLevel) * 15)}%`,
                      background: "linear-gradient(90deg, #2546BD, #00BFFF)",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] sm:text-[10px] mb-1">
                  <span className="text-text-muted">Tempo de execução</span>
                  <span className="text-green-600 font-bold">{afterExecWidth.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-green-500/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300 ease-out"
                    style={{ width: `${afterExecWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ANTES — fundo branco com tint rosa sutil + rede neural vermelha ═══ */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white via-red-50/40 to-white"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: 0.015 + chaosLevel * 0.015,
            backgroundImage: "radial-gradient(circle, #dc2626 0.5px, transparent 0.5px)",
            backgroundSize: "16px 16px",
          }}
        />
        <NeuralNet chaos={chaosLevel} side="before" />

        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-8 lg:p-12">
          <div className="max-w-xs sm:max-w-sm ml-4 sm:ml-8 lg:ml-16">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-1.5 h-1.5 rounded-full bg-red-500"
                style={{ animation: "pulse 0.9s ease-in-out infinite" }}
              />
              <span className="text-[10px] sm:text-[10px] font-bold text-red-500 uppercase tracking-widest">
                Processo manual
              </span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0A1628] mb-1">3 dias</div>
            <p className="text-xs sm:text-sm text-red-500/60 mb-4">Planilhas. Retrabalho. Erros frequentes.</p>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[10px] sm:text-[10px] mb-1">
                  <span className="text-text-muted">Risco de fraude</span>
                  <span className="text-red-500 font-bold">Alto</span>
                </div>
                <div className="h-1.5 bg-red-500/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-300 ease-out"
                    style={{ width: `${fraudWidth}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] sm:text-[10px] mb-1">
                  <span className="text-text-muted">Tempo consumido</span>
                  <span className="text-red-500 font-bold">100%</span>
                </div>
                <div className="h-1.5 bg-red-500/[0.08] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HANDLE — Régua de Tempo integrada ═══ */}
      <motion.div className="absolute top-0 bottom-0 z-20 flex items-center" style={{ left: `${sliderPos}%`, x: "-50%" }}>
        <div
          className="w-[1.5px] h-full transition-shadow duration-200"
          style={{
            background: "linear-gradient(to bottom, transparent 4%, #2546BD 20%, #00BFFF 50%, #2546BD 80%, transparent 96%)",
            boxShadow: isDragging ? "0 0 12px rgba(0,191,255,0.35)" : "0 0 4px rgba(37,70,189,0.15)",
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
          animate={{ scale: isDragging ? 1.08 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          whileTap={{ scale: 1.12 }}
        >
          <div
            className="bg-white border border-[#2546BD]/20 rounded-full px-2.5 py-0.5 whitespace-nowrap transition-shadow duration-200"
            style={{
              boxShadow: isDragging
                ? "0 2px 12px rgba(37,70,189,0.2), 0 0 0 1px rgba(0,191,255,0.15)"
                : "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <span className="text-[10px] sm:text-[10px] font-bold text-[#2546BD]">Economia: {economyHours}h</span>
          </div>

          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-[#2546BD]/30 flex items-center justify-center transition-all duration-200"
            style={{
              boxShadow: isDragging
                ? "0 2px 16px rgba(37,70,189,0.25), 0 0 0 3px rgba(0,191,255,0.1)"
                : "0 1px 6px rgba(0,0,0,0.1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-[#2546BD]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 8l4 4-4 4" />
              <path d="M7 8l-4 4 4 4" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute top-3 left-3 z-10 bg-red-50 text-red-600 text-[10px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border border-red-200/60">
        Antes
      </div>
      <div className="absolute top-3 right-3 z-10 bg-blue-50 text-[#2546BD] text-[10px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border border-[#2546BD]/15">
        Depois
      </div>

      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-[#0A1628]/60 backdrop-blur-sm text-white text-[10px] sm:text-[10px] font-medium px-3 py-1 rounded-full pointer-events-none transition-opacity duration-700"
        style={{ opacity: hasInteracted ? 0 : 0.7 }}
      >
        Arraste para comparar
      </div>
    </div>
  );
}
