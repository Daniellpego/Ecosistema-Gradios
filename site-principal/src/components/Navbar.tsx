"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "#solucoes", label: "Soluções" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#cases", label: "Cases" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024) setMenuOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-card-border" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2.5">
            <Image src="/logo.webp" alt="Gradios Logo" width={200} height={183} className="w-11 h-auto drop-shadow-md" priority />
            <Link href="/" className="font-bold text-[22px] tracking-tight text-text font-display">
              Gradios
            </Link>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors link-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: hamburger (mobile only) + CTA */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="p-2 rounded-lg hover:bg-bg-alt transition text-text lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* CTA */}
            <Link
              href="/diagnostico"
              className="bg-brand-gradient text-white rounded-pill py-3 px-6 font-bold text-center text-sm sm:text-base relative overflow-hidden hover:shadow-lg hover:shadow-[#0A1B5C]/25 transition-all before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
            >
              Diagnóstico Gratuito
            </Link>
          </div>
        </div>
      </div>

      {/* Dropdown menu — mobile only */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-card-border shadow-lg overflow-hidden lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="py-4 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium py-2 sm:py-0 border-b border-card-border/50 sm:border-0 last:border-0 text-text hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
