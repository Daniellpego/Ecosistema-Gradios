"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QUESTIONS,
  CATEGORY_TRANSITIONS,
  calculatePartialScore,
  type CategoryTransition,
} from "../_lib/data";

/* ═══════════════════════════════════════════════════════════
   ICONS — Lucide-style SVG paths for gargalos & impactos
   ═══════════════════════════════════════════════════════════ */

const GARGALO_ICONS: Record<number, string> = {
  0: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  1: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z",
  2: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  3: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  4: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  5: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6",
  6: "M18 20V10M12 20V4M6 20v-6",
};

const IMPACTO_ICONS: Record<number, string> = {
  0: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  1: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  2: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
  3: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  4: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v4",
  5: "M13 17l5-5-5-5M6 17l5-5-5-5",
};

const GRID_QUESTIONS = new Set(["cargo", "tamanho", "setor", "tempo", "prioridade"]);
const ICON_QUESTIONS: Record<string, Record<number, string>> = {
  gargalos: GARGALO_ICONS,
  impactos: IMPACTO_ICONS,
};
const KEY_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

/* ═══════════════════════════════════════════════════════════ */

interface QuizPhaseProps {
  currentQ: number;
  answers: Record<string, number[]>;
  onSingleSelect: (questionId: string, idx: number) => void;
  onMultiToggle: (questionId: string, idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuizPhase({
  currentQ,
  answers,
  onSingleSelect,
  onMultiToggle,
  onNext,
  onPrev,
}: QuizPhaseProps) {
  const q = QUESTIONS[currentQ];
  const prevQ = currentQ > 0 ? QUESTIONS[currentQ - 1] : null;
  const [showTransition, setShowTransition] = useState(false);
  const [activeTransition, setActiveTransition] = useState<CategoryTransition | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [phaseKey, setPhaseKey] = useState(0);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category transition
  useEffect(() => {
    if (prevQ && prevQ.categoria !== q.categoria) {
      const transition = CATEGORY_TRANSITIONS.find(
        (t) => t.fromCategoria === prevQ.categoria && t.toCategoria === q.categoria
      );
      if (transition) {
        setActiveTransition(transition);
        setShowTransition(true);
        const timer = setTimeout(() => {
          setShowTransition(false);
          setActiveTransition(null);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentQ, prevQ, q.categoria]);

  // Clear state on question change
  useEffect(() => {
    setReaction(null);
    setAutoAdvancing(false);
    setPhaseKey((k) => k + 1);
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [currentQ]);

  /* ── Smart Auto-Advance ── */
  const triggerAutoAdvance = useCallback(
    (hasReaction: boolean) => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      setAutoAdvancing(true);
      const delay = hasReaction ? 1200 : 600;
      autoAdvanceTimer.current = setTimeout(() => {
        setAutoAdvancing(false);
        onNext();
      }, delay);
    },
    [onNext]
  );

  function handleSelect(idx: number) {
    if (q.tipo === "single") {
      onSingleSelect(q.id, idx);
      const hasReaction = !!q.reactions?.[idx];
      if (hasReaction) setReaction(q.reactions![idx]);
      triggerAutoAdvance(hasReaction);
    } else {
      onMultiToggle(q.id, idx);
      if (q.reactions?.[idx]) setReaction(q.reactions[idx]);
    }
  }

  /* ── Keyboard Navigation ── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const keyIndex = KEY_LABELS.indexOf(key);
      if (keyIndex >= 0 && keyIndex < q.opcoes.length) { e.preventDefault(); handleSelect(keyIndex); return; }
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= q.opcoes.length) { e.preventDefault(); handleSelect(numKey - 1); return; }
      if (e.key === "Enter" && q.tipo === "multi" && canAdvance) { e.preventDefault(); onNext(); return; }
      if (e.key === "Backspace" && currentQ > 0) { e.preventDefault(); onPrev(); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, q, answers]);

  const canAdvance = (answers[q.id]?.length ?? 0) > 0;
  const partialScore = calculatePartialScore(answers);
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const useGrid = GRID_QUESTIONS.has(q.id);
  const icons = ICON_QUESTIONS[q.id];

  /* ── Category transition overlay (dark) ── */
  if (showTransition && activeTransition) {
    return (
      <div className="animate-fade-slide-up flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2546BD] to-[#00BFFF] flex items-center justify-center mb-6 shadow-lg shadow-[#00BFFF]/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={activeTransition.icon} />
          </svg>
        </div>
        <p className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
          {activeTransition.title}
        </p>
        <p className="text-[#94A3B8] max-w-sm">{activeTransition.subtitle}</p>

        <div className="mt-6 flex items-center gap-2">
          {["Perfil", "Empresa", "Operação", "Prioridade"].map((cat, i) => {
            const isCompleted = ["Perfil", "Empresa", "Operação", "Prioridade"].indexOf(activeTransition.toCategoria) > i;
            const isCurrent = cat === activeTransition.toCategoria;
            return (
              <div key={cat} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted ? "bg-[#00BFFF] text-white" :
                  isCurrent ? "bg-[#00BFFF]/20 border-2 border-[#00BFFF] text-[#00BFFF]" :
                  "bg-[#1E293B] text-[#64748B]"
                }`}>
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && <div className={`w-6 h-0.5 ${isCompleted ? "bg-[#00BFFF]" : "bg-[#1E293B]"}`} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER — DARK MODE
     ═══════════════════════════════════════════════════════════ */
  return (
    <div key={phaseKey} className="animate-fade-slide-up">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#00BFFF] bg-[#00BFFF]/10 px-2 py-0.5 rounded-pill">
              {q.categoria}
            </span>
            <span className="text-[#64748B]">
              {currentQ + 1}/{QUESTIONS.length}
            </span>
          </div>

          {answeredCount >= 2 && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2546BD] to-[#00BFFF] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(partialScore, 100)}%` }}
                />
              </div>
              <span className="text-[#64748B] font-medium text-[10px]">
                {partialScore}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2546BD] to-[#00BFFF] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2
        className="text-2xl sm:text-3xl font-bold text-white"
        style={{ letterSpacing: "-0.02em" }}
      >
        {q.pergunta}
      </h2>
      <p className="mt-2 text-[#94A3B8]">{q.sub}</p>

      {q.tipo === "multi" && (
        <p className="mt-1 text-xs text-[#00BFFF] font-medium">
          Selecione uma ou mais opções · <span className="text-[#64748B]">Enter para avançar</span>
        </p>
      )}

      {/* Keyboard hint */}
      <p className="mt-1 text-[10px] text-[#475569] hidden sm:block">
        Teclas A-{KEY_LABELS[q.opcoes.length - 1]} para selecionar
      </p>

      {/* Options — DARK MODE */}
      <div className={`mt-5 ${
        useGrid ? "grid grid-cols-2 gap-2.5" : "flex flex-col gap-2.5"
      }`}>
        {q.opcoes.map((opt, idx) => {
          const selected = answers[q.id]?.includes(idx);
          const icon = icons?.[idx];

          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`quiz-option w-full text-left rounded-card transition-all duration-200 text-base group min-h-[56px] ${
                useGrid ? "px-4 py-4" : "px-5 py-4"
              } ${
                selected
                  ? "border border-[#00BFFF] bg-[#00BFFF]/10 text-[#00BFFF] font-medium shadow-sm shadow-[#00BFFF]/10"
                  : "bg-[#0F1D32] border border-[#1E293B] hover:border-[#00BFFF]/30 hover:bg-[#131F35] text-[#CBD5E1]"
              }`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <span className="flex items-center gap-3">
                {/* Keyboard label */}
                <span className={`hidden sm:flex flex-shrink-0 w-6 h-6 rounded-md text-[10px] font-bold items-center justify-center transition-all ${
                  selected
                    ? "bg-[#00BFFF] text-white"
                    : "bg-[#1E293B] text-[#64748B] group-hover:bg-[#00BFFF]/10 group-hover:text-[#00BFFF]"
                }`}>
                  {KEY_LABELS[idx]}
                </span>

                {/* Icon */}
                {icon && (
                  <svg
                    className={`flex-shrink-0 w-5 h-5 transition-colors ${
                      selected ? "text-[#00BFFF]" : "text-[#475569] group-hover:text-[#00BFFF]/60"
                    }`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d={icon} />
                  </svg>
                )}

                {/* Radio/Checkbox mobile */}
                <span
                  className={`sm:hidden flex-shrink-0 w-5 h-5 ${
                    q.tipo === "multi" ? "rounded-md" : "rounded-full"
                  } border-2 flex items-center justify-center transition-all ${
                    selected
                      ? "border-[#00BFFF] bg-[#00BFFF]"
                      : "border-[#334155] group-hover:border-[#00BFFF]/40"
                  }`}
                >
                  {selected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>

                <span className={useGrid ? "text-sm leading-snug" : ""}>{opt}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Contextual reaction */}
      <AnimatePresence>
        {reaction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mt-4 flex items-start gap-2 bg-[#00BFFF]/[0.06] border border-[#00BFFF]/15 rounded-card px-4 py-3"
          >
            <svg className="w-4 h-4 text-[#00BFFF] mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm text-[#CBD5E1] font-medium">{reaction}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-advance indicator */}
      {autoAdvancing && q.tipo === "single" && (
        <div className="mt-3 flex justify-center">
          <div className="h-0.5 w-24 bg-[#1E293B] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#00BFFF] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: reaction ? 1.2 : 0.6, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Milestones — dinâmicos */}
      {currentQ === Math.floor(QUESTIONS.length / 2) && answeredCount >= Math.floor(QUESTIONS.length / 2) && (
        <div className="mt-3 text-center">
          <p className="text-xs text-[#00BFFF] font-semibold animate-fade-slide-up">
            Metade do caminho. Seu diagnóstico já está tomando forma.
          </p>
        </div>
      )}
      {currentQ === QUESTIONS.length - 3 && answeredCount >= QUESTIONS.length - 3 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-[#00BFFF] font-semibold animate-fade-slide-up">
            Quase lá! Faltam {QUESTIONS.length - currentQ - 1} perguntas para fechar o diagnóstico.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={currentQ === 0}
          className="text-sm font-medium text-[#64748B] hover:text-[#00BFFF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Voltar
        </button>

        {q.tipo === "multi" ? (
          <motion.button
            onClick={onNext}
            disabled={!canAdvance}
            animate={canAdvance ? { scale: [1, 1.03, 1] } : {}}
            transition={canAdvance ? { duration: 0.4, repeat: 2, repeatDelay: 1 } : {}}
            className="bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-pill px-6 py-3 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#00BFFF]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentQ === QUESTIONS.length - 1 ? "Finalizar →" : "Confirmar →"}
          </motion.button>
        ) : (
          <span className="text-xs text-[#475569]">
            {canAdvance ? "Avançando..." : "Selecione uma opção"}
          </span>
        )}
      </div>
    </div>
  );
}
