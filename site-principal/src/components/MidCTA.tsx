"use client";
import Link from "next/link";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useAnimations";

export function MidCTA() {
  const title = useScrollReveal('scale', 0, 0.1);
  const { ref, getChildProps } = useStaggerReveal(0.1);

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 animated-gradient-mesh -z-10" />
      {/* Diagonal texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] -z-[5]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)',
        backgroundSize: '16px 16px',
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative" ref={ref}>
        <h2
          ref={title.ref}
          className={`text-3xl lg:text-5xl font-bold text-white leading-tight mb-4 ${title.className}`}
          style={title.style}
        >
          Descubra quanto sua empresa<br className="hidden md:block" /> perde com processos manuais
        </h2>

        {(() => {
          const child = getChildProps(0, 'up', 150);
          return (
            <p className={`text-white/80 text-lg mb-6 max-w-2xl mx-auto ${child.className}`} style={child.style}>
              Responda 5 perguntas rápidas (leva 2 minutos) e receba um diagnóstico gratuito mostrando:
            </p>
          );
        })()}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
          {[
            "Quais processos automatizar agora",
            "Quanto tempo e dinheiro economizar",
            "Plano de ação personalizado"
          ].map((item, i) => {
            const child = getChildProps(i + 1, 'up', 120);
            return (
              <div key={i} className={`flex items-center gap-2 ${child.className}`} style={child.style}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-white font-medium">{item}</span>
              </div>
            );
          })}
        </div>

        {(() => {
          const child = getChildProps(4, 'scale', 120);
          return (
            <div className={child.className} style={child.style}>
              <Link
                href="/diagnostico"
                className="inline-block bg-white text-primary rounded-pill px-8 py-4 font-bold text-lg hover:bg-white/90 hover:shadow-xl transition-all relative overflow-hidden before:absolute before:inset-0 before:bg-primary/5 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
              >
                Fazer meu diagnóstico gratuito →
              </Link>
              <p className="text-white/60 text-sm mt-4">
                100% gratuito · Sem compromisso · Resultado na hora
              </p>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
