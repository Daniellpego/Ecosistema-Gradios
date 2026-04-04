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
          className="sticky top-0 z-20 backdrop-blur-xl border-b border-brand-blue-deep/20 px-4 sm:px-6 py-2.5"
          style={{ background: 'rgba(10,22,40,0.9)' }}
          role="banner"
        >
          <div className="flex items-center justify-between pl-9 lg:pl-0">
            <h2 className="text-sm font-semibold text-text-primary">Painel do CTO</h2>
            <div className="flex items-center gap-2.5">
              <CommandPalette />
              <div className="h-2 w-2 rounded-full bg-status-positive" aria-label="Online" role="status" />
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'linear-gradient(135deg, #00C8F0, #1A6AAA)', color: '#0A1628' }}
                aria-label={user.nome}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 pb-24 sm:pb-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
