"use client";
import { useInView, useCounter } from "@/hooks/useAnimations";
import Link from "next/link";

export function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const { ref, inView } = useInView(0.5);
  const count = useCounter(value, 2000, inView);
  return (
    <div ref={ref} className={`text-4xl font-bold font-display text-primary transition-all duration-700 ${
      inView ? "opacity-100 scale-100" : "opacity-0 scale-75"
    }`}>
      {count}{suffix}
    </div>
  );
}

export function Testimonials() {
  const { ref, inView } = useInView();

  return (
    <section id="cases" className="bg-bg-alt relative z-10 py-16 lg:py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6">
            Resultados Reais
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4">
            O que muda quando você<br className="hidden md:block"/> para de fazer no braço
          </h2>
          <p className="text-text-muted text-lg text-center max-w-xl mx-auto mt-4">
            Resultados concretos de quem trocou o manual pela automação.
          </p>
        </div>

        {/* Layout: 1 card grande + 2 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16 items-stretch">

          {/* Card principal — resultado real com ANTES/DEPOIS */}
          <div className={`lg:col-span-2 solution-card bg-white border border-card-border rounded-card p-8 flex flex-col justify-between gap-6 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Case em destaque — Setor Financeiro</span>
              </div>

              <p className="text-lg font-bold text-text mb-5">Fechamento financeiro mensal</p>

              {/* Before / After visual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200/60 rounded-xl p-5">
                  <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Antes</div>
                  <div className="text-3xl font-bold font-display text-red-600 mb-1">3 dias</div>
                  <p className="text-sm text-red-400">Processo manual, planilhas, erros frequentes</p>
                </div>
                <div className="bg-green-50 border border-green-200/60 rounded-xl p-5">
                  <div className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">Depois</div>
                  <div className="text-3xl font-bold font-display text-green-600 mb-1">4 horas</div>
                  <p className="text-sm text-green-500">Automatizado, sem erro, relatório pronto</p>
                </div>
              </div>

              <p className="text-text-muted leading-relaxed">
                Automação completa do fluxo de aprovações, conciliação bancária e geração de relatórios. Eliminamos 90% do trabalho manual.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-card-border">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">CF</span>
              </div>
              <div>
                <span className="text-sm text-text font-semibold block">CFO, empresa de serviços financeiros</span>
                <span className="text-xs text-text-muted italic">&ldquo;O fechamento que levava 3 dias agora termina antes do almoço.&rdquo;</span>
              </div>
            </div>
          </div>

          {/* Coluna direita: 2 cards empilhados */}
          <div className="flex flex-col gap-6">
            {/* Card de resultado secundário — com before/after */}
            <div className={`solution-card bg-white border border-card-border rounded-card p-6 flex-1 flex flex-col justify-between transition-all duration-700 delay-100 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-text-muted line-through">1x volume</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  <span className="text-xs font-bold text-green-600">3x volume</span>
                </div>
                <div className="text-3xl font-bold font-display text-text mb-2">3x</div>
                <p className="text-sm font-bold text-text mb-2">Volume sem contratar</p>
                <p className="text-sm text-text-muted">Triplicamos a capacidade de atendimento com automação de processos internos.</p>
              </div>
              <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[8px] font-bold">OP</span>
                </div>
                <span className="text-xs text-text-muted font-medium">Setor de serviços B2B</span>
              </div>
            </div>

            {/* Card convite honesto */}
            <div className={`bg-white border-2 border-dashed border-primary/20 rounded-card p-6 flex-1 flex flex-col items-center justify-center text-center transition-all duration-700 delay-200 hover:border-primary/40 hover:bg-primary/[0.02] ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
              <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <p className="text-sm font-bold text-text mb-2">Seu case aqui</p>
              <p className="text-xs text-text-muted mb-4">Queremos mostrar o seu resultado.</p>
              <Link href="#contato" className="text-xs font-bold text-primary hover:underline">
                Fale com a gente →
              </Link>
            </div>
          </div>
        </div>

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
