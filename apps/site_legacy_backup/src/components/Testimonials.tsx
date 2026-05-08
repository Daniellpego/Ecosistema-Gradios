import Image from "next/image";
import Link from "next/link";
import { WordReveal } from "./WordReveal";
import { RevealStagger } from "./testimonials/reveal-stagger";
import { RevealItem } from "./testimonials/reveal-item";
import { BeforeAfterSlider } from "./testimonials/before-after-slider";
import { AnimatedNumber } from "./testimonials/animated-number";

const STATS = [
  { value: 70, suffix: "%", label: "Redução de retrabalho" },
  { value: 3, suffix: "x", label: "Escala sem contratar" },
  { value: 2, suffix: " sem", label: "Primeira entrega" },
  { value: 12, suffix: "/12", label: "Clientes renovaram" },
];

export function Testimonials() {
  return (
    <section id="cases" className="bg-bg-alt relative z-10 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealStagger className="flex flex-col items-center" stagger={0.1}>
          <RevealItem
            direction="up"
            className="inline-flex items-center bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6"
          >
            Prova
          </RevealItem>
          <WordReveal
            text="Fatos. Não promessas."
            className="text-4xl lg:text-5xl font-bold text-text text-center leading-tight mb-4"
          />
          <RevealItem direction="up" className="text-text-muted text-lg text-center max-w-xl mx-auto mt-4">
            Estes são resultados reais de empresas reais. Pergunte para elas.
          </RevealItem>
        </RevealStagger>

        {/* Case principal — slider interativo neural */}
        <RevealStagger className="mt-16" stagger={0.12} amount={0.08}>
          <RevealItem direction="scale" className="solution-card bg-white border border-card-border rounded-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider block">
                  Case em destaque | Setor Financeiro
                </span>
                <span className="text-lg font-bold text-text">Fechamento financeiro mensal</span>
              </div>
            </div>

            <BeforeAfterSlider />

            <p className="text-text-muted leading-relaxed mt-6">
              Automação completa do fluxo de aprovações, conciliação bancária e geração de relatórios. Eliminamos 90% do trabalho manual.
            </p>

            <div className="pt-4 mt-4 border-t border-card-border space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-cliente-4.webp"
                  alt="Logo de holding financeira, cliente Gradios"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover bg-white border border-card-border flex-shrink-0"
                />
                <div>
                  <span className="text-sm text-text font-semibold block">
                    CFO de holding com 3 empresas no setor financeiro, Londrina/PR
                  </span>
                  <span className="text-xs text-text-muted italic">
                    &ldquo;O fechamento que levava 3 dias agora termina antes do almoço.&rdquo;
                  </span>
                </div>
              </div>

              <Link
                href="/diagnostico"
                className="group flex items-center gap-3 bg-primary/[0.04] hover:bg-primary/[0.08] border border-primary/15 hover:border-primary/30 rounded-xl px-4 py-3 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">Seu fechamento financeiro também demora?</p>
                  <p className="text-xs text-primary font-medium">Descubra como reduzir &rarr;</p>
                </div>
              </Link>
            </div>
          </RevealItem>
        </RevealStagger>

        {/* Cards secundários */}
        <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8" stagger={0.12} amount={0.08}>
          <RevealItem direction="left" className="solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted line-through">1x volume</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold text-green-600">3x volume</span>
              </div>
              <div className="text-3xl font-bold font-display text-text mb-2">3x</div>
              <p className="text-sm font-bold text-text mb-2">Volume sem contratar</p>
              <p className="text-sm text-text-muted">
                Empresa de serviços B2B com 12 colaboradores triplicou a capacidade de atendimento em 6 semanas com automação de processos internos.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
              <Image
                src="/logo-cliente-5.webp"
                alt="Logo de consultoria B2B, cliente Gradios"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover bg-white border border-card-border flex-shrink-0"
              />
              <span className="text-xs text-text-muted font-medium">Diretor de Operações, consultoria B2B</span>
            </div>
          </RevealItem>

          <RevealItem direction="left" className="solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted line-through">40h/mês</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold text-green-600">2h/mês</span>
              </div>
              <div className="text-3xl font-bold font-display text-text mb-2">95%</div>
              <p className="text-sm font-bold text-text mb-2">Menos tempo em emissão de notas</p>
              <p className="text-sm text-text-muted">
                Processo de emissão de notas fiscais que consumia uma semana por mês passou a rodar automaticamente com validação inteligente.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
              <Image
                src="/logo-cliente-6.webp"
                alt="Logo de distribuidora, cliente Gradios"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover bg-white border border-card-border flex-shrink-0"
              />
              <span className="text-xs text-text-muted font-medium">Gestor Financeiro, distribuidora</span>
            </div>
          </RevealItem>
        </RevealStagger>

        {/* Cards saúde */}
        <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8" stagger={0.12} amount={0.08}>
          <RevealItem direction="left" className="solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted line-through">Manual 24h</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold text-green-600">IA 24/7</span>
              </div>
              <div className="text-3xl font-bold font-display text-text mb-2">24/7</div>
              <p className="text-sm font-bold text-text mb-2">Atendimento automatizado via WhatsApp</p>
              <p className="text-sm text-text-muted">
                Clínica de fisioterapia substituiu o atendimento manual por uma IA que responde 24 horas via WhatsApp, qualifica leads e organiza tudo em um dashboard com avisos de agendamento e consultas.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-card-border flex-shrink-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-xs text-text-muted font-medium">Fisioterapeuta, clínica em Londrina/PR</span>
            </div>
          </RevealItem>

          <RevealItem direction="left" className="solution-card bg-white border border-card-border rounded-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted line-through">Agenda manual</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold text-green-600">100% automático</span>
              </div>
              <div className="text-3xl font-bold font-display text-text mb-2">0h</div>
              <p className="text-sm font-bold text-text mb-2">Tempo gasto com reagendamentos</p>
              <p className="text-sm text-text-muted">
                Terapeuta com agenda desorganizada ganhou um sistema completo: banco de dados de pacientes, agendamento automático com avisos inteligentes e reagendamento automático em feriados.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-card-border flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-card-border flex-shrink-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-xs text-text-muted font-medium">Terapeuta, consultório em Londrina/PR</span>
            </div>
          </RevealItem>
        </RevealStagger>

        {/* Métricas rápidas */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-card-border pt-12">
          {STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-text-muted mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
          <p className="text-xs text-text-muted text-center mt-4 col-span-full">
            *Média dos nossos clientes nos primeiros 90 dias de operação
          </p>
        </div>
      </div>
    </section>
  );
}
