'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Kanban, GanttChart, Calendar,
  FileBarChart, Users, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/use-current-user'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/timeline', label: 'Timeline', icon: GanttChart },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  { href: '/portal', label: 'Portal Sócios', icon: Users },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useCurrentUser()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = user.nome
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-[8px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <Separator />

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted/50 px-3 mb-2 block">
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
                'flex items-center gap-3 py-2 rounded-[10px] text-[13px] transition-all duration-200 relative group',
                collapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'bg-brand-cyan/10 text-brand-cyan font-semibold border border-brand-cyan/10 shadow-sm'
                  : 'px-3 text-text-muted hover:bg-bg-hover hover:text-text-primary font-medium'
              )}
            >
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-cyan" />
              )}
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-brand-cyan', !collapsed && isActive && 'ml-2')} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-brand-cyan" />
              )}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User area */}
      <div className="p-4 space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #00C8F0, #1A6AAA)', color: '#0A1628' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user.nome}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #00C8F0, #1A6AAA)', color: '#0A1628' }}
              title={user.nome}
            >
              {initials}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          aria-label="Sair da conta"
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-[10px] text-[13px] font-medium text-text-muted hover:bg-status-negative/10 hover:text-status-negative transition-all duration-200',
            collapsed && 'justify-center'
          )}
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
        className="lg:hidden fixed top-[10px] left-3 z-30 h-8 w-8 flex items-center justify-center rounded-lg bg-bg-card/90 backdrop-blur border border-brand-blue-deep/25 text-text-primary active:scale-95 transition-transform"
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
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 backdrop-blur-xl border-r border-brand-blue-deep/30 transition-all duration-300 z-30',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
        style={{ background: 'rgba(19,31,53,0.85)' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
