'use client'

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { subDays, format } from 'date-fns'

type PeriodPreset = '7d' | '30d' | '90d' | 'custom'

interface PeriodContextType {
  preset: PeriodPreset
  setPreset: (preset: PeriodPreset) => void
  startDate: string
  endDate: string
  setCustomRange: (start: string, end: string) => void
  label: string
}

const PeriodContext = createContext<PeriodContextType | null>(null)

const PRESET_LABELS: Record<PeriodPreset, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  custom: 'Personalizado',
}

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<PeriodPreset>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    const end = format(today, 'yyyy-MM-dd')

    if (preset === 'custom' && customStart && customEnd) {
      return { startDate: customStart, endDate: customEnd }
    }

    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[preset] ?? 30
    const start = format(subDays(today, days), 'yyyy-MM-dd')
    return { startDate: start, endDate: end }
  }, [preset, customStart, customEnd])

  function setCustomRange(start: string, end: string) {
    setCustomStart(start)
    setCustomEnd(end)
    setPreset('custom')
  }

  return (
    <PeriodContext.Provider
      value={{
        preset,
        setPreset,
        startDate,
        endDate,
        setCustomRange,
        label: PRESET_LABELS[preset],
      }}
    >
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod() {
  const context = useContext(PeriodContext)
  if (!context) {
    throw new Error('usePeriod must be used within PeriodProvider')
  }
  return context
}
