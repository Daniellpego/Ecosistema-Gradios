"use client";

import Image from "next/image";

const clientLogos = [
  { src: "/logo-cliente-1.webp", alt: "Logo da Soma Contabilidade, cliente Gradios" },
  { src: "/logo-cliente-2.webp", alt: "Logo de empresa cliente do setor de saúde" },
  { src: "/logo-cliente-3.webp", alt: "Logo de empresa cliente do setor de varejo" },
  { src: "/logo-cliente-4.webp", alt: "Logo de empresa cliente do setor financeiro" },
  { src: "/logo-cliente-5.webp", alt: "Logo de empresa cliente do setor de serviços" },
  { src: "/logo-cliente-6.webp", alt: "Logo de empresa cliente do setor de logística" },
  { src: "/logo-cliente-7.webp", alt: "Logo de empresa cliente do setor industrial" },
  { src: "/logo-cliente-8.webp", alt: "Logo de empresa cliente do setor de tecnologia" },
  { src: "/logo-cliente-9.webp", alt: "Logo de empresa cliente do setor de distribuição" },
];

export function LogoStrip() {
  const logos = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section className="bg-white py-12 border-t border-b border-card-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <p className="text-sm text-text-muted tracking-wide text-center mb-8 font-medium">
          Empresas que confiam na Gradios:
        </p>

        <div className="relative overflow-hidden marquee-container">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          {/* Marquee */}
          <div className="flex animate-marquee whitespace-nowrap gap-12 lg:gap-16 w-max items-center">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 h-10 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
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
      </div>
    </section>
  );
}
