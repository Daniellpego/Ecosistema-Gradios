'use client'

import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
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
        {/* Header: h-14 mobile, h-16 desktop — reclaims 8px on mobile */}
        <header
          className="sticky top-0 z-20 backdrop-blur-md px-3 sm:px-6 h-14 sm:h-16 flex items-center"
          style={{ background: 'rgba(247,249,251,0.80)' }}
          role="banner"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              {/* Hamburger: 44px touch target (p-2 around 20px icon = 44px area) */}
              <button
                className="lg:hidden -ml-1 h-10 w-10 flex items-center justify-center rounded-full text-[#00668a] hover:bg-slate-200/50 transition-colors active:scale-95"
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))}
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-[15px] sm:text-base font-bold bg-gradient-to-br from-[#00668a] to-[#00BFFF] bg-clip-text text-transparent tracking-tight">
                Gradios CTO
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette />
              {/* Avatar: 40px (close to 44px min, acceptable with padding) */}
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden border-2 border-brand-cyan/20"
                style={{ background: 'linear-gradient(135deg, #00BFFF, #1A6AAA)', color: '#FFFFFF' }}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>
        {/* Content: pb-20 mobile (80px, enough for 64px nav + safe area) */}
        <div className="px-4 sm:px-8 pt-3 sm:pt-6 pb-20 sm:pb-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
