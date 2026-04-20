"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";

export function HeroDashboardFrame({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const dashRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -36]);
  const springParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 30 });

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const glowOpacity = useMotionValue(0);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dashRef.current) return;
      const rect = dashRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - 200);
      mouseY.set(e.clientY - rect.top - 200);
      glowOpacity.set(1);
    },
    [mouseX, mouseY, glowOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    glowOpacity.set(0);
  }, [glowOpacity]);

  const mockupVariants = {
    hidden: {
      opacity: 0,
      rotateX: isMobile ? 0 : 8,
      rotateY: isMobile ? 0 : -4,
      y: isMobile ? 20 : 60,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      rotateX: isMobile ? 0 : 4,
      rotateY: 0,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 60, damping: 18, delay: 0.4 },
    },
  };

  return (
    <motion.div
      ref={dashRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={mockupVariants}
      initial="hidden"
      animate="visible"
      style={{ y: isMobile ? 0 : springParallaxY, transformStyle: "preserve-3d" }}
    >
      {/* Cursor glow — zero re-renders via MotionValues */}
      <motion.div
        className="absolute -z-0 pointer-events-none rounded-full"
        style={{
          width: 400,
          height: 400,
          left: mouseX,
          top: mouseY,
          opacity: glowOpacity,
          background: "radial-gradient(circle, rgba(0,194,224,0.12) 0%, transparent 70%)",
        }}
      />
      {children}
    </motion.div>
  );
}
