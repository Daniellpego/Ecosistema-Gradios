'use client'

import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Milestone,
  Zap,
  CheckCircle2,
  GitMerge,
  MessageSquare,
  AlertCircle,
  Flag,
  Package,
  ArrowUpRight,
  CalendarDays,
  Activity,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import { PageTransition, StaggerContainer, StaggerItem, AnimatedNumber } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'
import { PrioridadeBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useDashboardCTO } from '@/hooks/use-dashboard-cto'
import { useGlobalUpdates } from '@/hooks/use-updates'
import { formatCurrency, formatDate, formatRelative, daysUntil } from '@/lib/format'
import { cn, normalizeColor } from '@/lib/utils'
import { ErrorState } from '@/components/ui/error-state'

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  icon: React.ElementType
  label: string
  value: number
  format: (n: number) => string
  color: string
  gradientFrom: string
  gradientTo: string
  alert?: boolean
  subtitle?: string
}

function KPICard({
  icon: Icon,
  label,
  value,
  format,
  color,
  gradientFrom,
  gradientTo,
  alert,
  subtitle,
}: KPICardProps) {
  return (
    <StaggerItem>
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl p-px"
        style={{
          background: `linear-gradient(135deg, ${normalizeColor(gradientFrom)}40, ${normalizeColor(gradientTo)}20)`,
        }}
      >
        {/* Gradient border shimmer */}
        <div
          className="absolute inset-0 rounded-2xl opacity-60"
          style={{
            background: `linear-gradient(135deg, ${normalizeColor(gradientFrom)}60 0%, transparent 50%, ${normalizeColor(gradientTo)}30 100%)`,
          }}
        />

        <div
          className="relative rounded-2xl p-5 h-full"
          style={{ background: '#131F35' }}
        >
          {/* Glow blob */}
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ background: normalizeColor(color) }}
          />

          <div className="relative flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
                {label}
              </p>
              <p
                className="text-3xl font-bold tracking-tight"
                style={{ color: normalizeColor(color) }}
              >
                <AnimatedNumber value={value} format={format} />
              </p>
              {subtitle && (
                <p className="text-xs text-text-muted mt-1">{subtitle}</p>
              )}
            </div>

            <div
              className={cn(
                'h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ml-3',
                alert && 'animate-pulse-glow'
              )}
              style={{
                background: `linear-gradient(135deg, ${normalizeColor(gradientFrom)}25, ${normalizeColor(gradientTo)}15)`,
                border: `1px solid ${normalizeColor(color)}30`,
              }}
            >
              <Icon className="h-5 w-5" style={{ color: normalizeColor(color) }} />
            </div>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent, ${normalizeColor(gradientFrom)}, ${normalizeColor(gradientTo)}, transparent)`,
            }}
          />
        </div>
      </motion.div>
    </StaggerItem>
  )
}

// ─── Urgency helpers ─────────────────────────────────────────────────────────

function urgencyColor(days: number): string {
  if (days <= 1) return '#EF4444'
  if (days <= 3) return '#F59E0B'
  return '#00C8F0'
}

function urgencyLabel(days: number): string {
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Amanha'
  return `${days}d`
}

// ─── Activity icon map ────────────────────────────────────────────────────────

function UpdateIcon({ tipo }: { tipo: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    bloqueio: { icon: AlertCircle, color: '#EF4444' },
    entrega: { icon: CheckCircle2, color: '#10B981' },
    milestone: { icon: Flag, color: '#F59E0B' },
    status_change: { icon: GitMerge, color: '#1A6AAA' },
    nota: { icon: MessageSquare, color: '#94A3B8' },
  }
  const cfg = map[tipo] ?? { icon: Activity, color: '#00C8F0' }
  const Ic = cfg.icon
  return (
    <div
      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
    >
      <Ic className="h-3.5 w-3.5" style={{ color: cfg.color }} />
    </div>
  )
}

// ─── Custom Pie tooltip ───────────────────────────────────────────────────────

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]!
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-medium shadow-xl"
      style={{
        background: '#0A1628',
        border: '1px solid rgba(21,59,95,0.7)',
        color: '#F0F4F8',
      }}
    >
      <span style={{ color: normalizeColor(item.payload.color) }}>{item.name}</span>
      <span className="ml-2 text-text-secondary">{item.value}</span>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,200,240,0.08)', border: '1px dashed rgba(0,200,240,0.25)' }}>
        <Icon className="h-5 w-5 text-brand-cyan opacity-60" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-secondary">{title}</p>
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isLoading, error, kpis, statusDistribuicao, proximasEntregas, proximosMilestones } =
    useDashboardCTO()
  const { data: recentUpdates } = useGlobalUpdates(8)

  if (error) {
    return (
      <PageTransition>
        <ErrorState message="Erro ao carregar dados do dashboard" />
      </PageTransition>
    )
  }

  if (isLoading) {
    return (
      <PageTransition>
        <DashboardSkeleton />
      </PageTransition>
    )
  }

  const totalProjetos = statusDistribuicao.reduce((s, d) => s + d.value, 0)

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Visao Geral
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Acompanhamento em tempo real dos projetos e entregas
            </p>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
            style={{
              background: 'rgba(0,200,240,0.08)',
              border: '1px solid rgba(0,200,240,0.2)',
              color: '#00C8F0',
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
            Ao Vivo
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={LayoutDashboard}
            label="Projetos Ativos"
            value={kpis.projetosAtivos}
            format={(n) => String(n)}
            color="#00C8F0"
            gradientFrom="#00C8F0"
            gradientTo="#1A6AAA"
            subtitle="Em backlog, andamento e revisao"
          />
          <KPICard
            icon={TrendingUp}
            label="Entregas no Mes"
            value={kpis.entreguesMes}
            format={(n) => String(n)}
            color="#10B981"
            gradientFrom="#10B981"
            gradientTo="#059669"
            subtitle="Concluidos esse mes"
          />
          <KPICard
            icon={AlertTriangle}
            label="Atrasados"
            value={kpis.atrasados}
            format={(n) => String(n)}
            color="#EF4444"
            gradientFrom="#EF4444"
            gradientTo="#B91C1C"
            alert={kpis.atrasados > 0}
            subtitle={kpis.atrasados > 0 ? 'Requer atencao imediata' : 'Tudo em dia'}
          />
          <KPICard
            icon={DollarSign}
            label="Valor Pipeline"
            value={kpis.valorPipeline}
            format={formatCurrency}
            color="#F59E0B"
            gradientFrom="#F59E0B"
            gradientTo="#D97706"
            subtitle="Projetos ativos somados"
          />
        </StaggerContainer>

        {/* ── Middle row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Status donut */}
          <StaggerItem>
            <div className="card-glass h-full">
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.2)' }}
                >
                  <Package className="h-3.5 w-3.5 text-brand-cyan" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Status dos Projetos</h3>
              </div>

              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusDistribuicao}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {statusDistribuicao.map((entry, i) => (
                        <Cell key={i} fill={normalizeColor(entry.color)} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-text-primary">{totalProjetos}</span>
                  <span className="text-xs text-text-muted">total</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusDistribuicao.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: `${normalizeColor(s.color)}0D` }}>
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ background: normalizeColor(s.color) }} />
                    <span className="text-xs text-text-secondary truncate">{s.name}</span>
                    <span className="text-xs font-bold ml-auto" style={{ color: normalizeColor(s.color) }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          {/* Proximas Entregas */}
          <StaggerItem>
            <div className="card-glass h-full">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <Clock className="h-3.5 w-3.5 text-status-warning" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Proximas Entregas</h3>
                <span
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                >
                  7 dias
                </span>
              </div>

              {proximasEntregas.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Sem entregas proximas"
                  subtitle="Nenhum projeto com deadline nos proximos 7 dias"
                />
              ) : (
                <div className="space-y-3">
                  {proximasEntregas.map((p) => {
                    const days = p.data_entrega ? daysUntil(p.data_entrega) : 0
                    const uc = urgencyColor(days)
                    return (
                      <div
                        key={p.id}
                        className="rounded-xl p-3 transition-colors"
                        style={{ background: `${uc}08`, border: `1px solid ${uc}18` }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate leading-tight">
                              {p.titulo ?? 'Sem titulo'}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{p.cliente ?? '-'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.prioridade && <PrioridadeBadge prioridade={p.prioridade} />}
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${uc}20`, color: uc }}
                            >
                              {urgencyLabel(days)}
                            </span>
                          </div>
                        </div>
                        <Progress value={p.progresso ?? 0} showLabel />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </StaggerItem>

          {/* Milestones */}
          <StaggerItem>
            <div className="card-glass h-full">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(26,106,170,0.15)', border: '1px solid rgba(26,106,170,0.25)' }}
                >
                  <Milestone className="h-3.5 w-3.5 text-brand-blue" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Proximos Milestones</h3>
                <span
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(26,106,170,0.12)', color: '#1A6AAA' }}
                >
                  14 dias
                </span>
              </div>

              {proximosMilestones.length === 0 ? (
                <EmptyState
                  icon={Milestone}
                  title="Sem milestones proximos"
                  subtitle="Nenhum marco previsto para os proximos 14 dias"
                />
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, #1A6AAA40, transparent)' }} />

                  <div className="space-y-1 pl-8">
                    {proximosMilestones.map((m, idx) => {
                      const msStatus = m.status
                      const dotColor =
                        msStatus === 'atrasado' ? '#EF4444' :
                        msStatus === 'em_andamento' ? '#00C8F0' :
                        msStatus === 'concluido' ? '#10B981' : '#94A3B8'
                      return (
                        <div key={m.id} className="relative py-2.5">
                          {/* Timeline dot */}
                          <div
                            className="absolute -left-5 top-3.5 h-3 w-3 rounded-full border-2"
                            style={{
                              background: `${dotColor}30`,
                              borderColor: dotColor,
                              boxShadow: idx === 0 ? `0 0 8px ${dotColor}60` : 'none',
                            }}
                          />

                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-text-primary leading-tight truncate">
                                {m.titulo}
                              </p>
                              <p className="text-xs text-text-muted mt-0.5 truncate">
                                {m.projetos?.titulo ?? '-'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 text-xs text-text-secondary">
                              <CalendarDays className="h-3 w-3" />
                              <span>{formatDate(m.data_prevista)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </StaggerItem>
        </div>

        {/* ── Activity Feed ────────────────────────────────────────────────── */}
        <StaggerItem>
          <div className="card-glass">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.2)' }}
                >
                  <Zap className="h-3.5 w-3.5 text-brand-cyan" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Atividade Recente</h3>
              </div>
              <span className="text-xs text-text-muted">Ultimas atualizacoes</span>
            </div>

            {!recentUpdates || recentUpdates.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sem atividade recente"
                subtitle="As atualizacoes dos projetos aparecerão aqui"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentUpdates.map((u) => (
                  <motion.div
                    key={u.id}
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: 'rgba(21,59,95,0.15)', border: '1px solid rgba(21,59,95,0.3)' }}
                  >
                    <UpdateIcon tipo={u.tipo} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary leading-snug line-clamp-2">
                        {u.conteudo}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: '#00C8F0' }}
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          {u.projeto_titulo}
                        </span>
                        <span className="text-xs text-text-muted">&middot;</span>
                        <span className="text-xs text-text-muted">{formatRelative(u.created_at)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </StaggerItem>

      </div>
    </PageTransition>
  )
}
