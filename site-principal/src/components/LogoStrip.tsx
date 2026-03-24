"use client";

const setores = [
  "Clínicas", "Varejo", "Atacado", "Mercados", "Barbearias",
  "Contabilidade", "Logística", "Indústria", "Saúde", "SaaS",
  "Financeiro", "Serviços B2B",
];

export function LogoStrip() {
  return (
    <section className="bg-white py-10 border-t border-b border-card-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-text-muted/60 tracking-wide text-center mb-4 font-medium uppercase">
          Setores que já automatizaram
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {setores.map((setor, i) => (
            <span
              key={i}
              className="text-xs font-semibold text-text-muted/50 bg-bg-alt border border-card-border rounded-pill px-3 py-1 hover:text-primary hover:border-primary/20 transition-colors"
            >
              {setor}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
