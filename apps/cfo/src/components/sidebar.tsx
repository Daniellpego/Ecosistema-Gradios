'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Wallet,
  Receipt,
  LineChart,
  CalendarRange,
  FileBarChart,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Painel Geral', icon: LayoutDashboard },
  { href: '/dre', label: 'DRE', icon: FileText },
  { href: '/receitas', label: 'Receitas', icon: TrendingUp },
  { href: '/custos-fixos', label: 'Custos Fixos', icon: Wallet },
  { href: '/gastos-variaveis', label: 'Gastos Variáveis', icon: Receipt },
  { href: '/projecoes', label: 'Projeções', icon: LineChart },
  { href: '/balanco-anual', label: 'Balanço Anual', icon: CalendarRange },
  { href: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  { href: '/academy', label: 'Academy', icon: GraduationCap },
] as const

function preloadCharts() {
  import('@/components/charts/revenue-expenses-chart')
  import('@/components/charts/cost-distribution-chart')
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.title = 'Dashboard | Gradios CFO'
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Full-page navigation garante que os cookies limpos pelo signOut sejam
    // committed antes do middleware reavaliar. router.push() racava com a
    // escrita de cookies no iOS Safari / PWA standalone e podia jogar o
    // usuario de volta no /dashboard via middleware (mesma classe de bug do
    // login, corrigida no PR #97).
    window.location.assign('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 px-3 mb-2 block">Gradios Ecosystem</span>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={item.href === '/dashboard' ? preloadCharts : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] transition-all duration-200 relative group',
                isActive
                  ? 'bg-brand-cyan/10 text-brand-cyan font-semibold shadow-sm border border-brand-cyan/10'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-brand-cyan')} />
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
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[10px] text-[13px] font-medium text-slate-400 hover:bg-red-50 hover:text-status-negative transition-all duration-200"
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
        className="lg:hidden fixed top-4 left-4 z-50 h-9 w-9 flex items-center justify-center rounded-[10px] bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-700 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
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
               className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-white border-r border-slate-200"
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

      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 z-30',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
