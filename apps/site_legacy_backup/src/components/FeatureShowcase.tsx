"use client";

import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";
import { WordReveal } from "./WordReveal";
import { revealVariants, staggerParent, viewport } from "@/lib/motion";

export function FeatureShowcase() {
  const steps = [
    {
      number: "01",
      title: "Diagnóstico Gratuito",
      description: "Entendemos seu processo atual, mapeamos os gargalos e mostramos exatamente onde a automação vai gerar mais resultado. Antes de você gastar R$ 1.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Solução Desenvolvida",
      description: "Desenvolvemos a solução sob medida: automação, software ou integração. Entregas rápidas, validadas com você em cada etapa, sem surpresa no final.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Automação Rodando",
      description: "Colocamos em produção, treinamos seu time e acompanhamos os primeiros resultados. Você não fica sozinho depois da entrega.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section id="como-funciona" className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* COLUNA ESQUERDA — slide from right */}
          <motion.div
            className="lg:sticky lg:top-32"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={revealVariants("right")}
          >
            <div className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6">
              Como Funciona
            </div>
            <WordReveal
              text="Software sob medida e automação de processos: você explica, a gente resolve."
              className="text-4xl lg:text-5xl font-bold text-text leading-tight mb-4"
            />
            <p className="text-text-muted text-lg mt-4 leading-relaxed max-w-lg">
              Não vendemos pacote pronto. Primeiro entendemos como sua empresa funciona. Depois construímos exatamente o que falta.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {["Sem contrato longo. Escopo fechado.", "Primeira entrega em 14 dias.", "Suporte de verdade. Pessoa real, não ticket."].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-text font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Integration flow diagram — tangibiliza a automação */}
            <motion.div
              className="mt-10 bg-[#0f172a] rounded-2xl p-6 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
            >
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-5">Como a automação funciona</p>
              <div className="flex items-center justify-between gap-2">
                {/* Source nodes */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {[
                    { label: "WhatsApp", color: "#25D366", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
                    { label: "Planilhas", color: "#34A853", icon: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" },
                    { label: "ERP", color: "#4285F4", icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" },
                  ].map((node, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 + i * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${node.color}20` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={node.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={node.icon} />
                        </svg>
                      </div>
                      <span className="text-[10px] text-white/60 font-medium">{node.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Animated arrows → center */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 px-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-white/10 to-secondary/40" />
                      <svg className="w-2 h-2 text-secondary/60 -ml-0.5" viewBox="0 0 8 8" fill="currentColor">
                        <path d="M0 0L8 4L0 8z" />
                      </svg>
                    </motion.div>
                  ))}
                </div>

                {/* Center — Gradios engine */}
                <motion.div
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.7 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-primary/30 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f172a] animate-pulse" />
                  </div>
                  <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Gradios</span>
                </motion.div>

                {/* Arrow → output */}
                <motion.div
                  className="flex items-center flex-shrink-0 px-1"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-secondary/40 to-green-400/60" />
                  <svg className="w-2 h-2 text-green-400/60 -ml-0.5" viewBox="0 0 8 8" fill="currentColor">
                    <path d="M0 0L8 4L0 8z" />
                  </svg>
                </motion.div>

                {/* Output — result */}
                <motion.div
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 1 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">Resultado</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* COLUNA DIREITA — stagger from left */}
          <motion.div
            className="flex flex-col gap-0 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerParent(0.15)}
          >
            <div className="absolute left-10 top-12 bottom-12 w-px bg-gradient-to-b from-primary/40 via-secondary/40 to-transparent z-0" />
            {steps.map((step, index) => (
              <motion.div key={index} className="relative z-10 mb-6 last:mb-0" variants={revealVariants("left")}>
                <TiltCard
                  className="bg-bg-alt border border-card-border rounded-card p-6 relative overflow-hidden group cursor-default hover:shadow-[0_24px_48px_rgba(37,70,189,0.15)] hover:-translate-y-2 hover:border-primary/60 transition-all duration-300 touch-feedback"
                  intensity={6}
                >
                  <div className="flex items-start gap-4 z-10 relative">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-[0_0_20px_rgba(37,70,189,0.3)] group-hover:shadow-[0_0_30px_rgba(37,70,189,0.5)] transition-shadow duration-500"
                      style={{ background: "linear-gradient(135deg, #2546BD 0%, #1856C0 40%, #00BFFF 100%)" }}
                    >
                      <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-[#2546BD] via-[#1856C0] to-[#00BFFF]" />
                      <div className="relative z-10">{step.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-text mb-2">{step.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  <span className="absolute bottom-4 right-6 text-6xl font-black text-text/5 leading-none select-none z-0">{step.number}</span>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
