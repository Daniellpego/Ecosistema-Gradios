import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sua Empresa Perde R$ 8k-47k/Mês? Descubra em 2min (Grátis) | Gradios",
  description: "Diagnóstico Gradios calcula o custo REAL do retrabalho na sua operação. Resultado instantâneo com plano de ação. 8 setores, 200+ empresas. 100% grátis.",
  alternates: { canonical: "/diagnostico" },
  openGraph: {
    title: "Descubra Quanto Sua Empresa Perde Por Mês em Retrabalho",
    description: "2 minutos. Resultado com custo em R$ e plano de ação personalizado. Usado por 200+ empresas.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Diagnóstico Gratuito de Automação — Gradios</h1>
      {children}
    </>
  );
}
