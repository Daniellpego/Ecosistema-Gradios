'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  LayoutDashboard, Kanban, GanttChart, Calendar,
  FileBarChart, Users, LogOut, X, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/use-current-user'
import { UserAvatar } from '@/components/layout/user-avatar'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/timeline', label: 'Timeline', icon: GanttChart },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  { href: '/portal', label: 'Portal Sócios', icon: Users },
] as const

const SIDEBAR_WIDTH = 260

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useCurrentUser()

  // Swipe-to-close
  const x = useMotionValue(0)
  const overlayOpacity = useTransform(x, [-SIDEBAR_WIDTH, 0], [0, 1])

  useEffect(() => {
    const handler = () => setMobileOpen(true)
    window.addEventListener('toggle-mobile-sidebar', handler)
    return () => window.removeEventListener('toggle-mobile-sidebar', handler)
  }, [])

  const handleDragEnd = useCallback((_: never, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -300) {
      setMobileOpen(false)
    }
  }, [])

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
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-[8px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <Separator />

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Menu principal">
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
                'flex items-center gap-3 min-h-[44px] rounded-[10px] text-[13px] transition-all duration-200 relative',
                collapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'bg-brand-cyan/10 text-brand-cyan font-semibold border border-brand-cyan/10 shadow-sm'
                  : 'px-3 text-text-muted active:bg-bg-hover active:text-text-primary font-medium'
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

      <div className="p-4 space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2">
            <UserAvatar size="sm" editable />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user.nome}</p>
              <p className="text-[11px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <UserAvatar size="sm" />
          </div>
        )}
        <button
          onClick={handleLogout}
          aria-label="Sair da conta"
          className={cn(
            'flex items-center gap-3 w-full min-h-[44px] px-3 rounded-[10px] text-[13px] font-medium text-text-muted active:bg-status-negative/10 active:text-status-negative transition-all duration-200',
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
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay — taps to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ opacity: overlayOpacity }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/40"
            />
            {/* Sidebar — swipe left to close */}
            <motion.aside
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              drag="x"
              dragConstraints={{ left: -SIDEBAR_WIDTH, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              style={{ x }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-white touch-pan-y"
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-3 h-11 w-11 flex items-center justify-center rounded-xl text-text-secondary active:text-text-primary active:bg-slate-100 transition-colors z-10"
                style={{ top: 'calc(12px + env(safe-area-inset-top, 0px))' }}
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
