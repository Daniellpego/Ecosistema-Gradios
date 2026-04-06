import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Ensures a hex color string starts with '#' */
export function normalizeColor(color: string | null | undefined, fallback = '#00BFFF'): string {
  if (!color) return fallback
  return color.startsWith('#') ? color : `#${color}`
}
