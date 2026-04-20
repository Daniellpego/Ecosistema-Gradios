"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { revealVariants, type Direction } from "@/lib/motion";

export function RevealItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  return (
    <motion.div className={className} variants={revealVariants(direction)}>
      {children}
    </motion.div>
  );
}
