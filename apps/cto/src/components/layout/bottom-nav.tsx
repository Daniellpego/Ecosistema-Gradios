'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Kanban, GanttChart, Calendar, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOTTOM_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/timeline', label: 'Timeline', icon: GanttChart },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t border-brand-blue-deep/20"
      style={{
        background: 'rgba(10,22,40,0.92)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      role="navigation"
      aria-label="Navegacao principal"
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-[0.92]',
                isActive
                  ? 'text-brand-cyan'
                  : 'text-text-muted'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(0,200,240,0.5)]')} />
                {isActive && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-brand-cyan"
                    style={{ boxShadow: '0 0 6px rgba(0,200,240,0.6)' }}
                  />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-none mt-0.5',
                isActive ? 'text-brand-cyan font-semibold' : 'text-text-muted'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
