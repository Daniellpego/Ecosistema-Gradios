"use client";

import { useEffect, useState } from "react";

const PROGRESS_ITEMS = [
  { label: "Faturamento", pct: 85, color: "bg-brand-gradient" },
  { label: "Onboarding", pct: 65, color: "bg-primary" },
  { label: "Cobrança", pct: 40, color: "bg-secondary" },
  { label: "Relatórios", pct: 92, color: "bg-brand-gradient" },
];

export function HeroProgressBars() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="sm:col-span-2 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
      <span className="text-[11px] text-white/60 font-medium block mb-4">Fluxos Ativos</span>
      <div className="space-y-4">
        {PROGRESS_ITEMS.map((item, i) => (
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
  );
}
