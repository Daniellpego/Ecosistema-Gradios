"use client";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useAnimations";

export function Founders() {
  const header = useScrollReveal('up', 0, 0.1);
  const { ref, revealed, getChildProps } = useStaggerReveal(0.08);

  return (
    <section className="bg-bg-alt py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — scroll reveal */}
        <div className="flex flex-col items-center mb-12" ref={header.ref}>
          <div className={`inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6 ${header.className}`} style={header.style}>
            Quem Está Por Trás
          </div>
          <h2 className={`text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4 ${header.className}`} style={{ ...header.style, transitionDelay: '100ms' }}>
            Pessoas reais construindo<br className="hidden md:block" /> sua automação
          </h2>
          <p className={`text-text-muted text-lg text-center max-w-xl mx-auto ${header.className}`} style={{ ...header.style, transitionDelay: '200ms' }}>
            Não somos uma agência genérica. Somos engenheiros que entendem de processo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" ref={ref}>
          {/* Founder 1 — slide from right */}
          {(() => {
            const child = getChildProps(0, 'right', 200);
            return (
              <div className={`bg-white border border-card-border rounded-card p-8 solution-card ${child.className}`} style={child.style}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-white text-xl font-bold">GB</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">Gustavo Batista</h3>
                    <p className="text-sm text-primary font-medium">Co-fundador & Head de Automação</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                  Especialista em automação de processos B2B. Já ajudou dezenas de empresas a eliminar gargalos operacionais usando n8n, Make e integrações com IA. Foco em resultado, não em tecnologia pela tecnologia.
                </p>
                <blockquote className="text-sm text-text italic border-l-2 border-primary/30 pl-4 mb-6">
                  &ldquo;Eu criei a Gradios porque vi que a maioria das empresas perde dezenas de horas por semana em tarefas que deveriam ser automáticas. Meu trabalho é encontrar esses gargalos e eliminá-los.&rdquo;
                </blockquote>
                <a
                  href="https://www.linkedin.com/company/gradios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  Ver perfil no LinkedIn
                </a>
              </div>
            );
          })()}

          {/* Founder 2 — slide from left */}
          {(() => {
            const child = getChildProps(1, 'left', 200);
            return (
              <div className={`bg-white border border-card-border rounded-card p-8 solution-card ${child.className}`} style={child.style}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-white text-xl font-bold">DP</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">Daniel Pego</h3>
                    <p className="text-sm text-primary font-medium">Co-fundador & Head de Engenharia</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                  Engenheiro de software full-stack com experiência em arquitetura de sistemas, dashboards financeiros e integrações complexas. Construtor de soluções que escalam.
                </p>
                <blockquote className="text-sm text-text italic border-l-2 border-primary/30 pl-4 mb-6">
                  &ldquo;Cada empresa tem um jeito próprio de operar. A gente não força template — entende primeiro, constrói depois. É assim que se faz software que realmente funciona.&rdquo;
                </blockquote>
                <a
                  href="https://www.linkedin.com/company/gradios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  Ver perfil no LinkedIn
                </a>
              </div>
            );
          })()}
        </div>

        {/* Badges de parceria — stagger scale */}
        <div className={`flex flex-wrap items-center justify-center gap-4 mt-12 ${
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`} style={{ transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '500ms' }}>
          {["n8n Partner", "Make Certified", "Supabase", "Next.js"].map((badge, i) => (
            <div key={i} className="bg-white border border-card-border rounded-pill px-4 py-2 text-xs font-semibold text-text-muted hover:border-primary/30 hover:text-primary transition-all duration-300">
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
