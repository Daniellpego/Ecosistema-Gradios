"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { revealVariants, staggerParent, viewport } from "@/lib/motion";

export function MidCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Scale 0.95 → 1.0 as it enters viewport
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);
  // Text slides up from below
  const textY = useTransform(scrollYProgress, [0, 0.35], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

  return (
    <section ref={sectionRef} className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background gradient — scales in with scroll */}
      <motion.div
        className="absolute inset-0 bg-brand-gradient -z-10 origin-center"
        style={{ scale: bgScale }}
      />
      {/* Diagonal texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08] -z-[5]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)",
          backgroundSize: "16px 16px",
        }}
      />

      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative"
        style={{ y: textY, opacity: textOpacity }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerParent(0.1)}
        >
          <motion.h2
            className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
            variants={revealVariants("scale")}
          >
            2 minutos. 1 diagnóstico.
            <br className="hidden md:block" /> 0 reais.
          </motion.h2>

          <motion.p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto" variants={revealVariants("up")}>
            Responda 10 perguntas e descubra exatamente onde sua operação sangra tempo e dinheiro.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8"
            variants={staggerParent(0.08)}
          >
            {["Os gargalos que custam mais caro", "Quanto você economiza automatizando", "Por onde começar primeiro"].map((item, i) => (
              <motion.div key={i} className="flex items-center gap-2" variants={revealVariants("up")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-white font-medium">{item}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={revealVariants("scale")}>
            <Link
              href="/diagnostico"
              className="inline-block bg-white text-primary rounded-pill px-8 py-4 font-bold text-lg hover:bg-white/90 hover:shadow-xl transition-all relative overflow-hidden before:absolute before:inset-0 before:bg-primary/5 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
            >
              Quero meu diagnóstico gratuito →
            </Link>
            <p className="text-white/60 text-sm mt-4">Gratuito. Sem compromisso. Resultado na hora.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
