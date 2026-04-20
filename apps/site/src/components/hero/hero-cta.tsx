"use client";

import Link from "next/link";
import { trackCTAClick } from "@/lib/meta-pixel";

export function HeroCta() {
  return (
    <Link
      href="/diagnostico"
      onClick={() => trackCTAClick("Hero", "Descobrir quanto perco", "/diagnostico")}
      className="animate-cta-pulse bg-brand-gradient text-white rounded-pill px-8 py-4 font-bold hover:shadow-lg hover:shadow-[#2546BD]/30 hover:opacity-90 transition-all text-center w-full sm:w-auto relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700 text-base sm:text-lg"
    >
      Descobrir quanto perco por mês
    </Link>
  );
}
