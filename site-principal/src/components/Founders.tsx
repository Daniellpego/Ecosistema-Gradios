"use client";

import { motion } from "framer-motion";
import { WordReveal } from "./WordReveal";
import { TiltCard } from "./TiltCard";
import { spring, revealVariants, staggerParent, viewport, type Direction } from "@/lib/motion";

const founders = [
  {
    initials: "GB",
    name: "Gustavo Batista",
    role: "Co-fundador & Head de Automação",
    bio: "Especialista em automação de processos B2B. Já ajudou dezenas de empresas a eliminar gargalos operacionais usando n8n, Make e integrações com IA.",
    quote: "A maioria das empresas perde dezenas de horas por semana em tarefas que deveriam ser automáticas. Meu trabalho é encontrar esses gargalos e eliminá-los.",
    direction: "right" as Direction,
  },
  {
    initials: "DP",
    name: "Daniel Pego",
    role: "Co-fundador & Head de Engenharia",
    bio: "Engenheiro de software full-stack com experiência em arquitetura de sistemas, dashboards financeiros e integrações complexas.",
    quote: "Cada empresa tem um jeito próprio de operar. A gente não força template. Entende primeiro, constrói depois.",
    direction: "up" as Direction,
  },
  {
    initials: "BG",
    name: "Bryan Gradi",
    role: "Co-fundador & Head Comercial",
    bio: "Responsável pela estratégia comercial e relacionamento com clientes. Conecta a tecnologia ao resultado que o empresário precisa ver na prática.",
    quote: "A gente não vende software. A gente resolve problema. Se não faz sentido automatizar, a gente fala na lata.",
    direction: "left" as Direction,
  },
];

export function Founders() {
  return (
    <section className="bg-bg-alt py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerParent(0.1)}
        >
          <motion.div
            className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6"
            variants={revealVariants("up")}
          >
            Quem Está Por Trás
          </motion.div>
          <WordReveal
            text="Pessoas reais construindo sua automação"
            className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4"
          />
          <motion.p
            className="text-text-muted text-lg text-center max-w-xl mx-auto"
            variants={revealVariants("up")}
          >
            Três sócios, três especialidades. Automação, engenharia e comercial trabalhando juntos.
          </motion.p>
        </motion.div>

        {/* Founder cards — stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerParent(0.15)}
        >
          {founders.map((founder, i) => (
            <motion.div key={i} variants={revealVariants(founder.direction)}>
              <TiltCard className="bg-white border border-card-border rounded-card p-7 solution-card touch-feedback h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-white text-lg font-bold">{founder.initials}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">{founder.name}</h3>
                    <p className="text-xs text-primary font-medium">{founder.role}</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{founder.bio}</p>
                <blockquote className="text-sm text-text italic border-l-2 border-primary/30 pl-4 mb-5">
                  &ldquo;{founder.quote}&rdquo;
                </blockquote>
                <a
                  href="https://www.linkedin.com/company/gradios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Badges de parceria */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ ...spring.smooth, delay: 0.3 }}
        >
          {["n8n Partner", "Make Certified"].map((badge, i) => (
            <div key={i} className="bg-white border border-card-border rounded-pill px-4 py-2 text-xs font-semibold text-text-muted hover:border-primary/30 hover:text-primary transition-all duration-300">
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
