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
  ArrowUpRight,
  CalendarDays,
  Activity,
  Target,
  Rocket,
  ChevronRight,
  Circle,
  Sparkles,
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
  glowColor: string
  gradientStart: string
  gradientEnd: string
  alert?: boolean
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}

function KPICard({
  icon: Icon,
  label,
  value,
  format,
  accentColor,
  glowColor,
  gradientStart,
  gradientEnd,
  alert,
  subtitle,
  trend = 'neutral',
}: KPICardProps) {
  return (
    <StaggerItem>
      <motion.div
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="relative overflow-hidden rounded-2xl cursor-default"
        style={{
          background: `linear-gradient(145deg, ${normalizeColor(gradientStart)}22 0%, ${normalizeColor(gradientEnd)}10 100%)`,
          border: `1px solid ${normalizeColor(accentColor)}25`,
          boxShadow: `0 0 30px ${normalizeColor(glowColor)}10, inset 0 1px 0 ${normalizeColor(accentColor)}15`,
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${normalizeColor(accentColor)}60 40%, ${normalizeColor(accentColor)}80 60%, transparent 100%)`,
          }}
        />

        {/* Background glow blob */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${normalizeColor(glowColor)}15` }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full blur-2xl pointer-events-none"
          style={{ background: `${normalizeColor(accentColor)}08` }}
        />

        <div className="relative p-5">
          {/* Icon + alert badge */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                'h-11 w-11 rounded-xl flex items-center justify-center',
                alert && 'animate-pulse'
              )}
              style={{
                background: `linear-gradient(135deg, ${normalizeColor(accentColor)}20, ${normalizeColor(gradientEnd)}12)`,
                border: `1px solid ${normalizeColor(accentColor)}30`,
                boxShadow: alert ? `0 0 16px ${normalizeColor(accentColor)}40` : 'none',
              }}
            >
              <Icon className="h-5 w-5" style={{ color: normalizeColor(accentColor) }} />
            </div>

            {trend !== 'neutral' && (
              <div
                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: trend === 'up' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  color: trend === 'up' ? '#10B981' : '#EF4444',
                  border: `1px solid ${trend === 'up' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <TrendingUp className={cn('h-3 w-3', trend === 'down' && 'rotate-180')} />
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-1">
            <p
              className="text-3xl font-bold tracking-tight leading-none"
              style={{ color: normalizeColor(accentColor) }}
            >
              <AnimatedNumber value={value} format={format} />
            </p>
          </div>

          {/* Label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1">
            {label}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-text-muted leading-snug">{subtitle}</p>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${normalizeColor(accentColor)}50 30%, ${normalizeColor(accentColor)}80 60%, transparent 100%)`,
          }}
        />
      </motion.div>
    </StaggerItem>
  )
}

// ─── Quick Stats Bar ──────────────────────────────────────────────────────────

interface QuickStatProps {
  icon: React.ElementType
  label: string
  value: string
  color: string
}

function QuickStat({ icon: Icon, label, value, color }: QuickStatProps) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5">
      <Icon className="h-4 w-4 shrink-0" style={{ color: normalizeColor(color) }} />
      <div className="min-w-0">
        <p className="text-xs text-text-muted leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-text-primary leading-none">{value}</p>
      </div>
    </div>
  )
}

// ─── Urgency helpers ─────────────────────────────────────────────────────────

function urgencyConfig(days: number): { color: string; bg: string; label: string; pulse: boolean } {
  if (days <= 0) return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Hoje', pulse: true }
  if (days === 1) return { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Amanha', pulse: true }
  if (days <= 3) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: `${days}d`, pulse: false }
  return { color: '#00C8F0', bg: 'rgba(0,200,240,0.06)', label: `${days}d`, pulse: false }
}

// ─── Activity icon map ────────────────────────────────────────────────────────

function UpdateIcon({ tipo }: { tipo: string }) {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    bloqueio:     { icon: AlertCircle,  color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    entrega:      { icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    milestone:    { icon: Flag,         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    status_change:{ icon: GitMerge,     color: '#1A6AAA', bg: 'rgba(26,106,170,0.15)' },
    nota:         { icon: MessageSquare,color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' },
  }
  const cfg = map[tipo] ?? { icon: Activity, color: '#00C8F0', bg: 'rgba(0,200,240,0.10)' }
  const Ic = cfg.icon
  return (
    <div
      className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}
    >
      <Ic className="h-3.5 w-3.5" style={{ color: cfg.color }} />
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
        background: '#0D1B2E',
        border: '1px solid rgba(21,59,95,0.8)',
        color: '#F0F4F8',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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
    <div className="flex items-center gap-2.5 mb-5">
      <div
        className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: iconBg ?? 'rgba(0,200,240,0.12)',
          border: `1px solid ${iconColor ?? '#00C8F0'}25`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor ?? '#00C8F0' }} />
      </div>
      <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
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
          boxShadow: glow ? `0 0 8px ${normalizeColor(color)}60` : 'none',
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
  accentColor = '#00C8F0',
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  accentColor?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
      <div
        className="relative h-16 w-16 rounded-2xl flex items-center justify-center"
        style={{
          background: `${accentColor}08`,
          border: `1px dashed ${accentColor}30`,
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-30"
          style={{ background: accentColor }}
        />
        <Icon className="h-6 w-6 relative z-10 opacity-50" style={{ color: accentColor }} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-secondary">{title}</p>
        <p className="text-xs text-text-muted max-w-[200px] leading-relaxed">{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <Skeleton className="h-14 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-88 rounded-2xl" />
        <Skeleton className="h-88 rounded-2xl" />
        <Skeleton className="h-88 rounded-2xl" />
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

  const totalProjetos = statusDistribuicao.reduce((s: number, d: StatusEntry) => s + d.value, 0)
  const urgentCount = proximasEntregas.filter((p) =>
    p.data_entrega ? daysUntil(p.data_entrega) <= 1 : false
  ).length

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-brand-cyan opacity-70" />
              <span className="text-xs font-medium text-text-muted uppercase tracking-widest">
                {greeting}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Painel de Controle CTO
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Visao estrategica em tempo real dos projetos e entregas
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {urgentCount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#EF4444',
                }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
              </motion.div>
            )}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
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
        </div>

        {/* ── Quick Stats Bar ──────────────────────────────────────────────── */}
        <StaggerItem>
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,200,240,0.06) 0%, rgba(26,106,170,0.08) 50%, rgba(21,59,95,0.12) 100%)',
              border: '1px solid rgba(0,200,240,0.12)',
              boxShadow: '0 0 40px rgba(0,200,240,0.04)',
            }}
          >
            {/* Top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,240,0.4), transparent)' }}
            />

            <div className="flex flex-wrap divide-x divide-brand-blue-deep/40">
              <QuickStat icon={BarChart3}  label="Total de Projetos"   value={String(totalProjetos)}              color="#00C8F0" />
              <QuickStat icon={Rocket}     label="Projetos Ativos"     value={String(kpis.projetosAtivos)}        color="#1A6AAA" />
              <QuickStat icon={Target}     label="Entregas no Mês"     value={String(kpis.entreguesMes)}          color="#10B981" />
              <QuickStat icon={Timer}      label="Próximas Entregas"   value={String(proximasEntregas.length)}    color="#F59E0B" />
              <QuickStat icon={Users}      label="Milestones (14d)"    value={String(proximosMilestones.length)}  color="#94A3B8" />
              {kpis.atrasados > 0 && (
                <QuickStat icon={AlertTriangle} label="Atrasados"      value={String(kpis.atrasados)}             color="#EF4444" />
              )}
            </div>
          </motion.div>
        </StaggerItem>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={LayoutDashboard}
            label="Projetos Ativos"
            value={kpis.projetosAtivos}
            format={(n) => String(n)}
            accentColor="#00C8F0"
            glowColor="#00C8F0"
            gradientStart="#00C8F0"
            gradientEnd="#1A6AAA"
            trend="up"
            subtitle="Backlog, andamento e revisao"
          />
          <KPICard
            icon={TrendingUp}
            label="Entregas no Mes"
            value={kpis.entreguesMes}
            format={(n) => String(n)}
            accentColor="#10B981"
            glowColor="#10B981"
            gradientStart="#10B981"
            gradientEnd="#059669"
            trend="up"
            subtitle="Concluidos esse mes"
          />
          <KPICard
            icon={AlertTriangle}
            label="Atrasados"
            value={kpis.atrasados}
            format={(n) => String(n)}
            accentColor="#EF4444"
            glowColor="#EF4444"
            gradientStart="#EF4444"
            gradientEnd="#B91C1C"
            alert={kpis.atrasados > 0}
            trend={kpis.atrasados > 0 ? 'down' : 'neutral'}
            subtitle={kpis.atrasados > 0 ? 'Requer atencao imediata' : 'Tudo em dia'}
          />
          <KPICard
            icon={DollarSign}
            label="Valor Pipeline"
            value={kpis.valorPipeline}
            format={formatCurrency}
            accentColor="#F59E0B"
            glowColor="#F59E0B"
            gradientStart="#F59E0B"
            gradientEnd="#D97706"
            trend="up"
            subtitle="Projetos ativos somados"
          />
        </StaggerContainer>

        {/* ── Middle row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Status Donut ─────────────────────────────────────────────── */}
          <StaggerItem>
            <div
              className="relative overflow-hidden rounded-2xl p-5 h-full"
              style={{
                background: 'linear-gradient(145deg, rgba(0,200,240,0.05) 0%, rgba(19,31,53,0.95) 60%)',
                border: '1px solid rgba(0,200,240,0.12)',
                boxShadow: '0 0 30px rgba(0,200,240,0.04)',
              }}
            >
              {/* top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,240,0.35), transparent)' }}
              />

              <SectionHeader
                icon={BarChart3}
                title="Status dos Projetos"
                iconBg="rgba(0,200,240,0.12)"
                iconColor="#00C8F0"
              />

              {/* Donut chart */}
              <div className="relative mb-4">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={statusDistribuicao}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
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
                    className="text-3xl font-black leading-none"
                    style={{ color: '#00C8F0', textShadow: '0 0 20px rgba(0,200,240,0.4)' }}
                  >
                    {totalProjetos}
                  </span>
                  <span className="text-xs text-text-muted mt-0.5 font-medium uppercase tracking-widest">
                    projetos
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2">
                {statusDistribuicao.map((s: StatusEntry) => (
                  <motion.div
                    key={s.name}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: `${normalizeColor(s.color)}0A`,
                      border: `1px solid ${normalizeColor(s.color)}18`,
                    }}
                  >
                    <Circle
                      className="h-2 w-2 shrink-0 fill-current"
                      style={{ color: normalizeColor(s.color) }}
                    />
                    <span className="text-xs text-text-secondary truncate flex-1">{s.name}</span>
                    <span
                      className="text-xs font-black ml-auto"
                      style={{ color: normalizeColor(s.color) }}
                    >
                      {s.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </StaggerItem>

          {/* ── Proximas Entregas ────────────────────────────────────────── */}
          <StaggerItem>
            <div
              className="relative overflow-hidden rounded-2xl p-5 h-full"
              style={{
                background: 'linear-gradient(145deg, rgba(245,158,11,0.04) 0%, rgba(19,31,53,0.95) 60%)',
                border: '1px solid rgba(245,158,11,0.12)',
                boxShadow: '0 0 30px rgba(245,158,11,0.03)',
              }}
            >
              {/* top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }}
              />

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
                  subtitle="Sem projetos com deadline nos proximos 7 dias. Aproveite para planejar!"
                  accentColor="#10B981"
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
                        className="relative overflow-hidden rounded-xl p-3"
                        style={{
                          background: urg.bg,
                          border: `1px solid ${urg.color}20`,
                        }}
                      >
                        {/* Left accent stripe */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                          style={{ background: urg.color }}
                        />

                        <div className="flex items-start justify-between gap-2 mb-2.5 pl-1">
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

                        <div className="pl-1">
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
            <div
              className="relative overflow-hidden rounded-2xl p-5 h-full"
              style={{
                background: 'linear-gradient(145deg, rgba(26,106,170,0.06) 0%, rgba(19,31,53,0.95) 60%)',
                border: '1px solid rgba(26,106,170,0.14)',
                boxShadow: '0 0 30px rgba(26,106,170,0.04)',
              }}
            >
              {/* top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(26,106,170,0.5), transparent)' }}
              />

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
                  subtitle="Nenhum marco previsto para os proximos 14 dias. Adicione marcos ao seu plano."
                  accentColor="#1A6AAA"
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
                        m.status === 'em_andamento'? '#00C8F0' :
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
          <div
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(0,200,240,0.04) 0%, rgba(19,31,53,0.95) 60%)',
              border: '1px solid rgba(0,200,240,0.1)',
              boxShadow: '0 0 40px rgba(0,200,240,0.03)',
            }}
          >
            {/* Top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,240,0.35), transparent)' }}
            />

            <div className="flex items-center justify-between mb-5">
              <SectionHeader
                icon={Zap}
                title="Atividade Recente"
                iconBg="rgba(0,200,240,0.12)"
                iconColor="#00C8F0"
              />
              <span
                className="text-xs font-medium text-text-muted hidden sm:block"
                style={{ marginTop: '-20px' }}
              >
                Ultimas {recentUpdates?.length ?? 0} atualizacoes
              </span>
            </div>

            {!recentUpdates || recentUpdates.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sem atividade recente"
                subtitle="As atualizacoes e eventos dos projetos aparecerão aqui assim que forem registrados."
                accentColor="#00C8F0"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentUpdates.map((u, idx) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    className="flex items-start gap-3 p-3 rounded-xl group cursor-default"
                    style={{
                      background: 'rgba(21,59,95,0.12)',
                      border: '1px solid rgba(21,59,95,0.25)',
                    }}
                  >
                    <UpdateIcon tipo={u.tipo} />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {u.conteudo}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: '#00C8F0' }}
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{u.projeto_titulo}</span>
                        </div>
                        <span className="text-text-muted text-xs">·</span>
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
