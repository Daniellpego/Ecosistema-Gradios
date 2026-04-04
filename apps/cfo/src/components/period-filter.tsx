'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { usePeriod } from '@/providers/period-provider'
import { Button } from '@/components/ui/button'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function PeriodFilter() {
  const { month, year, setMonth, setYear } = usePeriod()

  function goBack() {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  function goForward() {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  function goToday() {
    const now = new Date()
    setMonth(now.getMonth() + 1)
    setYear(now.getFullYear())
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Calendar className="h-4 w-4 text-text-secondary hidden sm:block" />
      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={goBack}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex flex-col items-center">
        <button
          onClick={goToday}
          className="text-[13px] sm:text-sm font-semibold text-text-primary hover:text-brand-cyan transition-colors min-w-[120px] sm:min-w-[160px] text-center"
        >
          {MONTHS[month - 1]} {year}
        </button>
        <span className="text-[9px] sm:text-[10px] text-text-muted">Filtra todas as seções</span>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={goForward}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
