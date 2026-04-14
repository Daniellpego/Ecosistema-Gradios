import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Non-critical UX enhancements — lazy load to reduce initial JS bundle
const ScrollProgress = dynamic(() => import("@/components/ScrollProgress").then(m => m.ScrollProgress), { ssr: false });
const SmoothScrollProvider = dynamic(() => import("@/providers/smooth-scroll").then(m => m.SmoothScrollProvider), { ssr: false });
const WhatsAppFloat = dynamic(() => import("@/components/WhatsAppFloat").then(m => m.WhatsAppFloat), { ssr: false });
const StickyCtaBar = dynamic(() => import("@/components/StickyCtaBar").then(m => m.StickyCtaBar), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/CookieBanner").then(m => m.CookieBanner), { ssr: false });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Gradios | Automação de Processos B2B e Software Sob Medida',
  description: 'Automação de processos B2B e software sob medida. Elimine 40h/mês de retrabalho manual com integrações, dashboards e IA. Diagnóstico gratuito.',
  keywords: [
    "automação de processos B2B",
    "software sob medida",
    "integração ERP CRM",
    "automação Londrina",
    "dashboard empresarial",
    "n8n make automação",
    "desenvolvimento sob medida",
    "IA aplicada ao negócio",
  ],
  authors: [{ name: "Gradios Soluções em Tecnologia" }],
  metadataBase: new URL("https://gradios.co"),
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "https://gradios.co",
      "x-default": "https://gradios.co",
    },
  },
  openGraph: {
    type: "website",
    title: "Gradios | Automação de Processos B2B e Software Sob Medida",
    description: "Automação de processos B2B e software sob medida. Integrações, dashboards e IA para eliminar gargalos operacionais. Diagnóstico gratuito.",
    siteName: "Gradios",
    locale: "pt_BR",
    url: "https://gradios.co",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Gradios - Automação de Processos B2B e Software Sob Medida" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradios | Automação de Processos B2B e Software Sob Medida",
    description: "Automação de processos B2B e software sob medida. Integrações, dashboards e IA para eliminar gargalos operacionais.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#2546BD" },
};

/* ── JSON-LD: Organization + LocalBusiness + ProfessionalService ── */
const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
  "@id": "https://gradios.co/#organization",
  name: "Gradios Soluções em Tecnologia",
  alternateName: "Gradios",
  legalName: "Gradios Soluções em Tecnologia LTDA",
  url: "https://gradios.co",
  logo: {
    "@type": "ImageObject",
    url: "https://gradios.co/logo.webp",
    width: 200,
    height: 183,
  },
  image: "https://gradios.co/logo.webp",
  description: "Empresa de engenharia de software e automação B2B especializada em eliminar processos manuais. Automação de processos, desenvolvimento sob medida, integrações de sistemas, dashboards empresariais e IA aplicada ao negócio.",
  slogan: "Automação de processos B2B e software sob medida que eliminam retrabalho manual.",
  foundingDate: "2024",
  taxID: "65.663.208/0001-36",
  vatID: "65.663.208/0001-36",
  priceRange: "R$ 3.000 - R$ 30.000",
  currenciesAccepted: "BRL",
  paymentAccepted: "PIX, Boleto, Cartão de Crédito, Transferência Bancária",
  knowsLanguage: ["pt-BR", "Portuguese"],
  knowsAbout: [
    "Automação de Processos B2B",
    "Software Sob Medida",
    "Integração de Sistemas",
    "Dashboards Empresariais",
    "Inteligência Artificial Aplicada",
    "Engenharia de Software",
    "Desenvolvimento Web",
    "APIs e Webhooks",
    "ERP, CRM, WhatsApp Business",
  ],
  areaServed: [
    { "@type": "Country", name: "Brasil" },
    { "@type": "State", name: "Paraná" },
    { "@type": "City", name: "Londrina" },
    { "@type": "City", name: "Maringá" },
    { "@type": "City", name: "Curitiba" },
    { "@type": "City", name: "São Paulo" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Londrina",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -23.3045,
    longitude: -51.1696,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+5543988372540",
      contactType: "sales",
      availableLanguage: ["Portuguese", "pt-BR"],
      areaServed: "BR",
      contactOption: "TollFree",
    },
    {
      "@type": "ContactPoint",
      telephone: "+5543988372540",
      contactType: "customer support",
      availableLanguage: ["Portuguese", "pt-BR"],
      areaServed: "BR",
    },
  ],
  email: "contato@gradios.com.br",
  sameAs: [
    "https://www.instagram.com/gradios.ai/",
    "https://www.linkedin.com/company/gradios",
    "https://www.facebook.com/gradios",
    "https://x.com/gradiosco",
    "https://www.youtube.com/@gradios",
  ],
  founder: [
    {
      "@type": "Person",
      name: "Gustavo Batista",
      jobTitle: "Co-fundador & Head de Automação",
      image: "https://gradios.co/gustavo-batista.webp",
      worksFor: { "@id": "https://gradios.co/#organization" },
    },
    {
      "@type": "Person",
      name: "Daniel Pego",
      jobTitle: "Co-fundador & Head de Engenharia",
      image: "https://gradios.co/daniel-pego.webp",
      worksFor: { "@id": "https://gradios.co/#organization" },
    },
    {
      "@type": "Person",
      name: "Bryan Gradi",
      jobTitle: "Co-fundador & Head Comercial",
      image: "https://gradios.co/bryan-gradi.webp",
      worksFor: { "@id": "https://gradios.co/#organization" },
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
      // Serviços por nicho — automação, software, site, dashboard e IA pra cada setor em Londrina
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Clínicas e Consultórios em Londrina", description: "Automação de agendamento, atendimento 24/7 via WhatsApp com IA, software de gestão de pacientes, site profissional e dashboard de consultas para clínicas em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Contabilidade em Londrina", description: "Software contábil sob medida, automação de processos fiscais, site profissional, dashboard financeiro e IA para análise de dados em escritórios de contabilidade em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Imobiliárias em Londrina", description: "CRM imobiliário, software de gestão, site com busca de imóveis, dashboard de vendas, automação de leads e IA para atendimento em imobiliárias de Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Indústria em Londrina", description: "Software industrial sob medida, automação de produção, painel de controle operacional, dashboard de KPIs e IA preditiva para indústrias em Londrina e norte do Paraná." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Varejo e Comércio em Londrina", description: "Sistema de gestão de loja, site e e-commerce, automação de estoque, dashboard de vendas e IA para previsão de demanda em comércios de Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Distribuidoras e Atacado em Londrina", description: "Software de gestão, catálogo digital, automação de pedidos, dashboard logístico e integração com ERPs para distribuidoras em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Logística e Transportadoras em Londrina", description: "Software de gestão de frotas, painel de rastreamento, automação de documentos, dashboard operacional e IA para roteirização em transportadoras de Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Agronegócio em Londrina", description: "Software de gestão agrícola, dashboard de safra, automação de processos, painel financeiro e IA para análise de dados no agronegócio do norte do Paraná." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Restaurantes em Londrina", description: "Sistema de pedidos, cardápio digital, site do restaurante, automação de delivery, dashboard de vendas e IA para gestão de cozinha em restaurantes de Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Academias em Londrina", description: "Software de gestão de alunos, site da academia, automação de cobranças, dashboard de frequência e agendamento inteligente para academias em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Escritórios de Advocacia em Londrina", description: "Software jurídico sob medida, site profissional, automação de prazos e documentos, dashboard de processos e IA para pesquisa jurídica em escritórios de Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Construtoras em Londrina", description: "Software de gestão de obras, painel de projetos, automação de cronograma, dashboard de custos e integração com sistemas para construtoras em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Oficinas Mecânicas em Londrina", description: "Sistema de ordens de serviço, site da oficina, automação de orçamentos, dashboard de peças e gestão de clientes para oficinas em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Escolas em Londrina", description: "Software de gestão escolar, site da escola, automação de matrículas, dashboard pedagógico e comunicação automática com pais para escolas em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Soluções para Salões e Barbearias em Londrina", description: "Sistema de agendamento online, site profissional, automação de lembretes, dashboard de clientes e gestão financeira para salões e barbearias em Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Criação de Sites em Londrina", description: "Sites institucionais, landing pages, portais corporativos e e-commerce com design profissional e performance otimizada para empresas de Londrina." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Criação de Dashboards e Painéis em Londrina", description: "Dashboards em tempo real, painéis de gestão, relatórios automatizados e business intelligence para empresas de Londrina." } },
    ],
  },
};

/* ── JSON-LD: FAQPage ── */
const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Quanto custa automatizar meus processos?", acceptedAnswer: { "@type": "Answer", text: "Nossos projetos variam de R$ 3.000 a R$ 30.000 dependendo do escopo e complexidade. O diagnóstico gratuito define exatamente qual faixa faz sentido para sua operação. A maioria dos nossos clientes recupera o investimento em menos de 3 meses." } },
    { "@type": "Question", name: "Quanto tempo leva para implementar?", acceptedAnswer: { "@type": "Answer", text: "Automações simples ficam prontas em 5-10 dias. Projetos mais complexos levam de 3 a 6 semanas. No diagnóstico gratuito, você recebe um cronograma realista antes de comprometer qualquer investimento." } },
    { "@type": "Question", name: "Preciso trocar os sistemas que já uso?", acceptedAnswer: { "@type": "Answer", text: "Não. A automação integra os sistemas que você já tem: ERP, CRM, planilhas, WhatsApp, e-mail. Não substituímos nada, conectamos tudo." } },
    { "@type": "Question", name: "Precisa de contrato longo?", acceptedAnswer: { "@type": "Answer", text: "Não. Trabalhamos com escopo definido e transparente. Você paga pelo que foi combinado, sem amarras. Se quiser continuar, a gente continua. Simples assim." } },
    { "@type": "Question", name: "E se eu fizer o diagnóstico e não quiser contratar?", acceptedAnswer: { "@type": "Answer", text: "Sem problema nenhum. O diagnóstico é gratuito e sem compromisso. Você recebe um relatório com os gargalos identificados e pode implementar por conta própria se preferir." } },
    { "@type": "Question", name: "O que acontece depois da implementação?", acceptedAnswer: { "@type": "Answer", text: "Oferecemos suporte contínuo. Monitoramos as automações, fazemos ajustes quando necessário e identificamos novas oportunidades de otimização. Não entregamos e sumimos." } },
  ],
};

/* ── JSON-LD: WebSite (Search Action) ── */
const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gradios",
  url: "https://gradios.co",
  publisher: { "@id": "https://gradios.co/#organization" },
  inLanguage: "pt-BR",
};

/* ── JSON-LD: HowTo (Como Funciona) ── */
const jsonLdHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Como automatizar processos com a Gradios",
  description: "Processo em 3 etapas para eliminar processos manuais da sua empresa.",
  totalTime: "P14D",
  estimatedCost: { "@type": "MonetaryAmount", currency: "BRL", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Diagnóstico Gratuito", text: "Mapeamos seu processo atual, identificamos gargalos e mostramos onde a automação gera mais resultado. Antes de gastar R$ 1." },
    { "@type": "HowToStep", position: 2, name: "Solução Desenvolvida", text: "Desenvolvemos a solução sob medida: automação, software ou integração. Entregas rápidas, validadas em cada etapa." },
    { "@type": "HowToStep", position: 3, name: "Automação Rodando", text: "Colocamos em produção, treinamos seu time e acompanhamos os primeiros resultados. Suporte contínuo incluso." },
  ],
};

/* ── JSON-LD: BreadcrumbList global (home) ── */
const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: "https://gradios.co" },
  ],
};

/* ── JSON-LD: Service schemas individuais ── */
const jsonLdServices = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://gradios.co/#service-automacao",
      name: "Automação de Processos B2B",
      serviceType: "Automação de Processos",
      provider: { "@id": "https://gradios.co/#organization" },
      areaServed: { "@type": "Country", name: "Brasil" },
      description: "Automação de aprovações, cobranças, relatórios, integrações e notificações sem intervenção humana. Eliminamos retrabalho manual e devolvemos 40h/mês ao seu time.",
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        priceSpecification: { "@type": "PriceSpecification", priceCurrency: "BRL", price: "3000", minPrice: "3000", maxPrice: "30000" },
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "Service",
      "@id": "https://gradios.co/#service-software",
      name: "Desenvolvimento de Software Sob Medida",
      serviceType: "Desenvolvimento de Software",
      provider: { "@id": "https://gradios.co/#organization" },
      areaServed: { "@type": "Country", name: "Brasil" },
      description: "Sistemas customizados para a operação da sua empresa, do zero, no prazo. Web, mobile e desktop com tecnologia moderna (Next.js, TypeScript, Supabase).",
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        priceSpecification: { "@type": "PriceSpecification", priceCurrency: "BRL", price: "5000", minPrice: "5000", maxPrice: "30000" },
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "Service",
      "@id": "https://gradios.co/#service-integracoes",
      name: "Integrações de Sistemas e APIs",
      serviceType: "Integração de Sistemas",
      provider: { "@id": "https://gradios.co/#organization" },
      areaServed: { "@type": "Country", name: "Brasil" },
      description: "Conectamos ERP, CRM, planilhas, WhatsApp Business, e-mail e ferramentas legadas em um fluxo único automatizado. Webhooks, APIs REST e middleware customizado.",
    },
    {
      "@type": "Service",
      "@id": "https://gradios.co/#service-dashboards",
      name: "Dashboards e Relatórios em Tempo Real",
      serviceType: "Business Intelligence",
      provider: { "@id": "https://gradios.co/#organization" },
      areaServed: { "@type": "Country", name: "Brasil" },
      description: "KPIs, métricas e relatórios automatizados em dashboards web responsivos. Decisões baseadas em dados, não em achismo.",
    },
    {
      "@type": "Service",
      "@id": "https://gradios.co/#service-ia",
      name: "Inteligência Artificial Aplicada ao Negócio",
      serviceType: "IA para Empresas",
      provider: { "@id": "https://gradios.co/#organization" },
      areaServed: { "@type": "Country", name: "Brasil" },
      description: "Inteligência artificial integrada ao fluxo operacional para análise, atendimento, classificação e tomada de decisão. LLMs, RAG, agents e automação inteligente.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="pt-BR">
      <head>
        <meta name="google-site-verification" content="7nYceyn4iiumWyr4hgV86mujYqaRa3Ni_qNShP5S67E" />
        <link rel="alternate" type="application/rss+xml" title="Blog Gradios" href="/blog/feed.xml" />
        <meta name="theme-color" content="#2546BD" />

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        {gaId && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          </>
        )}

        {/* Google Analytics 4 — gtag.js */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });
                `.trim(),
              }}
            />
          </>
        )}

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1826186485006703');
fbq('track', 'PageView');
            `.trim(),
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <noscript>
          <img
            alt="Meta Pixel"
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1826186485006703&ev=PageView&noscript=1"
          />
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdServices) }}
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
          <StickyCtaBar />
          <Navbar />
          <main id="conteudo-principal" className="min-h-screen pt-20">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <CookieBanner />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
