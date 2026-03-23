import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";

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

// JSON-LD Schema Markup
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gradios Soluções em Tecnologia",
  url: "https://gradios.com.br",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        <Navbar />
        <main id="conteudo-principal" className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
