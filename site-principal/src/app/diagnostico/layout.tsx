import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Gratuito de Automação | Gradios",
  description: "Descubra em 2 minutos quanto sua empresa perde por mês com processos manuais. Diagnóstico personalizado por IA com plano de ação.",
  openGraph: {
    title: "Diagnóstico Gratuito de Automação | Gradios",
    description: "Descubra em 2 minutos quanto sua empresa perde com processos manuais. Resultado por IA.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
