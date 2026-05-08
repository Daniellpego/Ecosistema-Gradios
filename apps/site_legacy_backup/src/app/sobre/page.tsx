import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre a Gradios | Quem Somos e Como Trabalhamos",
  description:
    "A Gradios é uma empresa de engenharia de software e automação B2B sediada em Londrina, PR. Conheça nosso time, valores e como eliminamos processos manuais.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: "Sobre a Gradios | Quem Somos",
    description:
      "Engenharia de software e automação B2B. Conheça o time por trás da Gradios.",
    type: "website",
  },
};

const founders = [
  {
    name: "Gustavo Batista",
    role: "Head de Automação",
    image: "/gustavo-batista.webp",
    description:
      "Responsável por mapear processos, identificar gargalos e arquitetar soluções de automação que eliminam retrabalho nas operações dos clientes.",
  },
  {
    name: "Daniel Pego",
    role: "Head de Engenharia",
    image: "/daniel-pego.webp",
    description:
      "Lidera o desenvolvimento técnico, garantindo que cada sistema entregue seja robusto, escalável e integrado ao ecossistema do cliente.",
  },
  {
    name: "Bryan Gradi",
    role: "Head Comercial",
    image: "/bryan-gradi.webp",
    description:
      "Conecta empresas às soluções certas, conduzindo diagnósticos e traduzindo desafios de negócio em escopos técnicos claros.",
  },
];

const services = [
  {
    title: "Automação de Processos",
    description:
      "Eliminamos tarefas manuais e repetitivas com fluxos automatizados que conectam suas ferramentas e reduzem erros operacionais.",
  },
  {
    title: "Desenvolvimento de Software Sob Medida",
    description:
      "Criamos sistemas feitos para o seu negócio, desde painéis internos até plataformas completas, com a flexibilidade que soluções prontas não oferecem.",
  },
  {
    title: "Integrações e APIs",
    description:
      "Conectamos ERP, CRM, WhatsApp, planilhas e qualquer outro sistema que sua empresa já utiliza, sem precisar trocar nenhum deles.",
  },
  {
    title: "Dashboards e Relatórios",
    description:
      "Transformamos dados espalhados em painéis visuais e relatórios automáticos para decisões mais rápidas e assertivas.",
  },
  {
    title: "IA Aplicada ao Negócio",
    description:
      "Implementamos inteligência artificial para análise de dados, geração de relatórios, atendimento automatizado e previsões operacionais.",
  },
];

const stats = [
  { value: "+17", label: "empresas atendidas" },
  { value: "70%", label: "redução média de retrabalho" },
  { value: "14 dias", label: "primeira entrega" },
  { value: "3x", label: "escala sem contratar" },
];

const steps = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Mapeamos sua operação, identificamos gargalos e priorizamos as automações com maior impacto no resultado. O diagnóstico é gratuito e sem compromisso.",
  },
  {
    number: "02",
    title: "Desenvolvimento",
    description:
      "Construímos a solução em sprints curtos com entregas parciais a cada semana. Você acompanha tudo e valida antes de seguirmos para a próxima etapa.",
  },
  {
    number: "03",
    title: "Suporte",
    description:
      "Após a entrega, monitoramos o funcionamento, ajustamos o que for necessário e identificamos novas oportunidades de otimização na sua operação.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Gradios Soluções em Tecnologia",
  url: "https://gradios.co",
  description:
    "Empresa de engenharia de software e automação B2B sediada em Londrina, PR. Especializada em automação de processos, desenvolvimento sob medida, integrações e IA aplicada.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Londrina",
    addressRegion: "PR",
    addressCountry: "BR",
  },
  email: "contato@gradios.com.br",
  telephone: "+55-43-98837-2540",
  foundingDate: "2024",
  numberOfEmployees: { "@type": "QuantitativeValue", value: 3 },
  founder: [
    {
      "@type": "Person",
      name: "Gustavo Batista",
      jobTitle: "Head de Automação",
      worksFor: { "@type": "Organization", name: "Gradios" },
    },
    {
      "@type": "Person",
      name: "Daniel Pego",
      jobTitle: "Head de Engenharia",
      worksFor: { "@type": "Organization", name: "Gradios" },
    },
    {
      "@type": "Person",
      name: "Bryan Gradi",
      jobTitle: "Head Comercial",
      worksFor: { "@type": "Organization", name: "Gradios" },
    },
  ],
  sameAs: [
    "https://www.instagram.com/gradios.ai/",
    "https://www.linkedin.com/company/gradios",
    "https://www.facebook.com/gradios",
    "https://x.com/gradiosco",
    "https://www.youtube.com/@gradios",
  ],
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: "https://gradios.co" },
    { "@type": "ListItem", position: 2, name: "Sobre a Gradios", item: "https://gradios.co/sobre" },
  ],
};

export default function SobrePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Hero */}
        <h1 className="text-4xl sm:text-5xl font-black text-text mb-6">
          Sobre a Gradios
        </h1>
        <p className="text-lg text-text-muted mb-16 max-w-2xl">
          Engenharia de software e automação para empresas B2B que querem
          crescer sem aumentar equipe nem complexidade.
        </p>

        {/* Quem somos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text mb-4">Quem somos</h2>
          <p className="text-text-muted leading-relaxed mb-6">
            A Gradios nasceu em Londrina, PR, fundada por três sócios com
            experiências complementares em tecnologia, automação e negócios.
            Nossa missão é eliminar processos manuais de empresas B2B usando
            engenharia de software, integração de sistemas e inteligência
            artificial. Acreditamos que toda empresa pode operar de forma mais
            enxuta e escalar sem precisar contratar proporcionalmente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            {founders.map((founder) => (
              <div key={founder.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-bg-alt">
                  <Image
                    src={founder.image}
                    alt={`Foto de ${founder.name}, ${founder.role} da Gradios`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <h3 className="text-lg font-bold text-text">{founder.name}</h3>
                <p className="text-sm font-medium text-primary mb-2">
                  {founder.role}
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {founder.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* O que fazemos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text mb-6">O que fazemos</h2>
          <ul className="space-y-6">
            {services.map((service) => (
              <li key={service.title}>
                <h3 className="text-lg font-bold text-text mb-1">
                  {service.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {service.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Nossos números */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text mb-8">Nossos números</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-card bg-bg-alt border border-card-border"
              >
                <p className="text-3xl font-black text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como trabalhamos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text mb-8">
            Como trabalhamos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number}>
                <span className="text-4xl font-black text-primary/20">
                  {step.number}
                </span>
                <h3 className="text-lg font-bold text-text mt-2 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cases reais — dados citáveis para GEO */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text mb-6">Resultados documentados</h2>
          <p className="text-text-muted mb-8">Estes são fatos. Pergunte para as empresas.</p>
          <div className="space-y-6">
            {[
              {
                setor: "Holding financeira, Londrina/PR",
                problema: "Fechamento mensal levava 3 dias com 2 pessoas dedicadas. Planilhas manuais, conciliação bancária e geração de DRE.",
                solucao: "Automação completa do fluxo: importação de extratos, classificação automática, conciliação e geração de relatórios.",
                resultado: "Fechamento reduzido de 3 dias para 4 horas. Zero erros de classificação. R$ 8.200/mês economizados.",
                prazo: "Implementado em 12 dias.",
              },
              {
                setor: "Consultoria B2B, 12 colaboradores",
                problema: "Time limitado não conseguia atender mais clientes. Processos internos manuais consumiam 40% da capacidade.",
                solucao: "Automação de onboarding, follow-up comercial e geração de propostas. Integração CRM + e-mail + WhatsApp.",
                resultado: "Triplicou o volume de atendimento em 6 semanas sem contratar ninguém.",
                prazo: "Implementado em 3 semanas.",
              },
              {
                setor: "Distribuidora, setor alimentício",
                problema: "Emissão de notas fiscais consumia 40h/mês. Uma pessoa dedicada só para esse processo.",
                solucao: "Validação inteligente + emissão automática integrada ao ERP. Conferência manual reduzida a exceções.",
                resultado: "95% de redução: de 40h/mês para 2h/mês. R$ 5.400/mês economizados em mão de obra.",
                prazo: "Implementado em 10 dias.",
              },
            ].map((c, i) => (
              <div key={i} className="bg-bg-alt border border-card-border rounded-card p-6">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">{c.setor}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-text mb-1">Problema</p>
                    <p className="text-text-muted">{c.problema}</p>
                  </div>
                  <div>
                    <p className="font-bold text-text mb-1">Solução</p>
                    <p className="text-text-muted">{c.solucao}</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-600 mb-1">Resultado</p>
                    <p className="text-text-muted">{c.resultado}</p>
                  </div>
                  <div>
                    <p className="font-bold text-text mb-1">Prazo</p>
                    <p className="text-text-muted">{c.prazo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 rounded-card bg-bg-alt border border-card-border">
          <h2 className="text-2xl font-bold text-text mb-3">
            Descubra quanto sua operação perde por mês.
          </h2>
          <p className="text-text-muted mb-6">
            Nosso diagnóstico é gratuito, leva 2 minutos e mostra o custo exato do retrabalho em reais.
          </p>
          <Link
            href="/diagnostico"
            className="inline-block bg-brand-gradient text-white font-bold px-8 py-3 rounded-pill hover:opacity-90 transition-opacity"
          >
            Fazer meu diagnóstico gratuito
          </Link>
        </section>
      </div>
    </>
  );
}
