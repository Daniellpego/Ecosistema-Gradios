"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { revealVariants, staggerParent, viewport } from "@/lib/motion";

export function LeadForm() {
  const [hovered, setHovered] = useState(false);

  return (
    <section id="contato" className="relative z-10 py-16 lg:py-24 overflow-hidden">
      {/* Background — seamless into footer */}
      <div className="absolute inset-0 bg-[#0A1628] -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#2546BD]/10 rounded-full blur-[120px] -z-[5]" />

      {/* Hover glow — "ignição" cyan */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/4 w-[500px] h-[500px] rounded-full -z-[4] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(0,191,255,0.15) 0%, transparent 70%)",
          opacity: hovered ? 1 : 0,
          transform: `translate(-50%, -25%) scale(${hovered ? 1.1 : 0.8})`,
        }}
      />

      <motion.div
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerParent(0.1)}
      >
        <motion.div
          className="inline-flex items-center bg-[#00BFFF]/10 text-[#00BFFF] font-semibold border border-[#00BFFF]/20 rounded-pill text-sm px-4 py-1.5 tracking-wide mb-6"
          variants={revealVariants("up")}
        >
          Último passo
        </motion.div>

        <motion.h2
          className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
          variants={revealVariants("scale")}
        >
          Se você leu até aqui,
          <br className="hidden sm:block" />
          seu processo precisa de nós.
        </motion.h2>

        <motion.p
          className="text-[#94A3B8] text-lg mb-8 max-w-xl mx-auto"
          variants={revealVariants("up")}
        >
          10 perguntas. 2 minutos. Um relatório com os gargalos da sua operação e quanto eles custam por mês. De graça.
        </motion.p>

        <motion.div variants={revealVariants("scale")}>
          <Link
            href="/diagnostico"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="inline-block bg-gradient-to-r from-[#2546BD] to-[#00BFFF] text-white rounded-pill px-10 py-5 font-bold text-lg transition-all duration-500 relative overflow-hidden before:absolute before:inset-0 before:bg-white/15 before:-translate-x-full before:skew-x-12 hover:before:translate-x-[200%] before:transition-transform before:duration-700"
            style={{
              boxShadow: hovered
                ? "0 0 60px rgba(0,191,255,0.35), 0 0 120px rgba(0,191,255,0.15), 0 20px 40px rgba(0,191,255,0.2)"
                : "0 4px 14px rgba(37,70,189,0.25)",
            }}
          >
            Fazer meu diagnóstico agora
          </Link>
          <p className="text-[#475569] text-sm mt-4">Gratuito. Sem compromisso. Resultado gerado por IA na hora.</p>
        </motion.div>

        {/* Micro trust */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-6 flex-wrap"
          variants={revealVariants("up")}
        >
          {[
            { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Dados protegidos" },
            { icon: "M22 11.08V12a10 10 0 11-5.93-9.14", text: "Sem spam" },
            { icon: "M22 12h-4l-3 9L9 3l-3 9H2", text: "Resultado em minutos" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[#64748B]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="text-xs font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
