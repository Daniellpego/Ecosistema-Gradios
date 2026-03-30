"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { spring } from "@/lib/motion";
import { trackCTAClick } from "@/lib/meta-pixel";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [showStickyButton, setShowStickyButton] = useState(false);

  const [count, setCount] = useState<number | null>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  /* ── Scroll-driven parallax via Framer Motion (GPU layer, zero React re-renders) ── */
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -36]);
  const springParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 30 });

  /* ── Cursor glow — useMotionValue = zero re-renders ── */
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const glowOpacity = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    const t = setTimeout(() => setMounted(true), 150);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Show sticky button only when scrolled past hero (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setShowStickyButton(window.scrollY > 500); // Show after 500px scroll
      } else {
        setShowStickyButton(false); // Never show on desktop
      }
    };

    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCount(i);
      if (i >= 24) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dashRef.current) return;
      const rect = dashRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - 200);
      mouseY.set(e.clientY - rect.top - 200);
      glowOpacity.set(1);
    },
    [mouseX, mouseY, glowOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    glowOpacity.set(0);
  }, [glowOpacity]);

  /* ── Spring entrance variants ── */
  const heroEntrance = {
    hidden: { opacity: 0, y: 16 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { ...spring.smooth, delay },
    }),
  };

  const mockupVariants = {
    hidden: {
      opacity: 0,
      rotateX: isMobile ? 0 : 8,
      rotateY: isMobile ? 0 : -4,
      y: isMobile ? 20 : 60,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      rotateX: isMobile ? 0 : 4,
      rotateY: 0,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 60, damping: 18, delay: 0.4 },
    },
  };

  return (
    <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-12 overflow-hidden">
      {/* Hero gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-[#f0f4ff] to-white" />
      {/* Diagonal lines texture */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #2546BD 0px, #2546BD 1px, transparent 1px, transparent 16px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[600px] bg-[#2546BD]/8 rounded-full blur-[100px] -translate-y-1/3" />
      <div className="absolute top-1/2 right-0 -z-10 w-[400px] h-[400px] bg-[#00BFFF]/6 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TEXTO CENTRALIZADO */}
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <motion.div
            className="inline-flex items-center gap-2.5 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-5 py-2 tracking-wide mb-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(90deg, rgba(37,70,189,0.08) 0%, rgba(0,191,255,0.14) 40%, rgba(37,70,189,0.08) 60%, rgba(37,70,189,0.08) 100%)",
              backgroundSize: "200% 100%",
              animation: "badgeShimmer 4s ease-in-out infinite",
            }}
            variants={heroEntrance}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            O cérebro da sua operação
          </motion.div>

          {/* H1 — Ogilvy: fato + promessa, sem floreio */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-text leading-[1.1] mb-6 mt-2">
            <span className="block">
              Seu time perde <span className="text-highlight">40h por mês</span>
            </span>
            <span className="block">
              em tarefas que uma{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="text-highlight-strong">máquina faz em 4.</span>
                <svg className="absolute -bottom-2 left-0 w-full overflow-visible" height="8" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                  <path d="M0 4 Q150 0 300 4" stroke="url(#underline-grad)" strokeWidth="5" strokeLinecap="round" fill="none" className="path-anim" />
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

          <p
            className="text-lg lg:text-xl text-text-muted mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Nós conectamos seus sistemas e eliminamos o retrabalho manual. Uma operação eficiente não depende de esforço, e sim de inteligência.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Link
              href="/diagnostico"
              onClick={() => trackCTAClick("Hero", "Diagnóstico Gratuito", "/diagnostico")}
              className="animate-cta-pulse bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:shadow-lg hover:shadow-[#2546BD]/30 hover:opacity-90 transition-all text-center w-full sm:w-auto relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700 text-base sm:text-lg"
            >
              Diagnóstico Gratuito
            </Link>
          </div>

          {/* Social proof — setores inline */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            variants={heroEntrance}
            initial="hidden"
            animate="visible"
            custom={0.9}
          >
            <p className="text-sm text-text-muted w-full text-center mb-3">
              Empresas que já automatizaram com a Gradios
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { src: "/logo-cliente-1.webp", alt: "Soma Contabilidade" },
                { src: "/logo-cliente-2.webp", alt: "Cliente setor saúde" },
                { src: "/logo-cliente-3.webp", alt: "Cliente setor varejo" },
                { src: "/logo-cliente-4.webp", alt: "Cliente setor financeiro" },
                { src: "/logo-cliente-5.webp", alt: "Cliente setor serviços" },
                { src: "/logo-cliente-6.webp", alt: "Cliente setor logística" },
                { src: "/logo-cliente-7.webp", alt: "Cliente setor industrial" },
              ].map((logo, i) => (
                <div key={i} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex-shrink-0">
                  <Image src={logo.src} alt={logo.alt} width={36} height={36} className="w-full h-full object-cover" />
                </div>
              ))}
              <span className="text-xs font-bold text-primary ml-1">+17</span>
            </div>
          </motion.div>
        </div>

        {/* DASHBOARD FULL-WIDTH */}
        <div className="relative max-w-5xl mx-auto" style={{ perspective: "1200px" }}>
          {/* Badges Flutuantes */}
          <motion.div
            className="absolute -left-2 sm:left-4 top-4 sm:top-8 bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float"
            variants={heroEntrance}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <span className="text-secondary">✓</span> Processo Automatizado
          </motion.div>
          <motion.div
            className="absolute -right-2 sm:right-4 top-[25%] bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float"
            style={{ animationDelay: "1.5s" }}
            variants={heroEntrance}
            initial="hidden"
            animate="visible"
            custom={1.2}
          >
            <span className="text-green-400">↑</span> 40% mais eficiência
          </motion.div>
          <motion.div
            className="absolute left-6 sm:left-12 bottom-4 sm:bottom-10 bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float"
            style={{ animationDelay: "3s" }}
            variants={heroEntrance}
            initial="hidden"
            animate="visible"
            custom={1.4}
          >
            <span className="text-secondary">⚡</span> Integrado aos seus sistemas
          </motion.div>

          {/* Container com perspectiva 3D + spring entry + scroll parallax */}
          <motion.div
            ref={dashRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            variants={mockupVariants}
            initial="hidden"
            animate="visible"
            style={{ y: isMobile ? 0 : springParallaxY, transformStyle: "preserve-3d" }}
          >
            {/* Cursor glow — zero re-renders */}
            <motion.div
              className="absolute -z-0 pointer-events-none rounded-full"
              style={{
                width: 400,
                height: 400,
                left: mouseX,
                top: mouseY,
                opacity: glowOpacity,
                background: "radial-gradient(circle, rgba(0,194,224,0.12) 0%, transparent 70%)",
              }}
            />

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
                  <div className="bg-white/5 rounded-md px-6 py-1 text-[11px] text-white/40 font-mono">app.Gradios.com.br/dashboard</div>
                </div>
                <div className="w-16" />
              </div>

              {/* Dashboard Content */}
              <div className="bg-[#0f172a] p-4 sm:p-6">
                <div className="flex gap-5">
                  {/* Sidebar */}
                  <div className="hidden md:flex flex-col gap-3 w-12 flex-shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    {[
                      <svg key="s1" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>,
                      <svg key="s2" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
                      <svg key="s3" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
                      <svg key="s4" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
                      <svg key="s5" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
                    ].map((icon, i) => (
                      <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? "bg-white/10 border border-white/10" : "bg-white/[0.04]"}`}>
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
                      {[
                        { label: "Processos / dia", value: count ?? "...", delta: "+18%", up: true, iconPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
                        { label: "Economia / mês", value: "R$ 47k", delta: "+32% vs meta", up: true, iconPath: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
                        { label: "Tempo médio", value: "4h", delta: "-68%", up: true, iconPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" },
                        { label: "Uptime", value: "99.8%", delta: "SLA garantido", up: false, iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
                      ].map((kpi, i) => (
                        <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 sm:p-4 relative overflow-hidden group hover:bg-white/[0.07] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-2 right-2 w-5 h-5 text-white/10 group-hover:text-white/20 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={kpi.iconPath} />
                          </svg>
                          <div className="text-[10px] sm:text-[10px] text-white/40 mb-1.5">{kpi.label}</div>
                          <div className={`text-lg sm:text-2xl font-bold ${i === 3 ? "text-secondary" : "text-white"}`}>{kpi.value}</div>
                          <div className={`text-[10px] sm:text-[10px] mt-1 ${kpi.up ? "text-green-400" : "text-white/30"}`}>{kpi.delta}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart + Progress */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      {/* Bar Chart */}
                      <div className="sm:col-span-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[11px] text-white/60 font-medium">Performance Semanal</span>
                          <div className="flex gap-1.5">
                            <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">7d</span>
                            <span className="text-[10px] text-white bg-brand-gradient px-2 py-0.5 rounded font-medium">30d</span>
                          </div>
                        </div>
                        <div className="flex items-end gap-1 h-24 sm:h-28">
                          {[35, 50, 30, 65, 55, 80, 42, 90, 60, 85, 48, 72, 58, 78].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end h-full">
                              <div
                                className="w-full rounded-sm"
                                style={{
                                  height: mounted ? `${h}%` : "0%",
                                  background: h > 70 ? "linear-gradient(to top, #2546BD, #00BFFF)" : "linear-gradient(to top, rgba(37,70,189,0.3), rgba(0,191,255,0.25))",
                                  transition: `height ${800 + i * 60}ms ease-out ${i * 40}ms`,
                                  animation: mounted ? `barBreath 5s ease-in-out ${2 + i * 0.2}s infinite` : "none",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="sm:col-span-2 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                        <span className="text-[11px] text-white/60 font-medium block mb-4">Fluxos Ativos</span>
                        <div className="space-y-4">
                          {[
                            { label: "Faturamento", pct: 85, color: "bg-brand-gradient" },
                            { label: "Onboarding", pct: 65, color: "bg-primary" },
                            { label: "Cobrança", pct: 40, color: "bg-secondary" },
                            { label: "Relatórios", pct: 92, color: "bg-brand-gradient" },
                          ].map((item, i) => (
                            <div key={i}>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-[10px] text-white/50">{item.label}</span>
                                <span className="text-[10px] text-white/40">{mounted ? `${item.pct}%` : "..."}</span>
                              </div>
                              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${item.color} rounded-full`}
                                  style={{
                                    width: mounted ? `${item.pct}%` : "0%",
                                    transition: `width 1200ms ease-out ${i * 120}ms`,
                                    animation: mounted ? `progressPulse 6s ease-in-out ${2.5 + i * 0.4}s infinite` : "none",
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow abaixo do dashboard */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#2546BD]/20 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Mobile sticky CTA — only shows after scrolling past hero */}
      {showStickyButton && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-card-border sm:hidden"
        >
          <Link
            href="/diagnostico"
            onClick={() => trackCTAClick("Hero Mobile Sticky", "Diagnóstico Gratuito", "/diagnostico")}
            className="animate-cta-pulse bg-brand-gradient text-white rounded-pill px-6 py-4 font-bold text-center block text-base"
          >
            Diagnóstico Gratuito
          </Link>
        </motion.div>
      )}
    </section>
  );
}
