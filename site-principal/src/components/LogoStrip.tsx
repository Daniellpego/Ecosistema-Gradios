"use client";

export function LogoStrip() {
  const logos = [
    "Varejo",
    "Indústria",
    "Logística",
    "Saúde",
    "Financeiro",
    "SaaS"
  ];

  return (
    <section className="bg-white py-12 border-t border-b border-card-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <p className="text-sm text-text-muted tracking-wide text-center mb-8 font-medium">
          Construído para empresas que operam assim:
        </p>
        
        <div className="relative overflow-hidden marquee-container">
          {/* Máscara esquerda */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          {/* Máscara direita */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          {/* marquee — pausa no hover */}
          <div className="flex animate-marquee whitespace-nowrap gap-12 lg:gap-16 w-max">
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="text-text-muted/40 font-bold text-lg lg:text-xl tracking-tight select-none flex-shrink-0 hover:text-primary/40 transition-colors"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
