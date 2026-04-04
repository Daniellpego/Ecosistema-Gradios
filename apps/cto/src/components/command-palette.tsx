'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, LayoutDashboard, Kanban, GanttChart, Calendar,
  FileBarChart, Users, ArrowRight, Command, Folder,
  Hash, Clock, Sparkles,
} from 'lucide-react'
import { useProjetos } from '@/hooks/use-projetos'
import { getProjetoTitulo } from '@/types/database'
import { normalizeColor, cn } from '@/lib/utils'

interface PaletteItem {
  id: string
  label: string
  sublabel?: string
  icon: React.ElementType
  href: string
  color?: string
  group: string
}

const NAV_ITEMS: PaletteItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', sublabel: 'Painel de controle', icon: LayoutDashboard, href: '/dashboard', group: 'Navegacao' },
  { id: 'nav-kanban', label: 'Kanban', sublabel: 'Quadro de projetos', icon: Kanban, href: '/kanban', group: 'Navegacao' },
  { id: 'nav-timeline', label: 'Timeline', sublabel: 'Gantt de projetos', icon: GanttChart, href: '/timeline', group: 'Navegacao' },
  { id: 'nav-calendario', label: 'Calendario', sublabel: 'Milestones no mes', icon: Calendar, href: '/calendario', group: 'Navegacao' },
  { id: 'nav-relatorios', label: 'Relatorios', sublabel: 'Apresentacoes', icon: FileBarChart, href: '/relatorios', group: 'Navegacao' },
  { id: 'nav-portal', label: 'Portal Socios', sublabel: 'Visao macro', icon: Users, href: '/portal', group: 'Navegacao' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: projetos } = useProjetos()

  // Build items list
  const allItems = useMemo<PaletteItem[]>(() => {
    const projectItems: PaletteItem[] = (projetos ?? [])
      .filter((p) => p.status !== 'cancelado')
      .map((p) => ({
        id: `proj-${p.id}`,
        label: getProjetoTitulo(p),
        sublabel: p.cliente ?? undefined,
        icon: Folder,
        href: `/projetos/${p.id}`,
        color: normalizeColor(p.cor),
        group: 'Projetos',
      }))
    return [...NAV_ITEMS, ...projectItems]
  }, [projetos])

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems
    const q = query.toLowerCase().trim()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.sublabel?.toLowerCase().includes(q) ?? false)
    )
  }, [allItems, query])

  // Group items
  const grouped = useMemo(() => {
    const groups: Record<string, PaletteItem[]> = {}
    for (const item of filtered) {
      if (!groups[item.group]) groups[item.group] = []
      groups[item.group]!.push(item)
    }
    return groups
  }, [filtered])

  const flatFiltered = useMemo(() => filtered, [filtered])

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = flatFiltered[selectedIndex]
      if (item) navigate(item.href)
    }
  }

  return (
    <>
      {/* Trigger button in header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all text-xs active:scale-[0.97]"
        style={{ border: '1px solid rgba(21,59,95,0.4)' }}
        aria-label="Busca global (Cmd+K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-bg-navy border border-brand-blue-deep/40 text-text-muted">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Palette overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed z-[61] inset-x-3 top-[12vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[520px]"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: '#0E1B30',
                  border: '1px solid rgba(0,200,240,0.15)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,200,240,0.08)',
                }}
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-brand-blue-deep/30">
                  <Search className="h-4 w-4 text-brand-cyan shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar projetos, paginas..."
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                    aria-label="Buscar projetos e paginas"
                  />
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded-md border border-brand-blue-deep/40 text-text-muted bg-bg-navy font-medium">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
                  {flatFiltered.length === 0 && (
                    <div className="flex flex-col items-center py-10 text-center gap-2">
                      <Sparkles className="h-6 w-6 text-text-muted/40" />
                      <p className="text-sm text-text-muted">Nenhum resultado para &quot;{query}&quot;</p>
                    </div>
                  )}

                  {Object.entries(grouped).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-4 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted/50">
                          {group}
                        </span>
                      </div>
                      {items.map((item) => {
                        const globalIdx = flatFiltered.indexOf(item)
                        const isSelected = globalIdx === selectedIndex
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            data-selected={isSelected}
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={cn(
                              'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                              isSelected
                                ? 'bg-brand-cyan/8 text-text-primary'
                                : 'text-text-secondary hover:bg-bg-hover/50'
                            )}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div
                              className="h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0"
                              style={{
                                background: item.color ? `${item.color}15` : 'rgba(0,200,240,0.08)',
                                border: `1px solid ${item.color ? `${item.color}25` : 'rgba(0,200,240,0.15)'}`,
                              }}
                            >
                              <Icon className="h-4 w-4" style={{ color: item.color ?? '#00C8F0' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.label}</p>
                              {item.sublabel && (
                                <p className="text-xs text-text-muted truncate">{item.sublabel}</p>
                              )}
                            </div>
                            {isSelected && (
                              <ArrowRight className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer hints */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-brand-blue-deep/30 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-brand-blue-deep/40 bg-bg-navy">↑↓</kbd> navegar</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-brand-blue-deep/40 bg-bg-navy">↵</kbd> abrir</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-brand-blue-deep/40 bg-bg-navy">esc</kbd> fechar</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
