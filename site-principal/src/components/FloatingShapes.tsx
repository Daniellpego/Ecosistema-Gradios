"use client";
import { useEffect, useState, useRef } from "react";

const shapes = [
  { size: 80, x: "8%",  y: 300,  speed: 0.03,  color: "rgba(37, 70, 189, 0.06)", blur: 0 },
  { size: 60, x: "85%", y: 600,  speed: -0.04, color: "rgba(0, 191, 255, 0.05)",  blur: 1 },
  { size: 120,x: "72%", y: 1200, speed: 0.025, color: "rgba(37, 70, 189, 0.04)", blur: 2 },
  { size: 50, x: "15%", y: 1800, speed: -0.05, color: "rgba(0, 191, 255, 0.06)",  blur: 0 },
  { size: 90, x: "90%", y: 2400, speed: 0.035, color: "rgba(37, 70, 189, 0.05)", blur: 1 },
  { size: 40, x: "5%",  y: 3200, speed: -0.03, color: "rgba(0, 191, 255, 0.07)",  blur: 0 },
  { size: 70, x: "50%", y: 3800, speed: 0.04,  color: "rgba(37, 70, 189, 0.04)", blur: 2 },
  { size: 55, x: "30%", y: 4500, speed: -0.035,color: "rgba(0, 191, 255, 0.05)",  blur: 1 },
];

export function FloatingShapes() {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {shapes.map((shape, i) => {
        const translateY = scrollY * shape.speed;
        const rotate = scrollY * shape.speed * 2;
        return (
          <div
            key={i}
            className="absolute rounded-2xl"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
              background: shape.color,
              border: `1px solid ${shape.color.replace(/[\d.]+\)$/, "0.15)")}`,
              transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
              filter: shape.blur > 0 ? `blur(${shape.blur}px)` : undefined,
              willChange: "transform",
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "30%" : "16px",
            }}
          />
        );
      })}
    </div>
  );
}
