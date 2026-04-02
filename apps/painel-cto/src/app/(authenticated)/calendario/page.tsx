'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Milestone, Calendar as CalIcon } from 'lucide-react'
import { PageTransition, StaggerItem } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, normalizeColor } from '@/lib/utils'
import { useAllMilestones } from '@/hooks/use-milestones'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'milestone' | 'tarefa' | 'gcal'
  color: string
  project?: string
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: milestones, isLoading } = useAllMilestones({ start, end })

  const events: CalendarEvent[] = useMemo(() => {
    return (milestones ?? []).map((m) => ({
      id: m.id,
      title: m.titulo,
      date: m.data_prevista,
      type: 'milestone' as const,
      color: normalizeColor(m.projetos?.cor),
      project: m.projetos?.titulo ?? undefined,
    }))
  }, [milestones])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const days: { date: number; month: number; isCurrentMonth: boolean }[] = []

    const prevLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: prevLastDay - i, month: month - 1, isCurrentMonth: false })
    }

    for (let d = 1; d <= lastDay; d++) {
      days.push({ date: d, month, isCurrentMonth: true })
    }

    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: d, month: month + 1, isCurrentMonth: false })
    }

    return days
  }, [year, month, lastDay])

  const today = new Date()
  const isToday = (date: number, m: number) => date === today.getDate() && m === today.getMonth() && year === today.getFullYear()

  function getEventsForDay(date: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return events.filter((e) => e.date === dateStr)
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-9 w-48 rounded-xl" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="section-header-icon" style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.2)' }}>
              <CalIcon className="h-4 w-4 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Calendario</h1>
              <p className="text-xs text-text-muted">{events.length} evento{events.length !== 1 ? 's' : ''} neste mes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="h-8 w-8 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold text-text-primary min-w-[160px] text-center px-3 py-1.5 rounded-lg" style={{ background: 'rgba(21,59,95,0.3)' }}>
              {MONTHS[month]} {year}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="h-8 w-8 rounded-lg">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <StaggerItem>
          <div className="card-glass !p-0 overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-brand-blue-deep/20">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-text-muted py-3">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dayEvents = day.isCurrentMonth ? getEventsForDay(day.date) : []
                const todayMatch = isToday(day.date, day.month)
                return (
                  <div
                    key={i}
                    className={cn(
                      'min-h-[100px] border-b border-r border-brand-blue-deep/12 p-1.5 transition-colors hover:bg-bg-hover/20',
                      !day.isCurrentMonth && 'bg-bg-navy/40',
                      todayMatch && 'bg-brand-cyan/[0.04]'
                    )}
                  >
                    <span className={cn(
                      'text-xs font-medium inline-flex h-6 w-6 items-center justify-center rounded-full',
                      !day.isCurrentMonth && 'text-text-muted/30',
                      day.isCurrentMonth && 'text-text-secondary',
                      todayMatch && 'bg-brand-cyan text-bg-navy font-bold shadow-sm'
                    )}
                    style={todayMatch ? { boxShadow: '0 0 8px rgba(0,200,240,0.4)' } : undefined}
                    >
                      {day.date}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium cursor-default"
                          style={{ background: `${evt.color}18`, color: evt.color, border: `1px solid ${evt.color}20` }}
                          title={`${evt.title} - ${evt.project ?? ''}`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-text-muted px-1.5 font-medium">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </StaggerItem>

        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-cyan" style={{ boxShadow: '0 0 6px rgba(0,200,240,0.4)' }} />
            <span className="text-xs text-text-muted font-medium">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <Milestone className="h-3.5 w-3.5 text-brand-cyan" />
            <span className="text-xs text-text-muted font-medium">Milestones</span>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
