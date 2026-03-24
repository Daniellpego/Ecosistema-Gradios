import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScrollProvider } from "@/providers/smooth-scroll";

const inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Gradios | Elimine processos manuais e escale sua operação B2B',
  description: 'Engenharia de software e IA para eliminar gargalos operacionais. Resultado em 14 dias. Diagnóstico gratuito.',
  keywords: ["automação b2b", "automação de processos", "desenvolvimento de software sob medida", "integração de sistemas", "dashboards empresariais", "ia para negócios", "software empresarial", "automação Londrina"],
  authors: [{ name: "Gradios Soluções em Tecnologia" }],
  metadataBase: new URL("https://gradios.com.br"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Gradios | Elimine processos manuais e escale sua operação B2B",
    description: "Engenharia de software e IA para eliminar gargalos operacionais. Resultado em 14 dias. Diagnóstico gratuito.",
    siteName: "Gradios",
    locale: "pt_BR",
    url: "https://gradios.com.br",
    images: [{ url: "/logo.webp", width: 200, height: 200, alt: "Gradios - Automação B2B" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradios | Elimine processos manuais e escale sua operação B2B",
    description: "Engenharia de software e IA para eliminar gargalos operacionais. Resultado em 14 dias.",
    images: ["/logo.webp"],
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#2546BD" },
};

/* ── JSON-LD: Organization + LocalBusiness ── */
const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": "https://gradios.com.br/#organization",
  name: "Gradios Soluções em Tecnologia",
  legalName: "Gradios Soluções em Tecnologia LTDA",
  url: "https://gradios.com.br",
  logo: "https://gradios.com.br/logo.webp",
  description: "Empresa de engenharia de software e automação B2B especializada em eliminar processos manuais. Automação de processos, desenvolvimento sob medida, integrações de sistemas, dashboards empresariais e IA aplicada ao negócio.",
  foundingDate: "2024",
  areaServed: "BR",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Londrina",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+5543988372540",
    contactType: "sales",
    availableLanguage: "Portuguese",
  },
  email: "contato@gradios.com.br",
  sameAs: [
    "https://www.instagram.com/gradios",
    "https://www.linkedin.com/company/gradios",
  ],
  founder: [
    {
      "@type": "Person",
      name: "Gustavo Batista",
      jobTitle: "Co-fundador & Head de Automação",
      image: "https://gradios.com.br/gustavo-batista.webp",
      worksFor: { "@id": "https://gradios.com.br/#organization" },
    },
    {
      "@type": "Person",
      name: "Daniel Pego",
      jobTitle: "Co-fundador & Head de Engenharia",
      image: "https://gradios.com.br/daniel-pego.webp",
      worksFor: { "@id": "https://gradios.com.br/#organization" },
    },
    {
      "@type": "Person",
      name: "Bryan Gradi",
      jobTitle: "Co-fundador & Head Comercial",
      image: "https://gradios.com.br/bryan-gradi.webp",
      worksFor: { "@id": "https://gradios.com.br/#organization" },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços Gradios",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automação de Processos B2B", description: "Automação de aprovações, relatórios, integrações e notificações sem intervenção humana." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Desenvolvimento de Software Sob Medida", description: "Sistemas customizados para a operação da sua empresa, do zero, no prazo." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Integrações e APIs", description: "Conexão entre ERPs, CRMs, planilhas e ferramentas num fluxo único automatizado." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Dashboards e Relatórios", description: "KPIs em tempo real para decisões baseadas em dados." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "IA Aplicada ao Negócio", description: "Inteligência artificial integrada ao fluxo operacional para análise, atendimento e decisão." } },
    ],
  },
};

/* ── JSON-LD: FAQPage ── */
const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Quanto custa automatizar meus processos?", acceptedAnswer: { "@type": "Answer", text: "Projetos de automação na Gradios variam de R$ 3.000 a R$ 30.000 dependendo do escopo e complexidade. O diagnóstico gratuito define exatamente qual faixa faz sentido para sua operação. A maioria dos clientes recupera o investimento em menos de 3 meses." } },
    { "@type": "Question", name: "Quanto tempo leva para implementar?", acceptedAnswer: { "@type": "Answer", text: "Automações simples ficam prontas em 5 a 10 dias. Projetos mais complexos levam de 3 a 6 semanas. No diagnóstico gratuito, você recebe um cronograma realista antes de comprometer qualquer investimento." } },
    { "@type": "Question", name: "Preciso trocar os sistemas que já uso?", acceptedAnswer: { "@type": "Answer", text: "Não. A automação integra os sistemas que você já tem: ERP, CRM, planilhas, WhatsApp, e-mail. A Gradios não substitui nada, conecta tudo." } },
    { "@type": "Question", name: "Precisa de contrato longo?", acceptedAnswer: { "@type": "Answer", text: "Não. Trabalhamos com escopo definido e transparente. Você paga pelo que foi combinado, sem amarras." } },
    { "@type": "Question", name: "E se eu fizer o diagnóstico e não quiser contratar?", acceptedAnswer: { "@type": "Answer", text: "Sem problema. O diagnóstico da Gradios é gratuito e sem compromisso. Você recebe um relatório com os gargalos identificados e pode implementar por conta própria." } },
    { "@type": "Question", name: "O que acontece depois da implementação?", acceptedAnswer: { "@type": "Answer", text: "A Gradios oferece suporte contínuo. Monitoramos as automações, fazemos ajustes quando necessário e identificamos novas oportunidades de otimização." } },
  ],
};

/* ── JSON-LD: HowTo (Como Funciona) ── */
const jsonLdHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Como automatizar processos com a Gradios",
  description: "Processo em 3 etapas para eliminar processos manuais da sua empresa.",
  step: [
    { "@type": "HowToStep", position: 1, name: "Diagnóstico Gratuito", text: "Mapeamos seu processo atual, identificamos gargalos e mostramos onde a automação gera mais resultado. Antes de gastar R$ 1." },
    { "@type": "HowToStep", position: 2, name: "Solução Desenvolvida", text: "Desenvolvemos a solução sob medida: automação, software ou integração. Entregas rápidas, validadas em cada etapa." },
    { "@type": "HowToStep", position: 3, name: "Automação Rodando", text: "Colocamos em produção, treinamos seu time e acompanhamos os primeiros resultados. Suporte contínuo incluso." },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#2546BD" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <SmoothScrollProvider>
          <a
            href="#conteudo-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
          >
            Pular para o conteúdo principal
          </a>
          <ScrollProgress />
          <Navbar />
          <main id="conteudo-principal" className="min-h-screen pt-20">
            {children}
          </main>
          <Footer />
          <WhatsAppFab />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
