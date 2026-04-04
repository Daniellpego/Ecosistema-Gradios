'use client'

import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CommandPalette } from '@/components/command-palette'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function AuthenticatedLayoutClient({ children }: { children: ReactNode }) {
  const { user } = useCurrentUser()

  const initials = user.nome
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="min-h-screen min-h-[100dvh] bg-bg-navy">
      <Sidebar />
      <main className="lg:pl-[260px] transition-all duration-300" role="main">
        <header
          className="sticky top-0 z-20 backdrop-blur-xl border-b border-brand-blue-deep/15 px-3 sm:px-6 py-2.5 sm:py-3"
          style={{ background: 'rgba(10,22,40,0.85)' }}
          role="banner"
        >
          <div className="flex items-center justify-between pl-11 lg:pl-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-[13px] sm:text-sm font-bold text-text-primary truncate">Painel do CTO</h2>
              <span className="text-xs text-text-muted hidden sm:inline">&middot; Gradios</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <CommandPalette />
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-status-positive" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} aria-label="Sistema online" role="status" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs text-text-secondary font-medium hidden sm:inline">{user.nome}</span>
                <div
                  className="h-7 w-7 rounded-[8px] flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #00C8F0, #1A6AAA)', color: '#0A1628' }}
                  aria-label={`Avatar de ${user.nome}`}
                >
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-3 sm:p-6 pb-24 sm:pb-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
