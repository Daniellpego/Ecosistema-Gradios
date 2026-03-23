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
  0: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",                    // Financeiro
  1: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z",    // Comercial
  2: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",                  // Atendimento
  3: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",                               // Operações
  4: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z", // Logística
  5: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6", // RH
  6: "M18 20V10M12 20V4M6 20v-6",                                                  // Dados
};

const IMPACTO_ICONS: Record<number, string> = {
  0: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z",                            // Atrasos
  1: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", // Erros
  2: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",                             // Decisões
  3: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",                    // Custo alto
  4: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v4", // Perda cliente
  5: "M13 17l5-5-5-5M6 17l5-5-5-5",                                               // Escalar
};

/* Questions that use grid layout (short options) */
const GRID_QUESTIONS = new Set(["cargo", "tamanho", "setor", "tempo", "prioridade"]);

/* Questions that show icons */
const ICON_QUESTIONS: Record<string, Record<number, string>> = {
  gargalos: GARGALO_ICONS,
  impactos: IMPACTO_ICONS,
};

/* Keyboard labels */
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

  // Check for category transition
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

  // Clear reaction + auto-advance state on question change
  useEffect(() => {
    setReaction(null);
    setAutoAdvancing(false);
    setPhaseKey((k) => k + 1);
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [currentQ]);

  /* ── Smart Auto-Advance for single-select ── */
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
      if (q.reactions?.[idx]) {
        setReaction(q.reactions[idx]);
      }
    }
  }

  /* ── Keyboard Navigation ── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      // A-J keys → select option
      const keyIndex = KEY_LABELS.indexOf(key);
      if (keyIndex >= 0 && keyIndex < q.opcoes.length) {
        e.preventDefault();
        handleSelect(keyIndex);
        return;
      }

      // 1-9 keys → select option
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= q.opcoes.length) {
        e.preventDefault();
        handleSelect(numKey - 1);
        return;
      }

      // Enter → advance (multi-select only, since single auto-advances)
      if (e.key === "Enter" && q.tipo === "multi" && canAdvance) {
        e.preventDefault();
        onNext();
        return;
      }

      // Backspace → go back
      if (e.key === "Backspace" && currentQ > 0) {
        e.preventDefault();
        onPrev();
      }
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

  // Category transition overlay
  if (showTransition && activeTransition) {
    return (
      <div className="animate-fade-slide-up flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={activeTransition.icon} />
          </svg>
        </div>
        <p className="text-2xl font-bold text-text mb-2" style={{ letterSpacing: "-0.02em" }}>
          {activeTransition.title}
        </p>
        <p className="text-text-muted max-w-sm">{activeTransition.subtitle}</p>

        {/* Mini progress indicator */}
        <div className="mt-6 flex items-center gap-2">
          {["Perfil", "Empresa", "Operação", "Prioridade"].map((cat, i) => {
            const isCompleted = ["Perfil", "Empresa", "Operação", "Prioridade"].indexOf(activeTransition.toCategoria) > i;
            const isCurrent = cat === activeTransition.toCategoria;
            return (
              <div key={cat} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted ? "bg-primary text-white" :
                  isCurrent ? "bg-secondary/20 border-2 border-secondary text-secondary" :
                  "bg-card-border text-text-muted"
                }`}>
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && <div className={`w-6 h-0.5 ${isCompleted ? "bg-primary" : "bg-card-border"}`} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div key={phaseKey} className="animate-fade-slide-up">
      {/* Progress bar with category + live score */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-pill">
              {q.categoria}
            </span>
            <span className="text-text-muted">
              {currentQ + 1}/{QUESTIONS.length}
            </span>
          </div>

          {/* Live diagnosis indicator */}
          {answeredCount >= 2 && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-card-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(partialScore, 100)}%` }}
                />
              </div>
              <span className="text-text-muted font-medium text-[10px]">
                Score: {partialScore}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-2 bg-card-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2
        className="text-2xl sm:text-3xl font-bold text-text"
        style={{ letterSpacing: "-0.02em" }}
      >
        {q.pergunta}
      </h2>
      <p className="mt-2 text-text-muted">{q.sub}</p>

      {q.tipo === "multi" && (
        <p className="mt-1 text-xs text-secondary font-medium">
          Selecione uma ou mais opções · <span className="text-text-muted">Enter para avançar</span>
        </p>
      )}

      {/* Keyboard hint */}
      <p className="mt-1 text-[10px] text-text-muted/60 hidden sm:block">
        Use as teclas A-{KEY_LABELS[q.opcoes.length - 1]} para selecionar
      </p>

      {/* Options — grid or vertical depending on question */}
      <div className={`mt-5 ${
        useGrid
          ? "grid grid-cols-2 gap-2.5"
          : "flex flex-col gap-2.5"
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
              className={`quiz-option w-full text-left rounded-card transition-all duration-200 text-sm group ${
                useGrid ? "px-4 py-3" : "px-5 py-4"
              } ${
                selected
                  ? "border border-primary bg-primary/5 text-primary font-medium shadow-sm shadow-primary/10"
                  : "bg-white shadow-sm hover:shadow-md hover:border-primary/20 border border-transparent text-text"
              }`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <span className="flex items-center gap-3">
                {/* Keyboard label */}
                <span className={`hidden sm:flex flex-shrink-0 w-6 h-6 rounded-md text-[10px] font-bold items-center justify-center transition-all ${
                  selected
                    ? "bg-primary text-white"
                    : "bg-card-border/60 text-text-muted group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  {KEY_LABELS[idx]}
                </span>

                {/* Icon (for gargalos/impactos) */}
                {icon && (
                  <svg
                    className={`flex-shrink-0 w-5 h-5 transition-colors ${
                      selected ? "text-primary" : "text-text-muted/50 group-hover:text-primary/60"
                    }`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d={icon} />
                  </svg>
                )}

                {/* Radio/Checkbox (mobile only, desktop uses key labels) */}
                <span
                  className={`sm:hidden flex-shrink-0 w-5 h-5 ${
                    q.tipo === "multi" ? "rounded-md" : "rounded-full"
                  } border-2 flex items-center justify-center transition-all ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-card-border group-hover:border-primary/40"
                  }`}
                >
                  {selected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>

                <span className={useGrid ? "text-xs sm:text-sm" : ""}>{opt}</span>
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
            className="mt-4 flex items-start gap-2 bg-secondary/[0.06] border border-secondary/15 rounded-card px-4 py-3"
          >
            <svg className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm text-text font-medium">{reaction}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-advance indicator (single-select) */}
      {autoAdvancing && q.tipo === "single" && (
        <div className="mt-3 flex justify-center">
          <div className="h-0.5 w-24 bg-card-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: reaction ? 1.2 : 0.6, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Milestone messages */}
      {currentQ === 4 && answeredCount >= 5 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-secondary font-semibold animate-fade-slide-up">
            Metade do caminho. Seu diagnóstico já está tomando forma.
          </p>
        </div>
      )}
      {currentQ === 7 && answeredCount >= 8 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-secondary font-semibold animate-fade-slide-up">
            Quase lá! Faltam 2 perguntas para fechar o diagnóstico.
          </p>
        </div>
      )}

      {/* Navigation — hide "Próxima" button for single-select (auto-advances) */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={currentQ === 0}
          className="text-sm font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Voltar
        </button>

        {q.tipo === "multi" ? (
          <motion.button
            onClick={onNext}
            disabled={!canAdvance}
            animate={canAdvance ? { scale: [1, 1.03, 1] } : {}}
            transition={canAdvance ? { duration: 0.4, repeat: 2, repeatDelay: 1 } : {}}
            className="bg-brand-gradient text-white rounded-pill px-6 py-3 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentQ === QUESTIONS.length - 1 ? "Finalizar →" : "Confirmar →"}
          </motion.button>
        ) : (
          /* Single-select: show subtle hint instead of button */
          <span className="text-xs text-text-muted/50">
            {canAdvance ? "Avançando..." : "Selecione uma opção"}
          </span>
        )}
      </div>
    </div>
  );
}
