'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'

// Fast, snappy transitions — no sluggish animations
const FAST = { duration: 0.1, ease: 'easeOut' } as const

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={FAST}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.02 } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 4 },
        visible: { opacity: 1, y: 0, transition: FAST },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  return (
    <motion.span key={value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
      {format(value)}
    </motion.span>
  )
}

export const MotionCard = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
)
MotionCard.displayName = 'MotionCard'
