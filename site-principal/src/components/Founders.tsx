"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WordReveal } from "./WordReveal";
import { TiltCard } from "./TiltCard";
import { spring, revealVariants, staggerParent, viewport, type Direction } from "@/lib/motion";

const founders = [
  {
    initials: "GB",
    name: "Gustavo Batista",
    photo: "/gustavo-batista.webp",
    role: "Co-fundador & Head de Automação",
    bio: "Especialista em automação de processos B2B. Já ajudou dezenas de empresas a eliminar gargalos operacionais usando n8n, Make e integrações com IA.",
    quote: "A maioria das empresas perde dezenas de horas por semana em tarefas que deveriam ser automáticas. Meu trabalho é encontrar esses gargalos e eliminá-los.",
    direction: "right" as Direction,
  },
  {
    initials: "DP",
    name: "Daniel Pego",
    photo: "/daniel-pego.webp",
    role: "Co-fundador & Head de Engenharia",
    bio: "Engenheiro de software full-stack com experiência em arquitetura de sistemas, dashboards financeiros e integrações complexas.",
    quote: "Cada empresa tem um jeito próprio de operar. A gente não força template. Entende primeiro, constrói depois.",
    direction: "up" as Direction,
  },
  {
    initials: "BG",
    name: "Bryan Gradi",
    photo: "/bryan-gradi.webp",
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
            Quem faz acontecer
          </motion.div>
          <WordReveal
            text="Você sabe com quem está falando"
            className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4"
          />
          <motion.p
            className="text-text-muted text-lg text-center max-w-xl mx-auto"
            variants={revealVariants("up")}
          >
            Três sócios. Sem gerente de contas, sem camadas. Quem vende é quem entrega.
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
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-lg shadow-primary/20 ring-2 ring-primary/20">
                    <Image
                      src={founder.photo}
                      alt={`${founder.name}, ${founder.role} na Gradios`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">{founder.name}</h3>
                    <p className="text-xs text-primary font-medium">{founder.role}</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{founder.bio}</p>
                <blockquote className="text-sm text-text italic border-l-2 border-primary/30 pl-4">
                  &ldquo;{founder.quote}&rdquo;
                </blockquote>
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
