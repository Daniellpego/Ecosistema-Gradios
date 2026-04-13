'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Kanban, GanttChart, Calendar, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/timeline', label: 'Timeline', icon: GanttChart },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const isOtherPage = pathname?.startsWith('/relatorios') || pathname?.startsWith('/portal')

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl rounded-t-[14px]"
      style={{
        background: 'rgba(255,255,255,0.95)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
        boxShadow: '0 -4px 24px rgba(0,102,138,0.08)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-0.5 py-1.5 px-2.5 rounded-[14px] transition-all duration-200 active:scale-[0.90]',
                isActive
                  ? 'bg-gradient-to-br from-[#00668a] to-[#00BFFF] text-white shadow-lg shadow-brand-cyan/20'
                  : 'text-slate-400'
              )}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className={cn('text-[10px] font-medium leading-tight', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* "Mais" button — opens sidebar for Relatórios & Portal */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))}
          className={cn(
            'flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-0.5 py-1.5 px-2.5 rounded-[14px] transition-all duration-200 active:scale-[0.90]',
            isOtherPage
              ? 'bg-gradient-to-br from-[#00668a] to-[#00BFFF] text-white shadow-lg shadow-brand-cyan/20'
              : 'text-slate-400'
          )}
        >
          <MoreHorizontal className="h-[22px] w-[22px]" />
          <span className={cn('text-[10px] font-medium leading-tight', isOtherPage && 'font-semibold')}>
            Mais
          </span>
        </button>
      </div>
    </nav>
  )
}
