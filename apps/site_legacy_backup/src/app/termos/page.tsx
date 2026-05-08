import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Gradios",
  description: "Termos de uso da Gradios Soluções em Tecnologia.",
  alternates: { canonical: "/termos" },
  openGraph: {
    title: "Termos de Uso | Gradios",
    description: "Termos e condições de uso dos serviços da Gradios.",
    type: "website",
    url: "https://gradios.co/termos",
  },
};

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <h1 className="text-4xl font-bold text-white mb-8">Termos de Uso Gradios</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-text-muted text-sm leading-relaxed">
        <p><strong className="text-text">Última atualização:</strong> Março de 2026</p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar o site da Gradios Soluções em Tecnologia LTDA (CNPJ 65.663.208/0001-36),
          você concorda com estes Termos de Uso. Se não concorda, por favor não utilize nosso site.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">2. Serviços</h2>
        <p>
          A Gradios oferece serviços de automação de processos, desenvolvimento de software sob medida,
          integrações de sistemas, dashboards empresariais e consultoria em tecnologia para empresas.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">3. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo deste site, incluindo textos, gráficos, logos, ícones e software, é propriedade da
          Gradios e está protegido pelas leis brasileiras de propriedade intelectual.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">4. Limitação de Responsabilidade</h2>
        <p>
          As informações contidas neste site são fornecidas de boa-fé. A Gradios não garante que o site estará
          disponível de forma ininterrupta ou livre de erros.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">5. Contato</h2>
        <p>
          Em caso de dúvidas, entre em contato pelo e-mail{" "}
          <a href="mailto:contato@gradios.com.br" className="text-primary font-medium hover:underline">
            contato@gradios.com.br
          </a>.
        </p>
      </div>
    </div>
  );
}

