"use client";

import { useState, useEffect } from "react";
import {
  QUESTIONS,
  CATEGORY_TRANSITIONS,
  calculatePartialScore,
  type CategoryTransition,
} from "../_lib/data";

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

  // Clear reaction on question change
  useEffect(() => {
    setReaction(null);
    setPhaseKey((k) => k + 1);
  }, [currentQ]);

  function handleSelect(idx: number) {
    if (q.tipo === "single") {
      onSingleSelect(q.id, idx);
    } else {
      onMultiToggle(q.id, idx);
    }

    // Check for reaction
    if (q.reactions?.[idx]) {
      setReaction(q.reactions[idx]);
    }
  }

  const canAdvance = (answers[q.id]?.length ?? 0) > 0;
  const partialScore = calculatePartialScore(answers);
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Category transition overlay
  if (showTransition && activeTransition) {
    return (
      <div className="animate-fade-slide-up flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={activeTransition.icon} />
          </svg>
        </div>
        <p className="text-2xl font-black text-text mb-2" style={{ letterSpacing: "-0.02em" }}>
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
        className="text-2xl sm:text-3xl font-black text-text"
        style={{ letterSpacing: "-0.02em" }}
      >
        {q.pergunta}
      </h2>
      <p className="mt-2 text-text-muted">{q.sub}</p>

      {q.tipo === "multi" && (
        <p className="mt-1 text-xs text-secondary font-medium">
          Selecione uma ou mais opções
        </p>
      )}

      {/* Options */}
      <div className="mt-6 flex flex-col gap-3">
        {q.opcoes.map((opt, idx) => {
          const selected = answers[q.id]?.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`quiz-option w-full text-left px-5 py-4 rounded-card border-2 transition-all duration-200 text-sm font-medium group ${
                selected
                  ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                  : "border-card-border hover:border-primary/30 hover:bg-white text-text"
              }`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex-shrink-0 w-5 h-5 ${
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
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contextual reaction */}
      {reaction && (
        <div className="mt-4 flex items-start gap-2 bg-secondary/[0.06] border border-secondary/15 rounded-card px-4 py-3 animate-fade-slide-up">
          <svg className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm text-text font-medium">{reaction}</p>
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

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={currentQ === 0}
          className="text-sm font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className="bg-brand-gradient text-white rounded-pill px-6 py-3 font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
        >
          {currentQ === QUESTIONS.length - 1 ? "Finalizar →" : "Próxima →"}
        </button>
      </div>
    </div>
  );
}
