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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t border-slate-200/80" style={{ background: 'rgba(255,255,255,0.92)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-1.5">
        {ITEMS.map((item) => { const isActive = pathname === item.href || pathname?.startsWith(item.href + '/'); const Icon = item.icon; return (
          <Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-[0.92]', isActive ? 'text-brand-cyan' : 'text-text-muted')}>
            <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(0,191,255,0.4)]')} />
            <span className={cn('text-[10px] font-medium', isActive ? 'text-brand-cyan font-semibold' : 'text-text-muted')}>{item.label}</span>
          </Link>
        )})}
      </div>
    </nav>
  )
}
