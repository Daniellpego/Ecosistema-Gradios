import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ScrollProgress } from "@/components/ScrollProgress";
import { FloatingShapes } from "@/components/FloatingShapes";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  display: "swap",
});

const geistDisplay = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Gradios | Engenharia Neural para Empresas Inteligentes',
  description: 'Transforme sua empresa com a Gradios. Especialistas em automação inteligente e sistemas neurais de alta escala.',
  keywords: ["automação b2b", "desenvolvimento de software sob medida", "integração de sistemas", "dashboards empresariais", "ia para negócios"],
  authors: [{ name: "Gradios" }],
  openGraph: {
    type: "website",
    description: "Menos processo manual. Mais escala. Software que resolve de verdade.",
    siteName: "Gradios",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradios | O Cérebro da Sua Empresa",
    description: "Menos processo manual. Mais escala. Software que resolve de verdade.",
  },
  robots: { index: true, follow: true },
};

// JSON-LD Schema Markup — Organization
const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gradios Soluções em Tecnologia",
  url: "https://gradios.co",
  description: "Automação de processos, desenvolvimento de software sob medida e integração de sistemas para empresas B2B.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Londrina",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-43-98837-2540",
    contactType: "sales",
    availableLanguage: "Portuguese",
  },
  email: "contato@gradios.com.br",
  sameAs: [
    "https://www.instagram.com/gradios",
    "https://www.linkedin.com/company/gradios",
  ],
};

// JSON-LD Schema Markup — FAQPage
const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quanto custa automatizar meus processos?", "acceptedAnswer": { "@type": "Answer", "text": "Depende da complexidade. Nossos projetos variam conforme o escopo, mas o diagnóstico gratuito identifica exatamente o que faz sentido para sua empresa. A maioria dos nossos clientes recupera o investimento em menos de 3 meses." } },
    { "@type": "Question", "name": "Quanto tempo leva para implementar?", "acceptedAnswer": { "@type": "Answer", "text": "Automações simples ficam prontas em 5-10 dias. Projetos mais complexos levam de 3 a 6 semanas." } },
    { "@type": "Question", "name": "Preciso trocar os sistemas que já uso?", "acceptedAnswer": { "@type": "Answer", "text": "Não. A automação integra os sistemas que você já tem: ERP, CRM, planilhas, WhatsApp, e-mail. Não substituímos nada, conectamos tudo." } },
    { "@type": "Question", "name": "Precisa de contrato longo?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Trabalhamos com escopo definido e transparente. Você paga pelo que foi combinado, sem amarras." } },
    { "@type": "Question", "name": "E se eu fizer o diagnóstico e não quiser contratar?", "acceptedAnswer": { "@type": "Answer", "text": "Sem problema nenhum. O diagnóstico é gratuito e sem compromisso." } },
    { "@type": "Question", "name": "Funciona pro meu setor?", "acceptedAnswer": { "@type": "Answer", "text": "Se sua empresa tem processos manuais, planilhas sendo copiadas, ou sistemas que não conversam entre si, a gente resolve. Já atuamos em varejo, saúde, financeiro, logística, serviços e SaaS." } },
    { "@type": "Question", "name": "O que acontece depois da implementação?", "acceptedAnswer": { "@type": "Answer", "text": "Oferecemos suporte contínuo. Monitoramos as automações, fazemos ajustes quando necessário e identificamos novas oportunidades de otimização." } },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://gradios.co/" />
        <meta name="robots" content="index, follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body className={`${geist.variable} ${geistDisplay.variable} font-sans`}>
        {/* Skip-link de acessibilidade */}
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Pular para o conteúdo principal
        </a>
        <ScrollProgress />
        <FloatingShapes />
        <Navbar />
        <main id="conteudo-principal" className="min-h-screen pt-20 relative z-[2]">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
