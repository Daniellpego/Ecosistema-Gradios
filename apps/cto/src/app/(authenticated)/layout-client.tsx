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
    <div className="min-h-screen min-h-[100dvh]" style={{ background: '#f7f9fb' }}>
      <Sidebar />
      <main className="lg:pl-[260px] transition-all duration-300" role="main">
        <header
          className="sticky top-0 z-20 backdrop-blur-md px-4 sm:px-6 h-14 flex items-center"
          style={{ background: 'rgba(247,249,251,0.85)' }}
          role="banner"
        >
          <div className="flex items-center justify-between w-full pl-10 lg:pl-0">
            <h2
              className="text-[15px] sm:text-base font-extrabold bg-gradient-to-br from-[#00668a] to-[#00BFFF] bg-clip-text text-transparent tracking-tight"
            >
              Gradios CTO
            </h2>
            <div className="flex items-center gap-3">
              <CommandPalette />
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden border-2 border-brand-cyan/20"
                style={{ background: 'linear-gradient(135deg, #00BFFF, #1A6AAA)', color: '#FFFFFF' }}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-24 sm:pb-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
