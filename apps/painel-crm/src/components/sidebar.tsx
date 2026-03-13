'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Kanban,
  DollarSign,
  BarChart3,
  Handshake,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useQuizRealtime } from '@/hooks/use-quiz-realtime'
import { useToast } from '@/components/toast-provider'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users, hasBadge: true },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/deals', label: 'Deals', icon: DollarSign },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/clientes', label: 'Clientes', icon: Handshake },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hasNewLeads, setHasNewLeads] = useState(false)
  const { addToast } = useToast()

  // Quiz → CRM: auto-create lead when quiz_sessions receives INSERT
  useQuizRealtime(useCallback(() => {
    setHasNewLeads(true)
    addToast('Novo lead criado via Quiz!', 'success')
  }, [addToast]))

  // Check for leads created in the last hour
  useEffect(() => {
    async function checkNewLeads() {
      const supabase = createClient()
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo)

      setHasNewLeads((count ?? 0) > 0)
    }

    checkNewLeads()

    // Subscribe to new leads via Realtime
    const supabase = createClient()
    const channel = supabase
      .channel('sidebar-leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        () => {
          setHasNewLeads(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Clear badge when visiting leads page
  useEffect(() => {
    if (pathname === '/leads' || pathname?.startsWith('/leads/')) {
      setHasNewLeads(false)
    }
  }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-brand-cyan/10 text-brand-cyan border-l-[3px] border-brand-cyan'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              )}
            >
              <div className="relative shrink-0">
                <Icon className={cn('h-5 w-5', isActive && 'text-brand-cyan')} />
                {'hasBadge' in item && item.hasBadge && hasNewLeads && (
                  <span className="pulse-badge" />
                )}
              </div>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User / Logout */}
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
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-bg-card border border-brand-blue-deep/30 text-text-primary"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-bg-card border-r border-brand-blue-deep/20"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-bg-card border-r border-brand-blue-deep/20 transition-all duration-300 z-30',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
