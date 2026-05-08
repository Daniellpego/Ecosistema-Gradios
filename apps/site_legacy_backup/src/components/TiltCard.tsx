"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
}

/**
 * 3D tilt card using Framer Motion's useMotionValue — zero re-renders on mouse move.
 * Values flow directly to the GPU compositor layer via motion.div style prop.
 */
export function TiltCard({ children, className = "", style, intensity = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 150, damping: 15 });

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((clientX - rect.left) / rect.width - 0.5);
    rawY.set((clientY - rect.top) / rect.height - 0.5);
  }, [rawX, rawY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
    >
      {children}
    </motion.div>
  );
}
