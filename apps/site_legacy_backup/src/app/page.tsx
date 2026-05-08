import { Hero } from "@/components/Hero";
import { LogoStrip } from "@/components/LogoStrip";
import { Benefits } from "@/components/Benefits";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Testimonials } from "@/components/Testimonials";
import { MidCTA } from "@/components/MidCTA";
import { Founders } from "@/components/Founders";
import { FAQ } from "@/components/FAQ";
import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <LogoStrip />
      {/* SEO/GEO content block — server-rendered, sempre presente no HTML inicial */}
      <section
        aria-label="Sobre a Gradios — automação de processos B2B e software sob medida"
        className="bg-white border-b border-card-border py-10 lg:py-14"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-4 leading-tight">
            Automação de processos B2B e software sob medida em Londrina e todo o Brasil
          </h2>
          <p className="text-text-muted leading-relaxed text-base lg:text-lg max-w-3xl mx-auto">
            A <strong>Gradios</strong> é uma empresa de engenharia de software e
            automação B2B sediada em Londrina/PR. Desenvolvemos automação de
            processos, software sob medida, integrações de sistemas (ERP, CRM,
            WhatsApp e planilhas), dashboards empresariais em tempo real e
            inteligência artificial aplicada à operação. Atendemos clínicas,
            contabilidades, indústrias, distribuidoras, varejo, agronegócio,
            logística, escritórios de advocacia, construtoras e outras empresas
            B2B que querem eliminar retrabalho manual e escalar sem contratar
            proporcionalmente. Resultado em 14 dias, sem contrato longo,
            com diagnóstico gratuito.
          </p>
        </div>
      </section>
      <Benefits />
      <FeatureShowcase />
      <Testimonials />
      <MidCTA />
      <Founders />
      <FAQ />
      <LeadForm />
    </div>
  );
}
