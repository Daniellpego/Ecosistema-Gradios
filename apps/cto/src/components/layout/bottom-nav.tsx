'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Kanban, GanttChart, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/timeline', label: 'Timeline', icon: GanttChart },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
] as const

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl rounded-t-[14px]"
      style={{
        background: 'rgba(255,255,255,0.92)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 24px rgba(0,102,138,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-3 pt-2.5 pb-2">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 active:scale-[0.92]',
                isActive
                  ? 'bg-gradient-to-br from-[#00668a] to-[#00BFFF] text-white'
                  : 'text-slate-400 hover:text-[#00BFFF]'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
