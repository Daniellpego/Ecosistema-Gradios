"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed top-0 left-0 right-0 z-[45] hidden md:flex items-center justify-center gap-5 bg-brand-gradient py-2.5 px-4 shadow-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <p className="text-sm font-medium text-white">
        Descubra quanto sua empresa perde por mês em retrabalho manual
      </p>
      <Link
        href="/diagnostico"
        tabIndex={visible ? 0 : -1}
        className="rounded-pill bg-white px-5 py-1.5 text-sm font-bold text-primary hover:bg-white/90 transition-colors"
      >
        Diagnóstico gratuito →
      </Link>
    </div>
  );
}
