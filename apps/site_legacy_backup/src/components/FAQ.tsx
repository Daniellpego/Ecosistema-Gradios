"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WordReveal } from "./WordReveal";
import { useState } from "react";
import { revealVariants, staggerParent, viewport } from "@/lib/motion";

const faqItems = [
  {
    question: "Quanto custa automatizar meus processos?",
    answer: "Nossos projetos variam de R$ 3.000 a R$ 30.000 dependendo do escopo e complexidade. O diagnóstico gratuito define exatamente qual faixa faz sentido para sua operação. A maioria dos nossos clientes recupera o investimento em menos de 3 meses.",
  },
  {
    question: "Quanto tempo leva para implementar?",
    answer: "Automações simples ficam prontas em 5-10 dias. Projetos mais complexos levam de 3 a 6 semanas. No diagnóstico gratuito, você recebe um cronograma realista antes de comprometer qualquer investimento.",
  },
  {
    question: "Preciso trocar os sistemas que já uso?",
    answer: "Não. A automação integra os sistemas que você já tem: ERP, CRM, planilhas, WhatsApp, e-mail. Não substituímos nada, conectamos tudo.",
  },
  {
    question: "Precisa de contrato longo?",
    answer: "Não. Trabalhamos com escopo definido e transparente. Você paga pelo que foi combinado, sem amarras. Se quiser continuar, a gente continua. Simples assim.",
  },
  {
    question: "E se eu fizer o diagnóstico e não quiser contratar?",
    answer: "Sem problema nenhum. O diagnóstico é gratuito e sem compromisso. Você recebe um relatório com os gargalos identificados e pode implementar por conta própria se preferir.",
  },
  {
    question: "O que acontece depois da implementação?",
    answer: "Oferecemos suporte contínuo. Monitoramos as automações, fazemos ajustes quando necessário e identificamos novas oportunidades de otimização. Não entregamos e sumimos.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-16 lg:py-24 pb-32 lg:pb-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Antes de decidir
          </motion.div>
          <WordReveal
            text="Automação de processos B2B: as perguntas que você deveria fazer"
            className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4"
          />
          <motion.p
            className="text-text-muted text-lg text-center max-w-lg mx-auto"
            variants={revealVariants("up")}
          >
            Se a resposta não for direta, desconfie. As nossas são.
          </motion.p>
        </motion.div>

        {/* FAQ items — stagger alternating left/right */}
        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={staggerParent(0.06)}
        >
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const direction = index % 2 === 0 ? "left" : "right";
            return (
              <motion.div
                key={index}
                className={`rounded-card overflow-hidden transition-colors duration-300 ${
                  isOpen
                    ? "border border-primary/30 shadow-lg shadow-primary/5 bg-primary/[0.02] border-l-[3px] border-l-primary"
                    : "border border-card-border"
                }`}
                variants={revealVariants(direction)}
              >
                <button
                  id={`faq-btn-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left group touch-feedback"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                >
                  <span className="text-base font-bold text-text pr-4">{item.question}</span>
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      isOpen ? "bg-primary text-white" : "bg-primary/8 text-primary"
                    }`}
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-btn-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { type: "spring", stiffness: 200, damping: 25 },
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
