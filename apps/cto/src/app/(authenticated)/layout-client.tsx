'use client'

import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CommandPalette } from '@/components/command-palette'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function AuthenticatedLayoutClient({ children }: { children: ReactNode }) {
  const { user } = useCurrentUser()
  const initials = user.nome.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50">
      <Sidebar />
      <main className="lg:pl-[260px] transition-all duration-300" role="main">
        <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 py-2" style={{ background: 'rgba(255,255,255,0.92)' }} role="banner">
          <div className="flex items-center justify-between pl-9 lg:pl-0">
            <h2 className="text-[13px] sm:text-sm font-semibold text-text-primary">Painel do CTO</h2>
            <div className="flex items-center gap-2">
              <CommandPalette />
              <div className="h-2 w-2 rounded-full bg-status-positive" />
              <div className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #00BFFF, #1A6AAA)', color: '#FFFFFF' }}>{initials}</div>
            </div>
          </div>
        </header>
        <div className="p-3.5 sm:p-6 pb-20 sm:pb-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
