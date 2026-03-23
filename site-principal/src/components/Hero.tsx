"use client";
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from "react";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dashRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    const interval = setInterval(() => setPulse(p => !p), 3000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let i = 0;
    const interval = setInterval(() => {
      i++; setCount(i);
      if (i >= 24) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [mounted]);

  // Throttled scroll com rAF
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.scrollY);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // Cursor glow effect no dashboard
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dashRef.current) return;
    const rect = dashRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-12 overflow-hidden">
      {/* Hero gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-[#f0f4ff] to-white" />

      {/* Diagonal lines texture — hero only */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.06]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #2546BD 0px, #2546BD 1px, transparent 1px, transparent 16px)',
        backgroundSize: '16px 16px',
      }} />

      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[600px] bg-[#2546BD]/8 rounded-full blur-[100px] -translate-y-1/3"></div>
      <div className="absolute top-1/2 right-0 -z-10 w-[400px] h-[400px] bg-[#00BFFF]/6 rounded-full blur-[80px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TEXTO CENTRALIZADO — Above the fold */}
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <div
            className={`inline-flex items-center gap-2.5 bg-primary/8 text-primary font-semibold border border-secondary/20 rounded-pill text-sm px-5 py-2 tracking-wide mb-6 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Pulsating Brain Icon */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              {/* Neural glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-primary animate-brain-pulse relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Brain SVG */}
                <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.8 1.4 3.8C6.5 11.5 6 12.7 6 14c0 2.5 1.8 4.5 4 4.9V22h4v-3.1c2.2-.4 4-2.4 4-4.9 0-1.3-.5-2.5-1.4-3.2C17.5 9.8 18 8.5 18 7c0-2.5-2.5-5-6-5z" />
                <path d="M12 2v20" className="animate-neural" />
                <path d="M8 8c1.5 0 2.5 1 4 1s2.5-1 4-1" />
                <path d="M8 14c1.5 0 2.5 1 4 1s2.5-1 4-1" />
              </svg>
            </div>
            O cérebro da sua operação
          </div>

          {/* H1 com text reveal line by line — spring easing */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text leading-[1.1] mb-6">
            <span
              className={`block ${mounted ? 'animate-text-up' : 'opacity-0'}`}
              style={{ animationDelay: '0ms' }}
            >
              Automatize sua operação.
            </span>
            <span
              className={`block ${mounted ? 'animate-text-up' : 'opacity-0'}`}
              style={{ animationDelay: '100ms' }}
            >
              Escale sem{' '}
              <span className="relative inline-block whitespace-nowrap">
                contratar mais.
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
            className={`text-lg lg:text-xl text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            Identificamos o gargalo, construímos a automação, e você vê resultado em 2 semanas. Sem enrolação, sem contrato longo.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 items-center justify-center transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <Link href="/diagnostico" className="animate-cta-pulse bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:shadow-lg hover:shadow-[#2546BD]/30 hover:opacity-90 transition-all text-center w-full sm:w-auto relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700">
              Diagnóstico Gratuito
            </Link>
            <Link href="#como-funciona" className="text-text font-medium px-6 py-4 hover:text-primary transition-colors flex items-center gap-2 border border-card-border rounded-pill hover:border-primary/30">
              Ver como funciona &rarr;
            </Link>
          </div>

          {/* Social proof no hero */}
          <div
            className={`mt-8 flex items-center justify-center gap-3 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <div className="flex -space-x-2">
              {["G", "M", "R", "A"].map((initial, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-brand-gradient border-2 border-white flex items-center justify-center relative" style={{ zIndex: 4 - i }}>
                  <span className="text-white text-[10px] font-bold">{initial}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-text-muted">
              <span className="font-bold text-text">+17 empresas</span> já automatizaram com a Gradios
            </p>
          </div>
        </div>

        {/* DASHBOARD FULL-WIDTH */}
        <div
          className="relative max-w-5xl mx-auto"
          style={{ perspective: '1200px' }}
        >
          {/* Badges Flutuantes */}
          <div className={`absolute -left-2 sm:left-4 top-4 sm:top-8 bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-secondary">✓</span> Processo Automatizado
          </div>
          <div className={`absolute -right-2 sm:right-4 top-[25%] bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: "1.5s" }}>
            <span className="text-green-400">↑</span> 40% mais eficiência
          </div>
          <div className={`absolute left-6 sm:left-12 bottom-4 sm:bottom-10 bg-[#0f172a] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-pill shadow-2xl z-30 flex items-center gap-2 animate-float transition-all duration-700 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: "3s" }}>
            <span className="text-secondary">⚡</span> Integrado ao seu stack
          </div>

          {/* Container com perspectiva 3D + dramatic entry + parallax */}
          <div
            ref={dashRef}
            onMouseMove={handleMouseMove}
            className={`relative ${mounted ? 'animate-mockup-entry' : 'opacity-0'}`}
            style={{
              transform: mounted ? `translateY(${scrollY * -0.06}px)` : undefined,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {/* Cursor glow */}
            <div
              className="absolute -z-0 pointer-events-none rounded-full transition-opacity duration-300"
              style={{
                width: '400px',
                height: '400px',
                left: mousePos.x - 200,
                top: mousePos.y - 200,
                background: 'radial-gradient(circle, rgba(0,194,224,0.12) 0%, transparent 70%)',
                opacity: mousePos.x > 0 ? 1 : 0,
              }}
            />

            {/* Janela do App — macOS style — enhanced shadow */}
            <div className="bg-[#0f172a] rounded-2xl lg:rounded-3xl shadow-[0_60px_140px_rgba(37,70,189,0.25),0_30px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden relative z-10">
              {/* Title Bar */}
              <div className="flex items-center gap-2 px-5 py-3 bg-[#0f172a] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-md px-6 py-1 text-[11px] text-white/40 font-mono">
                    app.Gradios.com.br/dashboard
                  </div>
                </div>
                <div className="w-16"></div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-[#0f172a] p-4 sm:p-6">
                <div className="flex gap-5">
                  {/* Sidebar */}
                  <div className="hidden md:flex flex-col gap-3 w-12 flex-shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    </div>
                    {[
                      <svg key="s1" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"></path></svg>,
                      <svg key="s2" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
                      <svg key="s3" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
                      <svg key="s4" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
                      <svg key="s5" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
                    ].map((icon, i) => (
                      <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-white/10 border border-white/10' : 'bg-white/[0.04]'}`}>{icon}</div>
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
                        <div className={`h-2 w-2 rounded-full bg-green-400 transition-opacity duration-500 ${pulse ? 'opacity-100' : 'opacity-30'}`}></div>
                        <span className="text-[10px] sm:text-xs text-white/40">Tudo operacional</span>
                      </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: "Processos / dia", value: count ?? "—", delta: "+18%", up: true, icon: "⚡" },
                        { label: "Economia / mês", value: "R$ 47k", delta: "+32% vs meta", up: true, icon: "💰" },
                        { label: "Tempo médio", value: "4h", delta: "-68%", up: true, icon: "⏱" },
                        { label: "Uptime", value: "99.8%", delta: "SLA garantido", up: false, icon: "🛡" },
                      ].map((kpi, i) => (
                        <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 sm:p-4 relative overflow-hidden group hover:bg-white/[0.07] transition-colors">
                          <div className="absolute top-2 right-2 text-lg opacity-20 group-hover:opacity-40 transition-opacity">{kpi.icon}</div>
                          <div className="text-[9px] sm:text-[10px] text-white/40 mb-1.5">{kpi.label}</div>
                          <div className={`text-lg sm:text-2xl font-bold ${i === 3 ? 'text-secondary' : 'text-white'}`}>{kpi.value}</div>
                          <div className={`text-[9px] sm:text-[10px] mt-1 ${kpi.up ? 'text-green-400' : 'text-white/30'}`}>{kpi.delta}</div>
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
                            <span className="text-[9px] text-white/30 bg-white/5 px-2 py-0.5 rounded">7d</span>
                            <span className="text-[9px] text-white bg-brand-gradient px-2 py-0.5 rounded font-medium">30d</span>
                          </div>
                        </div>
                        <div className="flex items-end gap-1 h-24 sm:h-28">
                          {[35, 50, 30, 65, 55, 80, 42, 90, 60, 85, 48, 72, 58, 78].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end h-full">
                              <div
                                className="w-full rounded-sm transition-all ease-out"
                                style={{
                                  height: mounted ? `${h}%` : '0%',
                                  transitionDuration: `${800 + i * 60}ms`,
                                  transitionDelay: `${i * 40}ms`,
                                  background: h > 70 ? 'linear-gradient(to top, #2546BD, #00BFFF)' : 'linear-gradient(to top, rgba(37,70,189,0.3), rgba(0,191,255,0.25))',
                                }}
                              ></div>
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
                                <span className="text-[10px] text-white/40">{mounted ? `${item.pct}%` : '—'}</span>
                              </div>
                              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${item.color} rounded-full transition-all ease-out`}
                                  style={{
                                    width: mounted ? `${item.pct}%` : '0%',
                                    transitionDuration: '1200ms',
                                    transitionDelay: `${i * 120}ms`,
                                  }}
                                ></div>
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
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#2546BD]/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>

      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/90 backdrop-blur-md border-t border-card-border sm:hidden">
        <Link href="/diagnostico" className="animate-cta-pulse bg-brand-gradient text-white rounded-pill px-6 py-3 font-bold text-center block text-sm">
          Diagnóstico Gratuito
        </Link>
      </div>
    </section>
  );
}
