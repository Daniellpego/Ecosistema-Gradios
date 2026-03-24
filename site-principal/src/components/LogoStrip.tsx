"use client";

import Image from "next/image";

const clientLogos = [
  { src: "/logo-cliente-1.webp", alt: "Soma Contabilidade" },
  { src: "/logo-cliente-2.webp", alt: "Cliente setor saúde" },
  { src: "/logo-cliente-3.webp", alt: "Cliente setor varejo" },
  { src: "/logo-cliente-4.webp", alt: "Cliente setor financeiro" },
  { src: "/logo-cliente-5.webp", alt: "Cliente setor serviços" },
  { src: "/logo-cliente-6.webp", alt: "Cliente setor logística" },
  { src: "/logo-cliente-7.webp", alt: "Cliente setor industrial" },
  { src: "/logo-cliente-8.webp", alt: "Cliente setor tecnologia" },
  { src: "/logo-cliente-9.webp", alt: "Cliente setor distribuição" },
];

const setores = [
  "Clínicas", "Varejo", "Atacado", "Mercados", "Barbearias",
  "Contabilidade", "Logística", "Indústria", "Saúde", "SaaS",
  "Financeiro", "Serviços B2B",
];

export function LogoStrip() {
  const logos = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section className="bg-white py-12 border-t border-b border-card-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Logos dos clientes — sem título, só marquee */}
        <div className="relative overflow-hidden marquee-container mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap gap-10 lg:gap-14 w-max items-center">
            {logos.map((logo, index) => (
              <div key={index} className="flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Setores atendidos */}
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
