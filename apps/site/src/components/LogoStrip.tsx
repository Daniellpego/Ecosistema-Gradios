"use client";

import Link from "next/link";

const setores = [
  { nome: "Clínicas", href: "/respostas#automacao" },
  { nome: "Varejo", href: "/respostas#automacao" },
  { nome: "Atacado", href: "/respostas#automacao" },
  { nome: "Mercados", href: "/respostas#automacao" },
  { nome: "Barbearias", href: "/respostas#automacao" },
  { nome: "Contabilidade", href: "/respostas#automacao" },
  { nome: "Logística", href: "/respostas#setores" },
  { nome: "Indústria", href: "/respostas#setores" },
  { nome: "Saúde", href: "/respostas#setores" },
  { nome: "SaaS", href: "/respostas#dev-sob-medida" },
  { nome: "Financeiro", href: "/respostas#automacao" },
  { nome: "Serviços B2B", href: "/respostas#sobre-a-gradios" },
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
            <Link
              key={i}
              href={setor.href}
              className="text-xs font-semibold text-text-muted/50 bg-bg-alt border border-card-border rounded-pill px-3 py-1 hover:text-primary hover:border-primary/20 transition-colors"
            >
              {setor.nome}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
