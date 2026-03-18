'use client'

import type { ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PeriodFilter } from '@/components/period-filter'
import { PeriodProvider } from '@/providers/period-provider'
import { ToastProvider } from '@/components/toast-provider'

export default function AuthenticatedLayoutClient({ children }: { children: ReactNode }) {
  return (
    <PeriodProvider>
      <ToastProvider>
        <div className="min-h-screen bg-bg-navy">
          <Sidebar />
          <main className="lg:pl-[260px] transition-all duration-300">
            {/* Header with period filter */}
            <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="pl-12 lg:pl-0">
                  <PeriodFilter />
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </PeriodProvider>
  )
}
