import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Rápido — Descubra o Gargalo da Sua Operação | Gradios",
  description: "3 perguntas. 30 segundos. Descubra o que trava sua empresa e receba uma análise personalizada no WhatsApp. 100% grátis.",
  openGraph: {
    title: "Diagnóstico Rápido — O Que Trava Sua Empresa?",
    description: "3 perguntas rápidas e a gente te mostra por onde começar. Resultado no WhatsApp.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function DiagnosticoRapidoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
