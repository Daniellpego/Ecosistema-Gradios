"use client";
import { useCallback, useRef, useState } from "react";

export function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateSplit = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    setSplit(pct);
  }, []);

  const handleMouseDown = useCallback(() => setDragging(true), []);
  const handleMouseUp = useCallback(() => setDragging(false), []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) updateSplit(e.clientX);
  }, [dragging, updateSplit]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) updateSplit(touch.clientX);
  }, [updateSplit]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden select-none cursor-col-resize"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 relative">
        {/* Before (full width background) */}
        <div className="absolute inset-0 bg-red-50 border border-red-200/60 rounded-xl" />

        {/* Before content */}
        <div className="relative p-5 sm:p-6 z-10" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Antes
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-display text-red-600 mb-1">3 dias</div>
          <p className="text-sm text-red-400">Processo manual, planilhas, erros frequentes</p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-1.5 flex-1 bg-red-200 rounded-full" />
            ))}
          </div>
        </div>

        {/* After (overlaid) */}
        <div
          className="absolute inset-0 bg-green-50 border border-green-200/60 rounded-xl z-20"
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        >
          <div className="absolute right-0 top-0 bottom-0 p-5 sm:p-6 w-1/2 sm:w-full" style={{ marginLeft: "auto" }}>
            <div className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Depois
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-display text-green-600 mb-1">4 horas</div>
            <p className="text-sm text-green-500">Automatizado, sem erro, relatório pronto</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-1.5 flex-1 bg-green-300 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${30 + i * 25}%`, transition: "width 0.5s ease" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drag handle */}
        <div
          className="absolute top-0 bottom-0 z-30 flex items-center justify-center"
          style={{ left: `${split}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-[3px] h-full bg-primary/60" />
          <div className="absolute w-10 h-10 rounded-full bg-white border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center cursor-col-resize hover:scale-110 active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-sm text-text-muted text-[10px] font-medium px-3 py-1 rounded-full border border-card-border">
        ← arraste para comparar →
      </div>
    </div>
  );
}
