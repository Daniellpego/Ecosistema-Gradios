'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/sidebar'
import { PeriodFilter } from '@/components/period-filter'
import { PeriodProvider } from '@/providers/period-provider'
import { TaxProvider, useTax } from '@/providers/tax-provider'
import { Switch } from '@/components/ui/switch'

function SimplesToggle() {
  const { simplesEnabled, setSimplesEnabled, aliquota, anexo, setAnexo } = useTax()

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Switch
        checked={simplesEnabled}
        onCheckedChange={setSimplesEnabled}
        aria-label="Toggle Simples Nacional"
      />
      <span className={cn(
        'text-[10px] sm:text-xs font-medium whitespace-nowrap',
        simplesEnabled ? 'text-status-warning' : 'text-text-secondary'
      )}>
        Simples {aliquota.toFixed(1)}%
      </span>
      {simplesEnabled && (
        <select
          value={anexo}
          onChange={(e) => setAnexo(e.target.value as 'III' | 'V')}
          className="text-[10px] bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-text-secondary"
        >
          <option value="III">III</option>
          <option value="V">V</option>
        </select>
      )}
    </div>
  )
}

export default function AuthenticatedLayoutClient({ children }: { children: ReactNode }) {
  return (
    <PeriodProvider>
      <TaxProvider>
        <div className="min-h-screen min-h-[100dvh]">
          <Sidebar />
          <main className="lg:pl-[260px] transition-all duration-300">
            {/* Header with period filter */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-3 sm:px-6 py-2.5 sm:py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="pl-11 lg:pl-0 flex-1 min-w-0">
                  <PeriodFilter />
                </div>
                <div className="shrink-0">
                  <SimplesToggle />
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="p-3 sm:p-6 pb-20 sm:pb-6">
              {children}
            </div>
          </main>
        </div>
      </TaxProvider>
    </PeriodProvider>
  )
}
