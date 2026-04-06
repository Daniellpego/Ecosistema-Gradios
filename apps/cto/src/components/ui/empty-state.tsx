import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string; accentColor?: string }

export function EmptyState({ icon: Icon, title, description, action, className, accentColor = '#00BFFF' }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 sm:py-12 text-center', className)} role="status">
      <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${accentColor}08`, border: `1px dashed ${accentColor}30` }}>
        <Icon className="h-6 w-6 relative z-10 opacity-60" style={{ color: accentColor }} />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-text-muted max-w-xs sm:max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
