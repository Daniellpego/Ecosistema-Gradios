import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Gradios",
  description: "Política de privacidade da Gradios Soluções em Tecnologia.",
  openGraph: {
    title: "Política de Privacidade | Gradios",
    description: "Como tratamos seus dados pessoais conforme a LGPD.",
    type: "website",
    url: "https://gradios.co/privacidade",
  },
};

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <h1 className="text-4xl font-black text-text mb-8">Política de Privacidade</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-text-muted text-sm leading-relaxed">
        <p><strong className="text-text">Última atualização:</strong> Março de 2026</p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">1. Dados Coletados</h2>
        <p>
          Coletamos apenas os dados informados voluntariamente por você através do formulário de contato:
          nome completo, empresa, e-mail corporativo e descrição do desafio. Não utilizamos cookies de rastreamento
          de terceiros.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">2. Uso dos Dados</h2>
        <p>
          Seus dados são utilizados exclusivamente para entrar em contato sobre os serviços da Gradios.
          Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">3. Armazenamento</h2>
        <p>
          Os dados são armazenados de forma segura em infraestrutura protegida. Mantemos seus dados apenas
          pelo tempo necessário para a finalidade para a qual foram coletados.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">4. Seus Direitos (LGPD)</h2>
        <p>
          De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
          acessar, corrigir, excluir ou solicitar a portabilidade dos seus dados pessoais a qualquer momento.
        </p>

        <h2 className="text-xl font-bold text-text mt-8 mb-3">5. Contato do DPO</h2>
        <p>
          Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato:{" "}
          <a href="mailto:contato@gradios.com.br" className="text-primary font-medium hover:underline">
            contato@gradios.com.br
          </a>.
        </p>
      </div>
    </div>
  );
}
