"use client";
import { useInView } from "@/hooks/useAnimations";
import { useState } from "react";

const faqItems = [
  {
    question: "Quanto tempo leva para ter resultado?",
    answer: "Nossa primeira entrega acontece em até 2 semanas. Projetos maiores são entregues em sprints, com resultados visíveis desde a primeira etapa. Sem enrolação."
  },
  {
    question: "Precisa de contrato longo?",
    answer: "Não. Trabalhamos com escopo definido e transparente. Você paga pelo que foi combinado, sem amarras. Se quiser continuar, a gente continua. Simples assim."
  },
  {
    question: "Funciona pro meu setor?",
    answer: "Se sua empresa tem processos manuais, planilhas sendo copiadas, ou sistemas que não conversam entre si, a gente resolve. Já atuamos em varejo, saúde, financeiro, logística, serviços e SaaS."
  },
  {
    question: "Como é o suporte depois da entrega?",
    answer: "Suporte real, com time dedicado. Não é só ticket jogado numa fila. Acompanhamos os primeiros resultados e permanecemos disponíveis para evolução contínua do sistema."
  },
  {
    question: "Vocês usam inteligência artificial?",
    answer: "Sim, quando faz sentido pro seu negócio. Aplicamos IA em automação de atendimento, análise de dados e tomada de decisão. Sempre focado em resultado, não em hype."
  }
];

export function FAQ() {
  const { ref, inView } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-16 lg:py-20" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6">
            Perguntas Frequentes
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4">
            Sem dúvida pra<br className="hidden md:block"/> dar o próximo passo
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-card overflow-hidden transition-all duration-300 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                } ${isOpen
                  ? "border border-primary/30 shadow-lg shadow-primary/5 bg-primary/[0.02] border-l-[3px] border-l-primary"
                  : "border border-card-border"
                }`}
                style={{ transitionDelay: inView ? `${index * 60}ms` : "0ms" }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-text pr-4">{item.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isOpen ? "bg-primary text-white" : "bg-primary/8 text-primary"
                  }`}>
                    {/* + that rotates to × */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
