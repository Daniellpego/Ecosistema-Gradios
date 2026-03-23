"use client";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useAnimations";
import { useState } from "react";

const faqItems = [
  {
    question: "Quanto custa automatizar meus processos?",
    answer: "Depende da complexidade. Nossos projetos variam conforme o escopo, mas o diagnóstico gratuito identifica exatamente o que faz sentido para sua empresa. A maioria dos nossos clientes recupera o investimento em menos de 3 meses."
  },
  {
    question: "Quanto tempo leva para implementar?",
    answer: "Automações simples ficam prontas em 5-10 dias. Projetos mais complexos levam de 3 a 6 semanas. No diagnóstico gratuito, você recebe um cronograma realista antes de comprometer qualquer investimento."
  },
  {
    question: "E se eu já tentei automatizar e não funcionou?",
    answer: "Acontece mais do que você imagina. Geralmente o problema não é a tecnologia, é o diagnóstico errado. Por isso começamos sempre pelo mapeamento completo dos processos antes de tocar em qualquer ferramenta."
  },
  {
    question: "Preciso trocar os sistemas que já uso?",
    answer: "Não. A automação integra os sistemas que você já tem — ERP, CRM, planilhas, WhatsApp, e-mail. Não substituímos nada, conectamos tudo."
  },
  {
    question: "Precisa de contrato longo?",
    answer: "Não. Trabalhamos com escopo definido e transparente. Você paga pelo que foi combinado, sem amarras. Se quiser continuar, a gente continua. Simples assim."
  },
  {
    question: "E se eu fizer o diagnóstico e não quiser contratar?",
    answer: "Sem problema nenhum. O diagnóstico é gratuito e sem compromisso. Você recebe um relatório com os gargalos identificados e pode implementar por conta própria se preferir."
  },
  {
    question: "Vocês vão me ligar insistentemente depois?",
    answer: "Não. Você recebe o diagnóstico via WhatsApp, e a conversa acontece no seu ritmo. Zero pressão. Nosso modelo funciona por resultado, não por insistência."
  },
  {
    question: "Funciona pro meu setor?",
    answer: "Se sua empresa tem processos manuais, planilhas sendo copiadas, ou sistemas que não conversam entre si, a gente resolve. Já atuamos em varejo, saúde, financeiro, logística, serviços e SaaS."
  },
  {
    question: "Minha equipe vai precisar aprender ferramentas novas?",
    answer: "Não. As automações rodam no background. Sua equipe continua usando as mesmas ferramentas de sempre — só que agora os dados fluem automaticamente entre elas."
  },
  {
    question: "O que acontece depois da implementação?",
    answer: "Oferecemos suporte contínuo. Monitoramos as automações, fazemos ajustes quando necessário e identificamos novas oportunidades de otimização. Não entregamos e sumimos."
  }
];

// Schema.org FAQPage data (exported for layout)
export const faqSchemaData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
};

export function FAQ() {
  const header = useScrollReveal('up', 0, 0.1);
  const { ref, getChildProps } = useStaggerReveal(0.05);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — scroll reveal */}
        <div className="flex flex-col items-center mb-12" ref={header.ref}>
          <div className={`inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6 ${header.className}`} style={header.style}>
            Perguntas Frequentes
          </div>
          <h2 className={`text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4 ${header.className}`} style={{ ...header.style, transitionDelay: '100ms' }}>
            Perguntas que todo empresário<br className="hidden md:block"/> faz antes de contratar
          </h2>
          <p className={`text-text-muted text-lg text-center max-w-lg mx-auto ${header.className}`} style={{ ...header.style, transitionDelay: '200ms' }}>
            Respondemos as 10 dúvidas mais comuns. Sem enrolação.
          </p>
        </div>

        {/* FAQ items — cascade reveal alternating left/right */}
        <div className="flex flex-col gap-3" ref={ref}>
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const direction = index % 2 === 0 ? 'left' : 'right';
            const child = getChildProps(index, direction as 'left' | 'right', 80);
            return (
              <div
                key={index}
                className={`rounded-card overflow-hidden transition-all duration-300 ${child.className} ${isOpen
                  ? "border border-primary/30 shadow-lg shadow-primary/5 bg-primary/[0.02] border-l-[3px] border-l-primary"
                  : "border border-card-border"
                }`}
                style={child.style}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-text pr-4">{item.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isOpen ? "bg-primary text-white rotate-45" : "bg-primary/8 text-primary rotate-0"
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
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
                  className="grid transition-all duration-[400ms]"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
