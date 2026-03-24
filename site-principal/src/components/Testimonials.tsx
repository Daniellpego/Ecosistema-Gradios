"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { WordReveal } from "./WordReveal";
import { spring, revealVariants, staggerParent, viewport } from "@/lib/motion";
import Image from "next/image";
import Link from "next/link";

/* ── Interactive Before/After Slider ── */
function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden select-none touch-none cursor-col-resize"
      style={{ aspectRatio: "16/7" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* DEPOIS (background - full width) */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col justify-center p-6 sm:p-10">
        <div className="max-w-md ml-auto mr-8 sm:mr-16">
          <div className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Depois</div>
          <div className="text-4xl sm:text-5xl font-bold font-display text-green-600 mb-2">4 horas</div>
          <p className="text-sm sm:text-base text-green-600/70">Automatizado, sem erro, relatório pronto</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-16 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full w-[5.5%] bg-green-500 rounded-full" />
            </div>
            <span className="text-xs text-green-500 font-semibold">5.5% do tempo original</span>
          </div>
        </div>
      </div>

      {/* ANTES (overlay - clipped) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 flex flex-col justify-center p-6 sm:p-10"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <div className="max-w-md ml-8 sm:ml-16">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Antes</div>
          <div className="text-4xl sm:text-5xl font-bold font-display text-red-600 mb-2">3 dias</div>
          <p className="text-sm sm:text-base text-red-500/70">Processo manual, planilhas, erros frequentes</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-16 bg-red-200 rounded-full overflow-hidden">
              <div className="h-full w-full bg-red-500 rounded-full" />
            </div>
            <span className="text-xs text-red-400 font-semibold">100% do tempo</span>
          </div>
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-[2px] h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8l4 4-4 4" />
            <path d="M6 8l-4 4 4 4" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
        Antes
      </div>
      <div className="absolute top-3 right-3 z-10 bg-green-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
        Depois
      </div>

      {/* Hint on first load */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-3 py-1.5 rounded-full pointer-events-none opacity-60">
        Arraste para comparar
      </div>
    </div>
  );
}

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="text-4xl font-bold font-display text-primary"
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={spring.smooth}
    >
      {displayValue}
      {suffix}
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <section id="cases" className="bg-bg-alt relative z-10 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerParent(0.1)}
        >
          <motion.div
            className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6"
            variants={revealVariants("up")}
          >
            Prova
          </motion.div>
          <WordReveal
            text="Fatos. Não promessas."
            className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4"
          />
          <motion.p
            className="text-text-muted text-lg text-center max-w-xl mx-auto mt-4"
            variants={revealVariants("up")}
          >
            Estes são resultados reais de empresas reais. Pergunte para elas.
          </motion.p>
        </motion.div>

        {/* Case principal — slider interativo */}
        <motion.div
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerParent(0.12)}
        >
          <motion.div
            className="solution-card bg-white border border-card-border rounded-card p-6 sm:p-8"
            variants={revealVariants("scale")}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider block">Case em destaque | Setor Financeiro</span>
                <span className="text-lg font-bold text-text">Fechamento financeiro mensal</span>
              </div>
            </div>

            {/* Before/After Slider */}
            <BeforeAfterSlider />

            <p className="text-text-muted leading-relaxed mt-6">
              Automação completa do fluxo de aprovações, conciliação bancária e geração de relatórios. Eliminamos 90% do trabalho manual.
            </p>

            {/* Testimonial + micro-CTA */}
            <div className="pt-4 mt-4 border-t border-card-border space-y-4">
              <div className="flex items-center gap-3">
                <Image src="/logo-cliente-4.webp" alt="Logo de holding financeira, cliente Gradios" width={32} height={32} className="w-8 h-8 rounded-full object-cover bg-white border border-card-border flex-shrink-0" />
                <div>
                  <span className="text-sm text-text font-semibold block">CFO de holding com 3 empresas no setor financeiro, Londrina/PR</span>
                  <span className="text-xs text-text-muted italic">&ldquo;O fechamento que levava 3 dias agora termina antes do almoço.&rdquo;</span>
                </div>
              </div>

              <Link
                href="/diagnostico"
                className="group flex items-center gap-3 bg-primary/[0.04] hover:bg-primary/[0.08] border border-primary/15 hover:border-primary/30 rounded-xl px-4 py-3 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">Seu fechamento financeiro também demora?</p>
                  <p className="text-xs text-primary font-medium">Descubra como reduzir &rarr;</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Cards secundários */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerParent(0.12)}
        >
          <motion.div
            className="solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between"
            variants={revealVariants("left")}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted line-through">1x volume</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold text-green-600">3x volume</span>
              </div>
              <div className="text-3xl font-bold font-display text-text mb-2">3x</div>
              <p className="text-sm font-bold text-text mb-2">Volume sem contratar</p>
              <p className="text-sm text-text-muted">Empresa de serviços B2B com 12 colaboradores triplicou a capacidade de atendimento em 6 semanas com automação de processos internos.</p>
            </div>
            <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
              <Image src="/logo-cliente-5.webp" alt="Logo de consultoria B2B, cliente Gradios" width={24} height={24} className="w-6 h-6 rounded-full object-cover bg-white border border-card-border flex-shrink-0" />
              <span className="text-xs text-text-muted font-medium">Diretor de Operações, consultoria B2B</span>
            </div>
          </motion.div>

          <motion.div
            className="solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between"
            variants={revealVariants("left")}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted line-through">40h/mês</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold text-green-600">2h/mês</span>
              </div>
              <div className="text-3xl font-bold font-display text-text mb-2">95%</div>
              <p className="text-sm font-bold text-text mb-2">Menos tempo em emissão de notas</p>
              <p className="text-sm text-text-muted">Processo de emissão de notas fiscais que consumia uma semana por mês passou a rodar automaticamente com validação inteligente.</p>
            </div>
            <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
              <Image src="/logo-cliente-6.webp" alt="Logo de distribuidora, cliente Gradios" width={24} height={24} className="w-6 h-6 rounded-full object-cover bg-white border border-card-border flex-shrink-0" />
              <span className="text-xs text-text-muted font-medium">Gestor Financeiro, distribuidora</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Métricas rápidas */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-card-border pt-12">
          {[
            { value: 70, suffix: "%", label: "Redução de retrabalho" },
            { value: 3, suffix: "x", label: "Escala sem contratar" },
            { value: 2, suffix: " sem", label: "Primeira entrega" },
            { value: 12, suffix: "/12", label: "Clientes renovaram" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-text-muted mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
          <p className="text-xs text-text-muted text-center mt-4 col-span-full">
            *Média dos nossos clientes nos primeiros 90 dias de operação
          </p>
        </div>
      </div>
    </section>
  );
}
