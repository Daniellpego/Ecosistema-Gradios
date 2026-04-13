'use client'

import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CommandPalette } from '@/components/command-palette'
import { UserAvatar } from '@/components/layout/user-avatar'

export default function AuthenticatedLayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ background: '#f7f9fb' }}>
      <Sidebar />
      <main className="lg:pl-[260px] transition-all duration-300" role="main">
        <header
          className="sticky top-0 z-20 backdrop-blur-md px-3 sm:px-6 flex items-center"
          style={{
            background: 'rgba(247,249,251,0.92)',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            height: 'calc(56px + env(safe-area-inset-top, 0px))',
          }}
          role="banner"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <button
                className="lg:hidden -ml-1 h-10 w-10 flex items-center justify-center rounded-full text-[#00668a] active:bg-slate-200/50 transition-colors active:scale-95"
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
              <UserAvatar size="md" />
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-8 pt-3 sm:pt-6 pb-24 sm:pb-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
