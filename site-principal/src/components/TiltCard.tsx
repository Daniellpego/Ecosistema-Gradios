"use client";
import { useCallback, useRef, useState } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
}

export function TiltCard({ children, className = "", style, intensity = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -intensity,
      y: (x - 0.5) * intensity,
      active: true,
    });
  }, [intensity]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, active: false });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: tilt.active
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
          : "perspective(800px) rotateX(0) rotateY(0) scale(1)",
        transition: tilt.active
          ? "transform 0.1s ease-out"
          : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
    >
      {children}
    </div>
  );
}
