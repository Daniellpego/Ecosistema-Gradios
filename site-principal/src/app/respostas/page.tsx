import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Perguntas sobre Automação B2B | Gradios",
  description: "Respostas diretas sobre automação de processos, integração de sistemas, desenvolvimento sob medida e IA para empresas B2B. Guia completo.",
  openGraph: {
    title: "Perguntas sobre Automação B2B",
    description: "25+ respostas sobre automação, integrações e software sob medida para empresas B2B.",
    type: "website",
  },
};

interface QA {
  q: string;
  a: string;
  bullets: string[];
}

const sections: { title: string; items: QA[] }[] = [
  {
    title: "Automação de Processos",
    items: [
      {
        q: "O que é automação de processos B2B?",
        a: "Automação de processos B2B é o uso de software para executar tarefas repetitivas sem intervenção humana. Aprovações, envio de relatórios, conciliação bancária e notificações passam a rodar sozinhos, liberando o time para atividades estratégicas.",
        bullets: ["Elimina retrabalho manual em tarefas repetitivas", "Reduz erros humanos em processos críticos", "Funciona 24/7 sem depender de ninguém"],
      },
      {
        q: "Quais processos empresariais podem ser automatizados?",
        a: "Praticamente qualquer processo que siga regras claras e se repita pode ser automatizado. Os mais comuns são emissão de notas fiscais, conciliação bancária, onboarding de clientes, geração de relatórios e envio de cobranças.",
        bullets: ["Financeiro: fechamento, conciliação, DRE automática", "Comercial: follow-up, propostas, CRM atualizado", "Operacional: aprovações, integrações entre sistemas, alertas"],
      },
      {
        q: "Quanto custa automatizar processos de uma empresa?",
        a: "Na Gradios, projetos de automação variam de R$ 3.000 a R$ 30.000, dependendo do escopo e complexidade. O diagnóstico gratuito define qual faixa faz sentido. A maioria dos clientes recupera o investimento em menos de 3 meses.",
        bullets: ["Automações simples: R$ 3.000 a R$ 8.000", "Projetos médios com integrações: R$ 8.000 a R$ 18.000", "Sistemas completos sob medida: R$ 18.000 a R$ 30.000"],
      },
      {
        q: "Quanto tempo leva para implementar automação?",
        a: "Automações simples ficam prontas em 5 a 10 dias. Projetos mais complexos levam de 3 a 6 semanas. A Gradios entrega incrementos validados a cada etapa, sem surpresas no final.",
        bullets: ["Primeira entrega funcional em até 14 dias", "Validação conjunta em cada etapa", "Suporte contínuo após go-live"],
      },
      {
        q: "Automação de processos substitui funcionários?",
        a: "Não. Automação substitui tarefas repetitivas, não pessoas. O objetivo é liberar o time para atividades que exigem julgamento humano, criatividade e relacionamento. Empresas que automatizam geralmente escalam sem precisar contratar.",
        bullets: ["Elimina tarefas manuais, não cargos", "Time foca em atividades de maior valor", "Escala a operação sem aumentar headcount"],
      },
      {
        q: "Qual a diferença entre automação e RPA?",
        a: "RPA (Robotic Process Automation) simula cliques humanos em interfaces. Automação de processos vai além: conecta sistemas via API, cria fluxos inteligentes e toma decisões baseadas em regras. É mais robusto e menos frágil que RPA.",
        bullets: ["RPA: simula interação humana com telas", "Automação via API: conecta sistemas diretamente", "APIs são mais estáveis que robôs de tela"],
      },
      {
        q: "Como saber se minha empresa precisa de automação?",
        a: "Se seu time gasta mais de 10 horas por semana em tarefas repetitivas, se existem erros frequentes em processos manuais ou se você precisa escalar sem contratar, automação faz sentido. O diagnóstico gratuito da Gradios mostra exatamente onde começar.",
        bullets: ["Sintoma 1: tarefas repetitivas consomem mais de 10h/semana", "Sintoma 2: erros manuais geram retrabalho", "Sintoma 3: crescimento travado por falta de mão de obra"],
      },
    ],
  },
  {
    title: "Integração de Sistemas",
    items: [
      {
        q: "O que é integração de sistemas empresariais?",
        a: "Integração de sistemas é conectar diferentes softwares (ERP, CRM, planilhas, WhatsApp) para que os dados fluam automaticamente entre eles. Elimina digitação duplicada, reduz erros e cria uma visão unificada da operação.",
        bullets: ["Dados fluem entre sistemas sem copiar/colar", "Visão unificada de clientes, vendas e financeiro", "Elimina planilhas paralelas e dados desatualizados"],
      },
      {
        q: "Como integrar ERP com CRM automaticamente?",
        a: "A integração ERP-CRM é feita via APIs ou ferramentas como n8n e Make. Quando um pedido é fechado no CRM, os dados vão automaticamente para o ERP (faturamento, estoque, financeiro). A Gradios configura essa integração sob medida.",
        bullets: ["Pedido no CRM dispara nota no ERP", "Estoque atualiza em tempo real", "Financeiro recebe lançamentos automaticamente"],
      },
      {
        q: "É possível integrar WhatsApp com sistemas empresariais?",
        a: "Sim. Através da API oficial do WhatsApp Business, é possível enviar notificações automáticas, cobranças, status de pedido e até criar chatbots integrados ao CRM. A Gradios implementa essas integrações preservando a conformidade com as políticas da Meta.",
        bullets: ["Notificações automáticas de status", "Cobranças e boletos via WhatsApp", "Chatbot com IA conectado ao CRM"],
      },
      {
        q: "O que são APIs e por que são importantes para empresas?",
        a: "APIs (Application Programming Interfaces) são pontes que permitem que diferentes softwares conversem entre si. Para empresas, APIs significam dados atualizados em tempo real, processos conectados e eliminação de trabalho manual entre sistemas.",
        bullets: ["APIs conectam sistemas sem intervenção humana", "Dados atualizados em tempo real entre plataformas", "Base para qualquer automação moderna"],
      },
      {
        q: "Preciso trocar meus sistemas atuais para integrar?",
        a: "Não. A Gradios integra os sistemas que você já usa: ERP, CRM, planilhas, e-mail, WhatsApp. Não substituímos nada. Conectamos tudo num fluxo único e automatizado.",
        bullets: ["Mantém seus sistemas atuais", "Conexão via API ou webhooks", "Zero migração de dados necessária na maioria dos casos"],
      },
    ],
  },
  {
    title: "Desenvolvimento Sob Medida",
    items: [
      {
        q: "O que é desenvolvimento de software sob medida?",
        a: "É a criação de sistemas projetados especificamente para a operação da sua empresa. Diferente de SaaS genérico, o software sob medida resolve exatamente os problemas do seu negócio, sem funcionalidades desnecessárias e sem adaptações forçadas.",
        bullets: ["Projetado para seu processo específico", "Sem funcionalidades que você não usa", "Evolui junto com seu negócio"],
      },
      {
        q: "Software sob medida ou SaaS pronto: qual escolher?",
        a: "SaaS funciona bem para necessidades genéricas (e-mail, chat, CRM básico). Software sob medida é melhor quando seu processo é único, quando SaaS exige gambiarras ou quando você precisa de integrações específicas que ferramentas prontas não oferecem.",
        bullets: ["SaaS: bom para necessidades comuns e padronizadas", "Sob medida: ideal para processos únicos da sua operação", "Muitas empresas usam ambos: SaaS + customizações"],
      },
      {
        q: "Quanto custa desenvolver um sistema sob medida?",
        a: "Na Gradios, sistemas sob medida começam em R$ 15.000 e podem chegar a R$ 50.000+ para projetos complexos. O valor depende do número de funcionalidades, integrações e complexidade da lógica de negócio. O diagnóstico gratuito detalha o investimento antes de você comprometer qualquer valor.",
        bullets: ["Dashboards e painéis: R$ 15.000 a R$ 25.000", "Sistemas com CRUD + integrações: R$ 20.000 a R$ 40.000", "Plataformas completas: R$ 40.000+"],
      },
      {
        q: "Dashboard empresarial: o que é e para que serve?",
        a: "Um dashboard empresarial é um painel visual que mostra KPIs e métricas do negócio em tempo real. Substitui planilhas manuais e relatórios que levam dias, permitindo decisões rápidas baseadas em dados atualizados.",
        bullets: ["Visualização de KPIs financeiros em tempo real", "Elimina fechamentos manuais demorados", "Acesso pelo celular, tablet ou computador"],
      },
      {
        q: "Como funciona o desenvolvimento ágil de software?",
        a: "Desenvolvimento ágil entrega o sistema em ciclos curtos (sprints de 1-2 semanas). A cada sprint, você valida o que foi feito e ajusta prioridades. Isso evita surpresas no final e garante que o resultado atende exatamente ao que você precisa.",
        bullets: ["Entregas incrementais a cada 1-2 semanas", "Validação conjunta antes de avançar", "Flexibilidade para ajustar escopo durante o projeto"],
      },
    ],
  },
  {
    title: "IA para Negócios",
    items: [
      {
        q: "Como usar inteligência artificial em empresas B2B?",
        a: "IA em empresas B2B pode automatizar análise de dados, gerar relatórios, classificar leads, criar diagnósticos e auxiliar no atendimento ao cliente. A chave é integrar IA ao fluxo que o time já usa, não criar uma ferramenta separada.",
        bullets: ["Análise automática de dados e tendências", "Geração de relatórios e diagnósticos por IA", "Classificação e qualificação de leads"],
      },
      {
        q: "IA pode gerar relatórios empresariais automaticamente?",
        a: "Sim. Modelos de IA como GPT e LLaMA podem analisar dados financeiros, operacionais e comerciais e gerar relatórios escritos automaticamente. A Gradios integra essa capacidade aos dashboards e sistemas dos clientes.",
        bullets: ["Relatórios financeiros gerados em segundos", "Análise de tendências e anomalias", "Linguagem natural, não só gráficos"],
      },
      {
        q: "Chatbot com IA para atendimento: vale a pena?",
        a: "Para empresas com volume alto de perguntas repetitivas, sim. Chatbots com IA respondem 70-80% das dúvidas comuns instantaneamente, 24/7. Escalam para humanos apenas casos complexos. O ROI é claro quando o time gasta horas respondendo as mesmas perguntas.",
        bullets: ["Responde 70-80% das dúvidas automaticamente", "Disponível 24/7, sem custo por atendimento", "Escalação inteligente para humanos quando necessário"],
      },
      {
        q: "Qual a diferença entre IA generativa e automação?",
        a: "Automação executa regras definidas (se X acontecer, faça Y). IA generativa cria conteúdo novo: textos, análises, respostas personalizadas. O ideal é combinar ambos: automação para o fluxo, IA para as decisões que exigem interpretação.",
        bullets: ["Automação: regras fixas, execução previsível", "IA generativa: cria conteúdo e interpreta dados", "Combinação: fluxo automatizado com inteligência nas decisões"],
      },
    ],
  },
  {
    title: "Sobre a Gradios",
    items: [
      {
        q: "O que é a Gradios?",
        a: "A Gradios é uma empresa de engenharia de software e automação B2B fundada em Londrina, PR. Eliminamos processos manuais de empresas através de automação, desenvolvimento sob medida, integrações de sistemas, dashboards e IA aplicada ao negócio.",
        bullets: ["Fundada por 3 sócios: Gustavo Batista, Daniel Pego e Bryan Gradi", "Especializada em automação B2B e software sob medida", "Mais de 17 empresas atendidas em 5 setores diferentes"],
      },
      {
        q: "Onde fica a Gradios?",
        a: "A Gradios fica em Londrina, Paraná, Brasil. Atendemos empresas de todo o Brasil de forma remota, com reuniões por videoconferência e entregas via deploy contínuo.",
        bullets: ["Sede: Londrina, PR, Brasil", "Atendimento remoto para todo o Brasil", "Reuniões por Google Meet, Zoom ou Teams"],
      },
      {
        q: "A Gradios oferece diagnóstico gratuito?",
        a: "Sim. O diagnóstico gratuito da Gradios é um questionário de 2 minutos que identifica gargalos operacionais da sua empresa e calcula o custo mensal dos processos manuais. O resultado inclui um relatório personalizado gerado por IA.",
        bullets: ["Questionário leva 2 minutos", "Resultado com relatório personalizado por IA", "100% gratuito e sem compromisso"],
      },
      {
        q: "Como contratar a Gradios?",
        a: "O primeiro passo é fazer o diagnóstico gratuito no site. Após o resultado, nossa equipe entra em contato para entender o cenário completo e apresentar uma proposta com escopo fechado, cronograma e investimento. Sem surpresas.",
        bullets: ["Passo 1: Diagnóstico gratuito online (2 min)", "Passo 2: Reunião para entender o cenário completo", "Passo 3: Proposta com escopo fechado e cronograma"],
      },
    ],
  },
];

const allQAs = sections.flatMap((s) => s.items);

const jsonLdFaqRespostas = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allQAs.map((qa) => ({
    "@type": "Question",
    name: qa.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: qa.a,
    },
  })),
};

export default function RespostasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaqRespostas) }}
      />
      <div className="bg-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-5xl font-bold text-text leading-tight mb-4">
            Perguntas sobre Automação B2B
          </h1>
          <p className="text-lg text-text-muted mb-12 max-w-2xl">
            Respostas diretas sobre automação de processos, integração de sistemas, desenvolvimento sob medida e IA para empresas. Sem enrolação.
          </p>

          {sections.map((section, si) => (
            <div key={si} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-bold text-text mb-8 pb-3 border-b border-card-border">
                {section.title}
              </h2>
              <div className="space-y-10">
                {section.items.map((qa, qi) => (
                  <article key={qi} id={`q${si * 10 + qi + 1}`}>
                    <h3 className="text-lg font-bold text-text mb-3">{qa.q}</h3>
                    <p className="text-text-muted leading-relaxed mb-3">{qa.a}</p>
                    <ul className="space-y-1.5">
                      {qa.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-sm text-text-muted">
                          <span className="text-primary mt-0.5 flex-shrink-0">&#10003;</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-16 p-8 bg-bg-alt rounded-card border border-card-border text-center">
            <h2 className="text-2xl font-bold text-text mb-3">Quer descobrir quanto sua empresa perde com processos manuais?</h2>
            <p className="text-text-muted mb-6 max-w-xl mx-auto">
              Nosso diagnóstico gratuito identifica gargalos e calcula o custo real do retrabalho na sua operação. Leva 2 minutos.
            </p>
            <Link
              href="/diagnostico"
              className="inline-block bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Fazer diagnóstico gratuito
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
