'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Kanban, FolderOpen, GanttChart, Calendar,
  FileBarChart, Users, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/timeline', label: 'Timeline', icon: GanttChart },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/relatorios', label: 'Relatorios', icon: FileBarChart },
  { href: '/portal', label: 'Portal Socios', icon: Users },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <Separator />

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 px-3 mb-2 block">
            Gradios CTO
          </span>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group',
                isActive
                  ? 'pl-2 pr-3 bg-brand-cyan/10 text-brand-cyan font-bold border-l-4 border-brand-cyan shadow-[inset_4px_0_10px_-4px_rgba(0,200,240,0.15)]'
                  : 'px-3 text-text-muted hover:bg-bg-hover hover:text-text-primary font-medium'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-brand-cyan')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-bg-hover hover:text-status-negative transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-bg-card border border-brand-blue-deep/40 text-text-primary shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-bg-card border-r border-brand-blue-deep/40"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-bg-card/70 backdrop-blur-xl border-r border-brand-blue-deep/30 transition-all duration-300 z-30',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
