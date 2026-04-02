'use client'

import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function AuthenticatedLayoutClient({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser()

  const initials = user?.nome
    ? user.nome.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-bg-navy">
      <Sidebar />
      <main className="lg:pl-[260px] transition-all duration-300">
        <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-brand-blue-deep/20 px-4 sm:px-6 py-3" style={{ background: 'rgba(10,22,40,0.8)' }}>
          <div className="flex items-center justify-between pl-12 lg:pl-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-text-primary">Painel do CTO</h2>
              <span className="text-xs text-text-muted hidden sm:inline">&middot; Gradios</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-status-positive" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary font-medium hidden sm:inline">{user.nome}</span>
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #00C8F0, #1A6AAA)', color: '#0A1628' }}
                  >
                    {initials}
                  </div>
                </div>
              )}
              {!user && <span className="text-xs text-text-muted">Carregando...</span>}
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
