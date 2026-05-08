"use client";

import { useEffect, useState } from "react";

const BAR_HEIGHTS = [35, 50, 30, 65, 55, 80, 42, 90, 60, 85, 48, 72, 58, 78];

export function HeroBarChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="sm:col-span-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-white/60 font-medium">Performance Semanal</span>
        <div className="flex gap-1.5">
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">7d</span>
          <span className="text-[10px] text-white bg-brand-gradient px-2 py-0.5 rounded font-medium">30d</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-24 sm:h-28">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <div
              className="w-full rounded-sm"
              style={{
                height: mounted ? `${h}%` : "0%",
                background:
                  h > 70
                    ? "linear-gradient(to top, #2546BD, #00BFFF)"
                    : "linear-gradient(to top, rgba(37,70,189,0.3), rgba(0,191,255,0.25))",
                transition: `height ${800 + i * 60}ms ease-out ${i * 40}ms`,
                animation: mounted ? `barBreath 5s ease-in-out ${2 + i * 0.2}s infinite` : "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
