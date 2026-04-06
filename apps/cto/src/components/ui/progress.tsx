import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  className?: string
  showLabel?: boolean
}

function getProgressGradient(value: number): string {
  if (value < 25) return 'linear-gradient(90deg, #EF4444, #F59E0B)'
  if (value < 50) return 'linear-gradient(90deg, #F59E0B, #F59E0B)'
  if (value < 75) return 'linear-gradient(90deg, #F59E0B, #00BFFF)'
  return 'linear-gradient(90deg, #1A6AAA, #10B981)'
}

export function Progress({ value, className, showLabel = false }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="progress-bar flex-1">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${clampedValue}%`, background: getProgressGradient(clampedValue) }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-text-secondary w-9 text-right">{Math.round(clampedValue)}%</span>}
    </div>
  )
}
