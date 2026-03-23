"use client";
import { useInView } from "@/hooks/useAnimations";

export function Benefits() {
  const { ref, inView } = useInView();
  
  const benefits = [
    {
      title: "Automação de Processos",
      description: "Eliminamos tarefas repetitivas do seu time. Aprovações, relatórios, integrações e notificações. Tudo rodando sozinho enquanto você foca no negócio.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary solution-icon group-hover:scale-110 group-hover:text-secondary transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      visual: (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Eficiência</span>
            <span className="text-xs font-bold text-primary">85%</span>
          </div>
          <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full progress-bar" style={{ width: inView ? "85%" : "0%" }}></div>
          </div>
        </>
      )
    },
    {
      title: "Desenvolvimento Sob Medida",
      description: "Nada de solução genérica adaptada. Construímos exatamente o que sua operação precisa. Do zero. No prazo. Sem surpresas.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ),
      visual: (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Personalização</span>
            <span className="text-xs font-bold text-primary">75%</span>
          </div>
          <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full progress-bar" style={{ width: inView ? "75%" : "0%" }}></div>
          </div>
        </>
      )
    },
    {
      title: "Integrações e APIs",
      description: "Seu time para de copiar dado de um sistema pro outro. A gente conecta tudo e isso some da vida de vocês.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      ),
      visual: (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Conectividade</span>
            <span className="text-xs font-bold text-primary">90%</span>
          </div>
          <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full progress-bar" style={{ width: inView ? "90%" : "0%" }}></div>
          </div>
        </>
      )
    },
    {
      title: "Dashboards e Relatórios",
      description: "Chega de esperar o fechamento do mês. Visualize KPIs em tempo real e tome decisões com base em dados, não em achismos.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      visual: (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Visibilidade</span>
            <span className="text-xs font-bold text-primary">70%</span>
          </div>
          <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full progress-bar" style={{ width: inView ? "70%" : "0%" }}></div>
          </div>
        </>
      )
    },
    {
      title: "Suporte e Evolução Contínua",
      description: "Seu sistema evolui junto com seu negócio. Sem sumiço, sem retrabalho, sem ticket ignorado. Time dedicado do início ao fim.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>
      ),
      visual: (
        <div className="flex items-center gap-2 py-1">
          <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-text">Online agora</span>
        </div>
      )
    },
    {
      title: "IA Aplicada ao Negócio",
      description: "Automatizamos atendimento, análise de dados e tomada de decisão. IA aplicada direto no seu processo. Onde gera resultado real.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
        </svg>
      ),
      visual: (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Automação IA</span>
            <span className="text-xs font-bold text-primary">60%</span>
          </div>
          <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full progress-bar" style={{ width: inView ? "60%" : "0%" }}></div>
          </div>
        </>
      )
    }
  ];

  return (
    <section id="solucoes" className="bg-bg-alt py-16 lg:py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header da Seção */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6">
            Soluções
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4">
            Seu time ainda faz<br className="hidden md:block"/> isso na mão?
          </h2>
          <p className="text-text-muted text-lg text-center max-w-lg mx-auto">
            Entregamos resultado. Não só código.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 items-stretch">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`group solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between gap-4 h-full ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: inView ? `${index * 80}ms` : "0ms" }}
            >
              <div>
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{benefit.title}</h3>
                <p className="text-sm text-text-muted mb-6">{benefit.description}</p>
              </div>
              
              {/* Mini Visual CSS no Rodapé */}
              <div className="mt-4 pt-4 border-t border-card-border">
                {benefit.visual}
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
