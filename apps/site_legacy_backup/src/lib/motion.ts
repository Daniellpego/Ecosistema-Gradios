/* ═══════════════════════════════════════════════════════════════════
 * MOTION PRESETS — Single source of truth for all animations
 * Uses spring physics instead of CSS easings for organic feel.
 * ═══════════════════════════════════════════════════════════════════ */

import type { Variants, Transition } from "framer-motion";

/* ── Spring Presets ── */
export const spring = {
  /** General content reveals — smooth and natural */
  smooth: { type: "spring", stiffness: 100, damping: 20 } as Transition,
  /** Text and subtle reveals — slower, gentler */
  gentle: { type: "spring", stiffness: 80, damping: 18 } as Transition,
  /** UI elements, buttons — responsive */
  snappy: { type: "spring", stiffness: 300, damping: 25 } as Transition,
  /** Attention-grabbing — playful bounce */
  bouncy: { type: "spring", stiffness: 400, damping: 10 } as Transition,
};

/* ── Direction Types ── */
export type Direction = "up" | "down" | "left" | "right" | "scale" | "blur";

/* ── Direction Variants ── */
const directionMap: Record<Direction, { hidden: Record<string, number | string>; visible: Record<string, number | string> }> = {
  up:    { hidden: { opacity: 0, y: 40 },        visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -40 },       visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: 50 },        visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -50 },       visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.92 },  visible: { opacity: 1, scale: 1 } },
  blur:  { hidden: { opacity: 0, filter: "blur(8px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
};

/** Get variants for a specific direction */
export function revealVariants(direction: Direction = "up", springPreset: Transition = spring.smooth): Variants {
  const d = directionMap[direction];
  return {
    hidden: d.hidden,
    visible: { ...d.visible, transition: springPreset },
  };
}

/** Parent variant for staggering children */
export function staggerParent(staggerDelay = 0.08): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  };
}

/** Standard viewport detection config */
export const viewport = { once: true, amount: 0.15 } as const;
