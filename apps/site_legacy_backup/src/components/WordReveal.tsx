"use client";

import { motion } from "framer-motion";
import { viewport } from "@/lib/motion";

interface WordRevealProps {
  text: string;
  className?: string;
  staggerMs?: number;
  as?: "h2" | "h3" | "p";
}

const wordVariants = {
  hidden: { y: "110%", rotate: 4, opacity: 0 },
  visible: {
    y: 0,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 12 },
  },
};

export function WordReveal({ text, className = "", staggerMs = 0.06, as: Tag = "h2" }: WordRevealProps) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ ...viewport, amount: 0.5 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: staggerMs } },
        }}
        className="inline"
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.3em] last:mr-0">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
