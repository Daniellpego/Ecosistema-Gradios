'use client'

import { Calendar } from 'lucide-react'
import { usePeriod } from '@/providers/period-provider'
import { Button } from '@/components/ui/button'

const PRESETS = [
  { value: '7d' as const, label: '7 dias' },
  { value: '30d' as const, label: '30 dias' },
  { value: '90d' as const, label: '90 dias' },
]

export function PeriodFilter() {
  const { preset, setPreset, label } = usePeriod()

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-text-secondary" />
      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            variant={preset === p.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreset(p.value)}
            className="text-xs"
          >
            {p.label}
          </Button>
        ))}
      </div>
      <span className="text-xs text-text-secondary hidden sm:inline ml-2">{label}</span>
    </div>
  )
}
