import type { ReactNode } from "react";
import Image from "next/image";
import { HeroFadeIn } from "./hero/hero-fade-in";
import { HeroCta } from "./hero/hero-cta";
import { HeroDashboardFrame } from "./hero/hero-dashboard-frame";
import { HeroAnimatedNumber } from "./hero/hero-animated-number";
import { HeroBarChart } from "./hero/hero-bar-chart";
import { HeroProgressBars } from "./hero/hero-progress-bars";

const CLIENT_LOGOS = [
  { src: "/logo-cliente-1.webp", alt: "Soma Contabilidade" },
  { src: "/logo-cliente-2.webp", alt: "Cliente setor saúde" },
  { src: "/logo-cliente-3.webp", alt: "Cliente setor varejo" },
  { src: "/logo-cliente-4.webp", alt: "Cliente setor financeiro" },
  { src: "/logo-cliente-5.webp", alt: "Cliente setor serviços" },
  { src: "/logo-cliente-6.webp", alt: "Cliente setor logística" },
  { src: "/logo-cliente-7.webp", alt: "Cliente setor industrial" },
];

function KpiCard({
  label,
  value,
  children,
  delta,
  up,
  iconPath,
  accent,
}: {
  label: string;
  value?: string | number;
  children?: ReactNode;
  delta: string;
  up: boolean;
  iconPath: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 sm:p-4 relative overflow-hidden group hover:bg-white/[0.07] transition-colors">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-2 right-2 w-5 h-5 text-white/10 group-hover:text-white/20 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
      </svg>
      <div className="text-[10px] sm:text-[10px] text-white/40 mb-1.5">{label}</div>
      <div className={`text-lg sm:text-2xl font-bold ${accent ? "text-secondary" : "text-white"}`}>
        {children ?? value}
      </div>
      <div className={`text-[10px] sm:text-[10px] mt-1 ${up ? "text-green-400" : "text-white/30"}`}>{delta}</div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-12 overflow-hidden">
      {/* Hero gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-[#f0f4ff] to-white" />
      {/* Diagonal lines texture */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #2546BD 0px, #2546BD 1px, transparent 1px, transparent 16px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[600px] bg-[#2546BD]/8 rounded-full blur-[100px] -translate-y-1/3" />
      <div className="absolute top-1/2 right-0 -z-10 w-[400px] h-[400px] bg-[#00BFFF]/6 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TEXTO CENTRALIZADO */}
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <HeroFadeIn
            delay={0}
            className="inline-flex items-center gap-2.5 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-5 py-2 tracking-wide mb-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, rgba(37,70,189,0.08) 0%, rgba(0,191,255,0.14) 40%, rgba(37,70,189,0.08) 60%, rgba(37,70,189,0.08) 100%)",
              backgroundSize: "200% 100%",
              animation: "badgeShimmer 4s ease-in-out infinite",
            }}
          >
            O cérebro da sua operação
          </HeroFadeIn>

          {/* H1 — Ogilvy: fato + promessa, sem floreio */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-text leading-[1.1] mb-6 mt-2">
            <span className="sr-only">Automação de processos B2B e software sob medida — </span>
            <span className="block">
              Seu time perde <span className="text-highlight">40h por mês</span>
            </span>
            <span className="block">
              em tarefas que uma{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="text-highlight-strong">máquina faz em 4.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full overflow-visible"
                  height="8"
                  viewBox="0 0 300 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q150 0 300 4"
                    stroke="url(#underline-grad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    className="path-anim"
                  />
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0">
                      <stop offset="0%" stopColor="#2546BD" />
                      <stop offset="100%" stopColor="#00BFFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-text-muted mb-8 max-w-xl mx-auto leading-relaxed">
            Conectamos seu ERP, CRM e WhatsApp num fluxo só. Acabou o copiar e colar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <HeroCta />
          </div>

          {/* Social proof — setores inline */}
          <HeroFadeIn delay={0.9} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <p className="text-sm text-text-muted w-full text-center mb-3">
              Empresas que já automatizaram com a Gradios
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {CLIENT_LOGOS.map((logo, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex-shrink-0"
                >
                  <Image src={logo.src} alt={logo.alt} width={36} height={36} className="w-full h-full object-cover" />
                </div>
              ))}
              <span className="text-xs font-bold text-primary ml-1">+17</span>
            </div>
          </HeroFadeIn>
        </div>

        {/* DASHBOARD FULL-WIDTH */}
        <div className="relative max-w-5xl mx-auto" style={{ perspective: "1200px" }}>
          {/* Badges Flutuantes */}
          <HeroFadeIn
            delay={1}
            className="absolute -left-2 sm:left-4 top-4 sm:top-8 bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float"
          >
            <span className="text-secondary">✓</span> Processo Automatizado
          </HeroFadeIn>
          <HeroFadeIn
            delay={1.2}
            style={{ animationDelay: "1.5s" }}
            className="absolute -right-2 sm:right-4 top-[25%] bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float"
          >
            <span className="text-green-400">↑</span> 40% mais eficiência
          </HeroFadeIn>
          <HeroFadeIn
            delay={1.4}
            style={{ animationDelay: "3s" }}
            className="absolute left-6 sm:left-12 bottom-4 sm:bottom-10 bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float"
          >
            <span className="text-secondary">⚡</span> Integrado aos seus sistemas
          </HeroFadeIn>

          {/* Container com perspectiva 3D + spring entry + scroll parallax */}
          <HeroDashboardFrame>
            {/* Janela do App — macOS style */}
            <div className="bg-[#0f172a] rounded-2xl lg:rounded-3xl shadow-[0_60px_140px_rgba(37,70,189,0.25),0_30px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden relative z-10">
              {/* Title Bar */}
              <div className="flex items-center gap-2 px-5 py-3 bg-[#0f172a] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-md px-6 py-1 text-[11px] text-white/40 font-mono">
                    app.Gradios.com.br/dashboard
                  </div>
                </div>
                <div className="w-16" />
              </div>

              {/* Dashboard Content */}
              <div className="bg-[#0f172a] p-4 sm:p-6">
                <div className="flex gap-5">
                  {/* Sidebar — static */}
                  <div className="hidden md:flex flex-col gap-3 w-12 flex-shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    {[
                      <svg
                        key="s1"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white/40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                      </svg>,
                      <svg
                        key="s2"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-secondary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>,
                      <svg
                        key="s3"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white/40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>,
                      <svg
                        key="s4"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white/40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>,
                      <svg
                        key="s5"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white/40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>,
                    ].map((icon, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          i === 1 ? "bg-white/10 border border-white/10" : "bg-white/[0.04]"
                        }`}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>

                  {/* Main */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-white text-sm sm:text-base font-semibold">Painel de Automação</div>
                        <div className="text-white/30 text-[10px] sm:text-xs">Atualizado agora</div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-status-pulse" />
                        <span className="text-[10px] sm:text-xs text-white/40">Tudo operacional</span>
                      </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <KpiCard
                        label="Processos / dia"
                        delta="+18%"
                        up
                        iconPath="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      >
                        <HeroAnimatedNumber target={24} />
                      </KpiCard>
                      <KpiCard
                        label="Economia / mês"
                        value="R$ 47k"
                        delta="+32% vs meta"
                        up
                        iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
                      />
                      <KpiCard
                        label="Tempo médio"
                        value="4h"
                        delta="-68%"
                        up
                        iconPath="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2"
                      />
                      <KpiCard
                        label="Uptime"
                        value="99.8%"
                        delta="SLA garantido"
                        up={false}
                        accent
                        iconPath="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      />
                    </div>

                    {/* Chart + Progress */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <HeroBarChart />
                      <HeroProgressBars />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow abaixo do dashboard */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#2546BD]/20 rounded-full blur-3xl -z-10" />
          </HeroDashboardFrame>
        </div>
      </div>
    </section>
  );
}
