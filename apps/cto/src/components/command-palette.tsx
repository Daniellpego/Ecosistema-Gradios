'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LayoutDashboard, Kanban, GanttChart, Calendar, FileBarChart, Users, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMANDS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', group: 'Navegacao' },
  { id: 'kanban', label: 'Kanban', icon: Kanban, href: '/kanban', group: 'Navegacao' },
  { id: 'timeline', label: 'Timeline', icon: GanttChart, href: '/timeline', group: 'Navegacao' },
  { id: 'calendario', label: 'Calendario', icon: Calendar, href: '/calendario', group: 'Navegacao' },
  { id: 'relatorios', label: 'Relatorios', icon: FileBarChart, href: '/relatorios', group: 'Navegacao' },
  { id: 'portal', label: 'Portal Socios', icon: Users, href: '/portal', group: 'Navegacao' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setSelectedIndex(0) } }, [open])

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))

  function handleSelect(cmd: typeof COMMANDS[0]) { router.push(cmd.href); setOpen(false) }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex]) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-text-muted hover:bg-slate-50 hover:text-text-primary transition-colors" aria-label="Abrir paleta de comandos">
      <Search className="h-3.5 w-3.5" />
      <span>Buscar...</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-text-muted"><Command className="h-2.5 w-2.5" />K</kbd>
    </button>
  )

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Search className="h-4 w-4 text-text-muted shrink-0" />
            <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }} onKeyDown={handleKeyDown} placeholder="Buscar pagina ou comando..." className="flex-1 text-sm bg-transparent outline-none text-text-primary placeholder:text-text-muted" />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-text-muted">ESC</kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-6">Nenhum resultado</p>}
            {filtered.map((cmd, i) => { const Icon = cmd.icon; return (
              <button key={cmd.id} onClick={() => handleSelect(cmd)} className={cn('flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-left transition-colors', i === selectedIndex ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-text-secondary hover:bg-slate-50')}>
                <Icon className="h-4 w-4 shrink-0" /><span className="font-medium">{cmd.label}</span>
              </button>
            )})}
          </div>
        </div>
      </div>
    </div>
  )
}
