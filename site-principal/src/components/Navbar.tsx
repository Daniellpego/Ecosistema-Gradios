"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

const NAV_ITEMS = [
  { href: "#solucoes", label: "Soluções" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#cases", label: "Cases" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer para seção ativa
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map(item => item.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${id}`);
          }
        },
        { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  // Fechar menu mobile ao redimensionar
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setMenuOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Block scroll quando menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-card-border"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2.5">
            <Image src="/logo.png" alt="Gradios Logo" width={88} height={88} className="w-11 h-11 drop-shadow-md" priority />
            <Link href="/" className="font-bold text-[22px] tracking-tight text-text">
              Gradios
            </Link>
          </div>

          {/* Links Nav com indicador ativo */}
          <nav className="hidden md:flex space-x-8" aria-label="Navegação principal">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  activeSection === item.href
                    ? "text-primary"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
                {/* Underline animado */}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-gradient rounded-full transition-all duration-300 ${
                  activeSection === item.href ? "w-full" : "w-0"
                }`} />
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Link href="/diagnostico" className="bg-brand-gradient text-white rounded-pill py-2.5 px-6 font-bold text-center text-sm relative overflow-hidden hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700">
              Diagnóstico Gratuito
            </Link>
          </div>

          {/* Menu Mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-bg-alt transition text-text"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown mobile com animação */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-card-border shadow-lg transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="py-4 px-6 flex flex-col gap-4">
          {NAV_ITEMS.map((item, i) => (
            <Link key={i} href={item.href} onClick={() => setMenuOpen(false)}
              className={`font-medium py-2 border-b border-card-border/50 last:border-0 transition-colors ${
                activeSection === item.href ? "text-primary" : "text-text"
              }`}>
              {item.label}
            </Link>
          ))}
          <div className="mt-2">
            <Link href="/diagnostico" onClick={() => setMenuOpen(false)}
              className="bg-brand-gradient text-white rounded-pill px-6 py-3 font-bold text-center block relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700">
              Diagnóstico Gratuito
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
