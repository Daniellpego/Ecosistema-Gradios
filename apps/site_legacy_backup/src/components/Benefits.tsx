"use client";

import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";
import { WordReveal } from "./WordReveal";
import { revealVariants, staggerParent, viewport, type Direction } from "@/lib/motion";

export function Benefits() {

  const benefits = [
    {
      title: "Automação de Processos",
      description: "Aprovações, cobranças, relatórios e notificações passam a rodar sozinhos. Seu time volta a fazer o que gera dinheiro.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary solution-icon group-hover:scale-110 group-hover:text-secondary transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      outcome: "Aprovações que levavam 3 dias agora rodam em minutos",
    },
    {
      title: "Software Sob Medida",
      description: "Se a ferramenta do mercado não encaixa, a gente constrói a sua. Projetada para o jeito que você já trabalha.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      outcome: "Sistema de onboarding que reduziu churn de 15% para 4% em 60 dias",
    },
    {
      title: "Sistemas que Conversam",
      description: "Seu ERP não fala com o CRM? A planilha vive desatualizada? A gente conecta tudo num fluxo só. Acabou o copiar e colar.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      outcome: "De 5 sistemas isolados para 1 fluxo integrado",
    },
    {
      title: "Números na Tela, Não na Planilha",
      description: "Você precisa de respostas, não de relatórios que levam 3 dias. Dashboards em tempo real para decidir hoje, não semana que vem.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      outcome: "Fechamento financeiro: de 3 dias para 4 horas",
    },
    {
      title: "A Gente Não Entrega e Some",
      description: "Depois que vai pro ar, a gente continua do lado. Monitoramento, ajustes e evolução do sistema conforme seu negócio cresce.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      ),
      outcome: "Tempo médio de resposta: 2h. Resolução em menos de 24h",
    },
    {
      title: "IA que Trabalha pra Você",
      description: "Diagnósticos, relatórios e atendimento gerados por inteligência artificial. Integrada ao que seu time já usa, não como ferramenta a mais.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
      ),
      outcome: "Diagnósticos que levavam 2h agora são gerados por IA em segundos",
    },
  ];

  const directions: Direction[] = ["up", "scale", "up", "scale", "up", "scale"];

  return (
    <section id="solucoes" className="bg-bg-alt py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da Seção */}
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
            O que fazemos
          </motion.div>
          <WordReveal
            text="Seis formas de automação de processos para tirar trabalho do seu time"
            className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4"
          />
          <motion.p
            className="text-text-muted text-lg text-center max-w-lg mx-auto"
            variants={revealVariants("up")}
          >
            Cada solução tem um resultado mensurável. Se não economiza tempo ou dinheiro, não faz sentido.
          </motion.p>
        </motion.div>

        {/* Grid de Cards — stagger reveal */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerParent(0.1)}
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={revealVariants(directions[index])}>
              <TiltCard className="group solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between gap-4 h-full touch-feedback">
                <div>
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-bold text-text mb-2">{benefit.title}</h3>
                  <p className="text-sm text-text-muted mb-6">{benefit.description}</p>
                </div>

                {/* Outcome real no rodapé */}
                <div className="mt-4 pt-4 border-t border-card-border">
                  <div className="flex items-center gap-2 py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-xs text-text-muted font-medium">{benefit.outcome}</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
