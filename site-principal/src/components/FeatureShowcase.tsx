"use client";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useAnimations";

export function FeatureShowcase() {
  const leftCol = useScrollReveal('right', 0, 0.1);
  const { ref: rightRef, getChildProps } = useStaggerReveal(0.08);

  const steps = [
    {
      number: "01",
      title: "Diagnóstico Gratuito",
      description: "Entendemos seu processo atual, mapeamos os gargalos e mostramos exatamente onde a automação vai gerar mais resultado. Antes de você gastar R$ 1.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      number: "02",
      title: "Solução Desenvolvida",
      description: "Desenvolvemos a solução sob medida: automação, software ou integração. Entregas rápidas, validadas com você em cada etapa, sem surpresa no final.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      )
    },
    {
      number: "03",
      title: "Automação Rodando",
      description: "Colocamos em produção, treinamos seu time e acompanhamos os primeiros resultados. Você não fica sozinho depois da entrega.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    }
  ];

  return (
    <section id="como-funciona" className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* COLUNA ESQUERDA — slide from left */}
          <div className={`lg:sticky lg:top-32 ${leftCol.className}`} ref={leftCol.ref} style={leftCol.style}>
            <div className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6">
              Como Funciona
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-text leading-tight mb-4">
              Entendemos primeiro.<br />Construímos depois.
            </h2>
            <p className="text-text-muted text-lg mt-4 leading-relaxed max-w-lg">
              A gente não chega com uma proposta pronta. Primeiro a gente entende. Depois a gente constrói.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {["Sem contrato longo", "Primeira entrega em até 2 semanas", "Suporte real, não só ticket"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm text-text font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUNA DIREITA — stagger from right */}
          <div className="flex flex-col gap-0 relative" ref={rightRef}>
            <div className="absolute left-10 top-12 bottom-12 w-px bg-gradient-to-b from-primary/40 via-secondary/40 to-transparent z-0" />
            {steps.map((step, index) => {
              const child = getChildProps(index, 'left', 180);
              return (
                <div key={index} className="relative z-10 mb-6 last:mb-0">
                  <div
                    className={`bg-bg-alt border border-card-border rounded-card p-6 relative overflow-hidden group cursor-default hover:shadow-[0_24px_48px_rgba(37,70,189,0.15)] hover:-translate-y-2 hover:border-primary/60 transition-all duration-300 ${child.className}`}
                    style={child.style}
                  >
                    <div className="flex items-start gap-4 z-10 relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-[0_0_20px_rgba(37,70,189,0.3)] group-hover:shadow-[0_0_30px_rgba(37,70,189,0.5)] transition-shadow duration-500" style={{ background: 'linear-gradient(135deg, #2546BD 0%, #1856C0 40%, #00BFFF 100%)' }}>
                        <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-[#2546BD] via-[#1856C0] to-[#00BFFF]"></div>
                        <div className="relative z-10">{step.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-text mb-2">{step.title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                    <span className="absolute bottom-4 right-6 text-6xl font-black text-text/5 leading-none select-none z-0">
                      {step.number}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
