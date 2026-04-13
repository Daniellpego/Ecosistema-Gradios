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
  CalendarDays,
  Activity,
  Target,
  Rocket,
  ChevronRight,
  Circle,
  BarChart3,
  Users,
  Timer,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusEntry {
  name: string
  value: number
  color: string
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  icon: React.ElementType
  label: string
  value: number
  format: (n: number) => string
  accentColor: string
  alert?: boolean
  subtitle?: string
}

function KPICard({
  icon: Icon,
  label,
  value,
  format,
  accentColor,
  alert,
  subtitle,
}: KPICardProps) {
  const color = normalizeColor(accentColor)
  return (
    <StaggerItem>
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: alert
            ? `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,249,251,0.9) 100%)',
          border: alert ? `1px solid ${color}25` : '1px solid rgba(226,232,240,0.5)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.02)',
        }}
      >
        {/* Decorative corner gradient */}
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07]"
          style={{ background: color }}
        />

        <div className="relative flex items-center justify-between mb-4">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
              border: `1px solid ${color}15`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {alert && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: `${color}12` }}>
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: color }} />
              <span className="text-[10px] font-bold uppercase" style={{ color }}>Alerta</span>
            </div>
          )}
        </div>

        <p className="relative text-3xl font-extrabold tracking-tight mb-0.5" style={{ color: alert ? color : '#0F172A' }}>
          <AnimatedNumber value={value} format={format} />
        </p>
        <p className="text-sm font-medium text-text-secondary">{label}</p>

        {subtitle && (
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </StaggerItem>
  )
}

// ─── Quick Stats Bar ──────────────────────────────────────────────────────────

interface QuickStatProps {
  icon?: React.ElementType
  label: string
  value: string
  color: string
}

function QuickStat({ label, value, color, isAlert }: QuickStatProps & { isAlert?: boolean }) {
  const c = normalizeColor(color)
  return (
    <div
      className="p-3.5 rounded-2xl relative overflow-hidden"
      style={{
        background: isAlert ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.9)',
        border: isAlert ? '1px solid rgba(239,68,68,0.12)' : '1px solid rgba(226,232,240,0.4)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5"
        style={{ color: isAlert ? '#EF4444' : '#94A3B8' }}
      >
        {label}
      </p>
      <p
        className="text-[22px] font-extrabold tracking-tight leading-none"
        style={{ color: isAlert ? '#EF4444' : c }}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Urgency helpers ─────────────────────────────────────────────────────────

function urgencyConfig(days: number): { color: string; bg: string; label: string; pulse: boolean } {
  if (days <= 0) return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Hoje', pulse: true }
  if (days === 1) return { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Amanha', pulse: true }
  if (days <= 3) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: `${days}d`, pulse: false }
  return { color: '#00BFFF', bg: 'rgba(0,191,255,0.06)', label: `${days}d`, pulse: false }
}

// ─── Activity icon map ────────────────────────────────────────────────────────

function UpdateIcon({ tipo }: { tipo: string }) {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    bloqueio:     { icon: AlertCircle,  color: '#FFFFFF', bg: '#EF4444' },
    entrega:      { icon: CheckCircle2, color: '#FFFFFF', bg: '#006c49' },
    milestone:    { icon: Flag,         color: '#FFFFFF', bg: '#F59E0B' },
    status_change:{ icon: GitMerge,     color: '#FFFFFF', bg: '#00668a' },
    nota:         { icon: MessageSquare,color: '#FFFFFF', bg: '#94A3B8' },
  }
  const cfg = map[tipo] ?? { icon: Activity, color: '#FFFFFF', bg: '#00BFFF' }
  const Ic = cfg.icon
  return (
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
      style={{ background: cfg.bg }}
    >
      <Ic className="h-4 w-4" style={{ color: cfg.color }} />
    </div>
  )
}

// ─── Custom Pie tooltip ───────────────────────────────────────────────────────

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]!
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-medium shadow-2xl"
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(226,232,240,0.8)',
        color: '#0F172A',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: normalizeColor(item.payload.color) }}
        />
        <span style={{ color: normalizeColor(item.payload.color) }}>{item.name}</span>
        <span className="ml-1 text-text-primary font-bold">{item.value}</span>
      </div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ElementType
  title: string
  iconBg?: string
  iconColor?: string
  badge?: React.ReactNode
}

function SectionHeader({ icon: Icon, title, iconBg, iconColor, badge }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
      <div
        className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: iconBg ?? 'rgba(0,191,255,0.12)' }}
      >
        <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" style={{ color: iconColor ?? '#00BFFF' }} />
      </div>
      <h3 className="text-[15px] sm:text-sm font-semibold text-text-primary">{title}</h3>
      {badge && <div className="ml-auto">{badge}</div>}
    </div>
  )
}

// ─── Timeline dot ─────────────────────────────────────────────────────────────

function TimelineDot({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <div className="relative flex items-center justify-center h-4 w-4 shrink-0">
      {glow && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: normalizeColor(color) }}
        />
      )}
      <div
        className="h-3 w-3 rounded-full border-2 relative z-10"
        style={{
          background: `${normalizeColor(color)}25`,
          borderColor: normalizeColor(color),
        }}
      />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  accentColor = '#00BFFF',
  actionLabel,
  actionHref,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  accentColor?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center gap-3">
      <div
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center"
        style={{
          background: `${accentColor}0C`,
          border: `1.5px solid ${accentColor}20`,
        }}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 opacity-60" style={{ color: accentColor }} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-secondary">{title}</p>
        <p className="text-xs text-text-muted max-w-[240px] leading-relaxed">{subtitle}</p>
      </div>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}20` }}
        >
          {actionLabel}
        </a>
      )}
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 rounded-xl" />
          <Skeleton className="h-4 w-56 sm:w-72 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl hidden sm:block" />
      </div>
      <Skeleton className="h-12 sm:h-14 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 sm:h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Skeleton className="h-72 sm:h-88 rounded-2xl" />
        <Skeleton className="h-72 sm:h-88 rounded-2xl" />
        <Skeleton className="h-72 sm:h-88 rounded-2xl" />
      </div>
      <Skeleton className="h-48 sm:h-64 rounded-2xl" />
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

  const totalProjetos = statusDistribuicao.reduce((s: number, d: StatusEntry) => s + d.value, 0)
  const urgentCount = proximasEntregas.filter((p) =>
    p.data_entrega ? daysUntil(p.data_entrega) <= 1 : false
  ).length

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {urgentCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-negative text-white text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-status-positive animate-pulse" />
                  Tudo em dia
                </span>
              )}
            </div>
            <h1 className="text-[26px] sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
              {greeting}, CTO.
            </h1>
            <p className="text-text-secondary text-sm mt-1.5 max-w-lg leading-relaxed">
              Visao estrategica em tempo real dos projetos e entregas da Gradios.
            </p>
          </div>
        </section>

        {/* ── Quick Stats Bar ──────────────────────────────────────────────── */}
        <StaggerItem>
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-3">
            <QuickStat icon={BarChart3}  label="Total"       value={String(totalProjetos)}              color="#00668a" />
            <QuickStat icon={Rocket}     label="Ativos"      value={String(kpis.projetosAtivos)}        color="#00668a" />
            <QuickStat icon={Target}     label="Entregas"    value={String(kpis.entreguesMes)}          color="#00668a" />
            <QuickStat icon={Timer}      label="Proximas"    value={String(proximasEntregas.length)}    color="#006c49" />
            <QuickStat icon={Users}      label="Milestones"  value={String(proximosMilestones.length)}  color="#00668a" />
            <QuickStat icon={AlertTriangle} label="Atrasados" value={String(kpis.atrasados)}            color="#EF4444" isAlert={kpis.atrasados > 0} />
          </div>
        </StaggerItem>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <KPICard
            icon={LayoutDashboard}
            label="Projetos Ativos"
            value={kpis.projetosAtivos}
            format={(n) => String(n)}
            accentColor="#00BFFF"
            subtitle="Backlog, andamento e revisao"
          />
          <KPICard
            icon={TrendingUp}
            label="Entregas no Mes"
            value={kpis.entreguesMes}
            format={(n) => String(n)}
            accentColor="#10B981"
            subtitle="Concluidos esse mes"
          />
          <KPICard
            icon={AlertTriangle}
            label="Atrasados"
            value={kpis.atrasados}
            format={(n) => String(n)}
            accentColor="#EF4444"
            alert={kpis.atrasados > 0}
            subtitle={kpis.atrasados > 0 ? 'Requer atencao' : 'Tudo em dia'}
          />
          <KPICard
            icon={DollarSign}
            label="Valor Pipeline"
            value={kpis.valorPipeline}
            format={formatCurrency}
            accentColor="#F59E0B"
            subtitle="Projetos ativos somados"
          />
        </StaggerContainer>

        {/* ── Middle row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 [&>*]:min-w-0">

          {/* ── Status Donut ─────────────────────────────────────────────── */}
          <StaggerItem>
            <div className="card-glass h-full">

              <SectionHeader
                icon={BarChart3}
                title="Status dos Projetos"
                iconBg="rgba(0,191,255,0.12)"
                iconColor="#00BFFF"
              />

              {/* Donut chart */}
              <div className="relative mb-3 sm:mb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusDistribuicao}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      dataKey="value"
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {statusDistribuicao.map((entry: StatusEntry, i: number) => (
                        <Cell
                          key={i}
                          fill={normalizeColor(entry.color)}
                          style={{ filter: `drop-shadow(0 0 6px ${normalizeColor(entry.color)}50)` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="text-2xl sm:text-3xl font-black leading-none text-brand-cyan"
                  >
                    {totalProjetos}
                  </span>
                  <span className="text-[10px] sm:text-xs text-text-muted mt-0.5 font-medium uppercase tracking-widest">
                    projetos
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {statusDistribuicao.map((s: StatusEntry) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg sm:rounded-xl"
                    style={{
                      background: `${normalizeColor(s.color)}0A`,
                      border: `1px solid ${normalizeColor(s.color)}18`,
                    }}
                  >
                    <Circle
                      className="h-2 w-2 shrink-0 fill-current"
                      style={{ color: normalizeColor(s.color) }}
                    />
                    <span className="text-[11px] sm:text-xs text-text-secondary truncate flex-1">{s.name}</span>
                    <span
                      className="text-[11px] sm:text-xs font-black ml-auto"
                      style={{ color: normalizeColor(s.color) }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          {/* ── Proximas Entregas ────────────────────────────────────────── */}
          <StaggerItem>
            <div className="card-glass h-full">

              <SectionHeader
                icon={Clock}
                title="Próximas Entregas"
                iconBg="rgba(245,158,11,0.12)"
                iconColor="#F59E0B"
                badge={
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(245,158,11,0.12)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#F59E0B',
                    }}
                  >
                    7 dias
                  </span>
                }
              />

              {proximasEntregas.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nenhuma entrega urgente"
                  subtitle="Sem projetos com deadline nos proximos 7 dias."
                  accentColor="#10B981"
                  actionLabel="Ir pro Kanban"
                  actionHref="/kanban"
                />
              ) : (
                <div className="space-y-3">
                  {proximasEntregas.map((p) => {
                    const days = p.data_entrega ? daysUntil(p.data_entrega) : 99
                    const urg = urgencyConfig(days)
                    return (
                      <motion.div
                        key={p.id}
                        whileHover={{ x: 2, transition: { duration: 0.15 } }}
                        className="relative overflow-hidden rounded-[14px] p-3.5 sm:p-4 border-l-4 transition-shadow hover:shadow-md"
                        style={{
                          background: '#ffffff',
                          borderLeftColor: urg.color,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >

                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-text-primary truncate leading-tight">
                              {p.titulo ?? 'Sem titulo'}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{p.cliente ?? '—'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.prioridade && <PrioridadeBadge prioridade={p.prioridade} />}
                            <span
                              className={cn(
                                'text-xs font-black px-2 py-0.5 rounded-full',
                                urg.pulse && 'animate-pulse'
                              )}
                              style={{
                                background: `${urg.color}20`,
                                color: urg.color,
                                border: `1px solid ${urg.color}30`,
                              }}
                            >
                              {urg.label}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Progress value={p.progresso ?? 0} showLabel />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </StaggerItem>

          {/* ── Proximos Milestones ──────────────────────────────────────── */}
          <StaggerItem>
            <div className="card-glass h-full">

              <SectionHeader
                icon={Milestone}
                title="Próximos Milestones"
                iconBg="rgba(26,106,170,0.15)"
                iconColor="#1A6AAA"
                badge={
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(26,106,170,0.12)',
                      border: '1px solid rgba(26,106,170,0.22)',
                      color: '#1A6AAA',
                    }}
                  >
                    14 dias
                  </span>
                }
              />

              {proximosMilestones.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="Sem milestones proximos"
                  subtitle="Nenhum marco previsto para os proximos 14 dias."
                  accentColor="#1A6AAA"
                  actionLabel="Adicionar projeto"
                  actionHref="/kanban"
                />
              ) : (
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div
                    className="absolute left-[7px] top-3 bottom-3 w-px"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(26,106,170,0.5) 0%, rgba(26,106,170,0.05) 100%)',
                    }}
                  />

                  <div className="space-y-0">
                    {proximosMilestones.map((m, idx) => {
                      const dotColor =
                        m.status === 'atrasado'    ? '#EF4444' :
                        m.status === 'em_andamento'? '#00BFFF' :
                        m.status === 'concluido'   ? '#10B981' : '#94A3B8'

                      return (
                        <motion.div
                          key={m.id}
                          whileHover={{ x: 3, transition: { duration: 0.15 } }}
                          className="flex items-start gap-3 py-2.5"
                        >
                          <TimelineDot color={dotColor} glow={idx === 0} />

                          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text-primary leading-tight truncate">
                                {m.titulo}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <ChevronRight className="h-3 w-3 text-text-muted shrink-0" />
                                <p className="text-xs text-text-muted truncate">
                                  {m.projetos?.titulo ?? '—'}
                                </p>
                              </div>
                            </div>
                            <div
                              className="flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-1 rounded-lg"
                              style={{
                                background: `${dotColor}10`,
                                color: dotColor,
                                border: `1px solid ${dotColor}20`,
                              }}
                            >
                              <CalendarDays className="h-3 w-3" />
                              <span>{formatDate(m.data_prevista)}</span>
                            </div>
                          </div>
                        </motion.div>
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

            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <SectionHeader
                icon={Zap}
                title="Atividade Recente"
                iconBg="rgba(0,191,255,0.12)"
                iconColor="#00BFFF"
              />
              <span className="text-[11px] sm:text-xs font-medium text-text-muted hidden sm:block -mt-3">
                Ultimas {recentUpdates?.length ?? 0} atualizacoes
              </span>
            </div>

            {!recentUpdates || recentUpdates.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sem atividade recente"
                subtitle="As atualizacoes aparecerão aqui ao criar projetos e registrar entregas."
                accentColor="#00BFFF"
                actionLabel="Criar primeiro projeto"
                actionHref="/kanban"
              />
            ) : (
              <div className="relative space-y-5">
                {/* Thread line */}
                <div
                  className="absolute left-[19px] top-2 bottom-2 w-[2px] hidden sm:block"
                  style={{ borderLeft: '2px dashed rgba(188,200,209,0.6)' }}
                />

                {recentUpdates.map((u, idx) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex gap-3 sm:gap-4 relative z-10"
                  >
                    <UpdateIcon tipo={u.tipo} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-text-primary truncate max-w-[160px]">
                          {u.projeto_titulo}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase font-bold">
                          {formatRelative(u.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                        {u.conteudo}
                      </p>
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
