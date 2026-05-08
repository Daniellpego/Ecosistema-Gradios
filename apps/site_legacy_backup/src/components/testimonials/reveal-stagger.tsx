"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerParent } from "@/lib/motion";

export function RevealStagger({
  children,
  className,
  stagger = 0.1,
  amount = 0.15,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={staggerParent(stagger)}
    >
      {children}
    </motion.div>
  );
}
