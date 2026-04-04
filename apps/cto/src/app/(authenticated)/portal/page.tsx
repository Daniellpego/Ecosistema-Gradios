'use client'

import Link from 'next/link'
import { Users, Download, FileText, Eye, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2, Building2, ArrowUpRight, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/motion'
import { StatusBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjetos } from '@/hooks/use-projetos'
import { getProjetoTitulo, getProjetoEntrega } from '@/types/database'
import { usePortalUpdates } from '@/hooks/use-updates'
import { usePresentations } from '@/hooks/use-relatorios'
import { formatCurrency, formatDate, formatRelative } from '@/lib/format'
import { cn, normalizeColor } from '@/lib/utils'

const UPDATE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  nota: { icon: MessageSquare, color: '#00C8F0' },
  status_change: { icon: TrendingUp, color: '#94A3B8' },
  milestone: { icon: CheckCircle2, color: '#F59E0B' },
  bloqueio: { icon: AlertTriangle, color: '#EF4444' },
  entrega: { icon: CheckCircle2, color: '#10B981' },
}

export default function PortalPage() {
  const { data: projetos, isLoading: loadingProjetos } = useProjetos()
  const { data: updates, isLoading: loadingUpdates } = usePortalUpdates(15)
  const { data: presentations } = usePresentations()

  const isLoading = loadingProjetos || loadingUpdates

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-5">
          <Skeleton className="h-16 w-80 rounded-xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </PageTransition>
    )
  }

  const activeProjetos = (projetos ?? []).filter((p) => p.status !== 'cancelado')
    .sort((a, b) => {
      const order: Record<string, number> = { em_andamento: 0, revisao: 1, backlog: 2, entregue: 3, cancelado: 4 }
      return (order[a.status] ?? 9) - (order[b.status] ?? 9)
    })

  const totalValor = activeProjetos.reduce((s, p) => s + (p.valor ?? 0), 0)
  const avgProgresso = activeProjetos.length > 0
    ? Math.round(activeProjetos.reduce((s, p) => s + p.progresso, 0) / activeProjetos.length)
    : 0

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,200,240,0.1)', border: '1px solid rgba(0,200,240,0.15)' }}
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-text-primary tracking-tight">Portal dos Sócios</h1>
              <p className="text-xs sm:text-sm text-text-secondary">Visão macro de projetos e operações</p>
            </div>
          </div>
          {/* Summary pills */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(0,200,240,0.1)', color: '#00C8F0' }}>
              {activeProjetos.length} projetos
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
              {formatCurrency(totalValor)}
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
              {avgProgresso}% médio
            </div>
          </div>
        </div>

        {/* Mobile summary pills */}
        <div className="flex sm:hidden items-center gap-2 overflow-x-auto -mx-1 px-1">
          <div className="px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0" style={{ background: 'rgba(0,200,240,0.1)', color: '#00C8F0' }}>
            {activeProjetos.length} projetos
          </div>
          <div className="px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            {formatCurrency(totalValor)}
          </div>
          <div className="px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            {avgProgresso}% médio
          </div>
        </div>

        {/* Projects Table (desktop) */}
        <StaggerItem>
          <div className="card-glass !p-0 overflow-hidden hidden sm:block">
            <div className="px-5 py-3.5 border-b border-brand-blue-deep/20 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-text-primary">Projetos Ativos</h3>
              <span className="text-xs text-text-muted ml-auto">{activeProjetos.length} projetos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-5 py-3">Projeto</th>
                    <th className="text-left px-3 py-3">Cliente</th>
                    <th className="text-left px-3 py-3">Status</th>
                    <th className="text-left px-3 py-3 w-32">Progresso</th>
                    <th className="text-left px-3 py-3">Prazo</th>
                    <th className="text-right px-5 py-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProjetos.map((p) => (
                    <tr key={p.id} className="table-row group cursor-pointer" onClick={() => window.location.href = `/projetos/${p.id}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: normalizeColor(p.cor) }} />
                          <span className="text-sm font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">{getProjetoTitulo(p)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-text-secondary">{p.cliente ?? '-'}</td>
                      <td className="px-3 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-3 py-3.5"><Progress value={p.progresso} showLabel className="w-28" /></td>
                      <td className="px-3 py-3.5 text-sm text-text-secondary">{getProjetoEntrega(p) ? formatDate(getProjetoEntrega(p)!) : '-'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-text-primary font-semibold">{p.valor ? formatCurrency(p.valor) : '-'}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </StaggerItem>

        {/* Projects Cards (mobile) */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Building2 className="h-4 w-4 text-brand-cyan" />
            <h3 className="text-sm font-semibold text-text-primary">Projetos Ativos</h3>
          </div>
          {activeProjetos.map((p) => (
            <Link key={p.id} href={`/projetos/${p.id}`} className="card-glass !p-3 block active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: normalizeColor(p.cor) }} />
                  <span className="text-sm font-semibold text-text-primary truncate">{getProjetoTitulo(p)}</span>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-text-muted truncate">{p.cliente ?? '-'}</span>
                {p.valor && <span className="text-xs font-semibold text-status-positive shrink-0">{formatCurrency(p.valor)}</span>}
              </div>
              <Progress value={p.progresso} showLabel />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Updates Feed */}
          <StaggerItem>
            <div className="card-glass h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="section-header-icon" style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.2)' }}>
                  <Eye className="h-3.5 w-3.5 text-brand-cyan" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Atualizacoes</h3>
                <span className="ml-auto text-xs text-text-muted">{updates?.length ?? 0} recentes</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {updates?.map((u) => {
                  const cfg = UPDATE_ICONS[u.tipo] ?? { icon: MessageSquare, color: '#00C8F0' }
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={u.id}
                      whileHover={{ x: 2 }}
                      className="flex items-start gap-3 py-2.5 px-3 rounded-xl transition-colors"
                      style={{ background: 'rgba(21,59,95,0.12)', border: '1px solid rgba(21,59,95,0.2)' }}
                    >
                      <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary leading-snug">{u.conteudo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium flex items-center gap-0.5" style={{ color: '#00C8F0' }}>
                            <ArrowUpRight className="h-3 w-3" />
                            {u.projeto_titulo}
                          </span>
                          <span className="text-xs text-text-muted">&middot; {formatRelative(u.created_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {(!updates || updates.length === 0) && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,200,240,0.08)', border: '1px dashed rgba(0,200,240,0.25)' }}>
                      <Eye className="h-5 w-5 text-brand-cyan opacity-50" />
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Sem atualizações</p>
                    <p className="text-xs text-text-muted mt-0.5">As atualizações visíveis para sócios aparecerão aqui</p>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>

          {/* Reports */}
          <StaggerItem>
            <div className="card-glass h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="section-header-icon" style={{ background: 'rgba(26,106,170,0.15)', border: '1px solid rgba(26,106,170,0.25)' }}>
                  <FileText className="h-3.5 w-3.5 text-brand-blue" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Relatorios</h3>
              </div>
              <div className="space-y-2">
                {presentations?.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-bg-hover/50 transition-colors" style={{ border: '1px solid rgba(21,59,95,0.15)' }}>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{p.titulo}</p>
                      <p className="text-xs text-text-muted">{formatDate(p.created_at)}</p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={p.storage_url} download><Download className="h-3.5 w-3.5" /></a>
                    </Button>
                  </div>
                ))}
                {(!presentations || presentations.length === 0) && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(26,106,170,0.1)', border: '1px dashed rgba(26,106,170,0.25)' }}>
                      <FileText className="h-5 w-5 text-brand-blue opacity-50" />
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Nenhum relatorio</p>
                    <p className="text-xs text-text-muted mt-0.5">Relatorios gerados aparecerão aqui</p>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>
        </div>
      </div>
    </PageTransition>
  )
}
