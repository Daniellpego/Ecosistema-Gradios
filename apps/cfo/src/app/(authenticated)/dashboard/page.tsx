'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, lazy, Suspense } from 'react'
import {
  TrendingUp,
  Repeat,
  Flame,
  Lock,
  ShoppingCart,
  Calculator,
  Wallet,
  Clock,
  HelpCircle,
  X,
  Sparkles,
  Crosshair,
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { PageTransition } from '@/components/motion'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useGroqAnalysis } from '@/hooks/use-groq'
import { useDashboard } from '@/hooks/use-dashboard'
import type { DashboardAlert, HealthStatus } from '@/hooks/use-dashboard'
import { useTax } from '@/providers/tax-provider'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'

// Lazy load heavy chart components (below the fold)
const RevenueExpensesChart = lazy(() => import('@/components/charts/revenue-expenses-chart'))
const CostDistributionChart = lazy(() => import('@/components/charts/cost-distribution-chart'))

// ── Health Banner ────────────────────────────────────────────────────
const HEALTH_CONFIG: Record<
  HealthStatus,
  { label: string; emoji: string; bg: string; text: string; border: string }
> = {
  saudavel: {
    label: 'SAUDÁVEL',
    emoji: '\uD83D\uDFE2',
    bg: 'bg-status-positive/10',
    text: 'text-status-positive',
    border: 'border-status-positive/30',
  },
  atencao: {
    label: 'ATENÇÃO',
    emoji: '\uD83D\uDFE1',
    bg: 'bg-status-warning/10',
    text: 'text-status-warning',
    border: 'border-status-warning/30',
  },
  critico: {
    label: 'CRÍTICO',
    emoji: '\uD83D\uDD34',
    bg: 'bg-status-negative/10',
    text: 'text-status-negative',
    border: 'border-status-negative/30',
  },
  sem_dados: {
    label: 'SEM DADOS',
    emoji: 'ℹ️',
    bg: 'bg-amber-50/50',
    text: 'text-amber-600',
    border: 'border-amber-200/50',
  },
}

function HealthBanner({ status }: { status: HealthStatus }) {
  const config = HEALTH_CONFIG[status]
  return (
    <div
      className={cn(
        'rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3',
        config.bg,
        config.border
      )}
    >
      <span className="text-lg sm:text-xl shrink-0">{config.emoji}</span>
      <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 min-w-0">
        <span className={cn('font-semibold text-xs sm:text-sm tracking-wide shrink-0', config.text)}>
          {config.label}
        </span>
        <span className="text-text-secondary text-[11px] sm:text-sm leading-snug">
          {status === 'saudavel' && 'Finanças dentro dos parâmetros saudáveis'}
          {status === 'atencao' && 'Alguns indicadores requerem atenção'}
          {status === 'critico' && 'Indicadores críticos detectados — ação necessária'}
          {status === 'sem_dados' && 'Comece cadastrando receitas e custos para ver o status da operação'}
        </span>
      </div>
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────
interface KPICardProps {
  label: string
  value: string
  variation: number | null
  icon: React.ReactNode
  tooltip: string
  invertVariation?: boolean
  href?: string
}

function KPICard({ label, value, variation, icon, tooltip, invertVariation, href }: KPICardProps) {
  const isPositive = variation !== null && (invertVariation ? variation < 0 : variation > 0)
  const isNegative = variation !== null && (invertVariation ? variation > 0 : variation < 0)

  const content = (
    <div className={cn(
      'card-glass p-3 sm:p-4 space-y-2 sm:space-y-3 transition-all active:scale-[0.98]',
      href && 'hover:ring-1 hover:ring-brand-cyan/30 cursor-pointer'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-brand-cyan/80">{icon}</div>
          <span className="text-[9px] sm:text-[10px] text-text-muted font-bold tracking-wider uppercase">
            {label}
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-text-muted hover:text-text-primary transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-end">
        <p className="text-lg sm:text-2xl font-black text-text-primary tracking-tight font-inter">
          {value || '--'}
        </p>

        {variation !== null ? (
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
            <span
              className={cn(
                'text-[10px] sm:text-[11px] font-bold tracking-tight',
                isPositive && 'text-status-positive',
                isNegative && 'text-status-negative',
                !isPositive && !isNegative && 'text-text-muted'
              )}
            >
              {isPositive && '+'}
              {formatPercent(variation)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-text-muted/60 font-medium">vs mês ant.</span>
          </div>
        ) : (
          <div className="h-3 sm:h-4" />
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

function KPICardSkeleton() {
  return (
    <div className="card-glass p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// ── Alert Card ───────────────────────────────────────────────────────
function AlertCard({
  alert,
  onDismiss,
}: {
  alert: DashboardAlert
  onDismiss: (id: string) => void
}) {
  const borderColor =
    alert.type === 'critical'
      ? 'border-status-negative/40'
      : alert.type === 'warning'
        ? 'border-status-warning/40'
        : 'border-brand-blue/40'

  const bgColor =
    alert.type === 'critical'
      ? 'bg-status-negative/5'
      : alert.type === 'warning'
        ? 'bg-status-warning/5'
        : 'bg-slate-50'

  return (
    <div className={cn('rounded-xl border p-3 sm:p-4 flex items-start gap-2 sm:gap-3', borderColor, bgColor)}>
      <span className="text-base sm:text-lg shrink-0 mt-0.5">{alert.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-text-primary">{alert.title}</p>
        <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 leading-relaxed">{alert.description}</p>
        {alert.action && (
          <p className="text-[11px] sm:text-xs text-brand-cyan mt-1 font-medium">{alert.action}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  useEffect(() => { document.title = 'Dashboard | Gradios CFO' }, [])

  const dashboard = useDashboard()
  const { simplesEnabled, aliquota } = useTax()

  // Apply Simples Nacional overlay
  const impostoSimples = simplesEnabled ? dashboard.kpis.receitaTotal * (aliquota / 100) : 0
  const kpis = {
    ...dashboard.kpis,
    resultadoLiquido: dashboard.kpis.resultadoLiquido - impostoSimples,
    burnRate: dashboard.kpis.burnRate + impostoSimples,
    runway: (dashboard.kpis.burnRate + impostoSimples) > 0
      ? dashboard.kpis.caixaDisponivel / (dashboard.kpis.burnRate + impostoSimples)
      : dashboard.kpis.caixaDisponivel > 0 ? 99 : 0,
    margem: dashboard.kpis.receitaTotal > 0
      ? ((dashboard.kpis.resultadoLiquido - impostoSimples) / dashboard.kpis.receitaTotal) * 100
      : 0,
  }
  const { variations, chartData, costDistribution, alerts, healthStatus, isLoading, error } = dashboard

  const { analyze, isLoading: aiLoading, error: aiError } = useGroqAnalysis()
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id))

  function handleDismiss(id: string) {
    setDismissedAlerts((prev) => new Set(prev).add(id))
  }

  async function handleGenerateAI() {
    const result = await analyze({
      prompt: 'Analise os dados financeiros deste mês e gere um resumo executivo com insights e recomendações acionáveis. Responda em português.',
      context: {
        receitaTotal: kpis.receitaTotal,
        mrr: kpis.mrr,
        burnRate: kpis.burnRate,
        custosFixos: kpis.custosFixos,
        custosVariaveis: kpis.custosVariaveis,
        resultadoLiquido: kpis.resultadoLiquido,
        caixaDisponivel: kpis.caixaDisponivel,
        runway: kpis.runway,
        margem: kpis.margem,
        variacaoReceita: variations.receitaTotal,
        variacaoMrr: variations.mrr,
        historico6m: chartData,
        distribuicaoCustos: costDistribution,
        alertas: alerts.map((a) => a.title),
        statusSaude: healthStatus,
      },
      systemPrompt:
        'Você é o CFO virtual da Gradios. Analise os dados financeiros e gere um resumo executivo conciso com: 1) Visão geral da saúde financeira, 2) Top 3 pontos de atenção, 3) Recomendações acionáveis. Use formatação markdown. Seja direto e objetivo.',
    })
    if (result) {
      setAiSummary(result)
    }
  }

  // ── KPI definitions ───────────────────────────────────────────────
  const margemBruta = kpis.receitaTotal > 0
    ? ((kpis.receitaTotal - kpis.custosVariaveis) / kpis.receitaTotal) * 100
    : 0

  const kpiCards = [
    {
      label: 'Receita Total',
      value: formatCurrency(kpis.receitaTotal),
      variation: variations.receitaTotal,
      icon: <TrendingUp className="h-4 w-4" />,
      tooltip: 'Soma de todas as receitas confirmadas no período selecionado',
      href: '/receitas',
    },
    {
      label: 'MRR',
      value: formatCurrency(kpis.mrr),
      variation: variations.mrr,
      icon: <Repeat className="h-4 w-4" />,
      tooltip: 'Monthly Recurring Revenue — apenas receitas recorrentes confirmadas',
      href: '/receitas',
    },
    {
      label: 'Burn Rate',
      value: formatCurrency(kpis.burnRate),
      variation: variations.burnRate,
      icon: <Flame className="h-4 w-4" />,
      tooltip: 'Custos Fixos + Média 3 meses de Custos Variáveis. Menor é melhor.',
      invertVariation: true,
      href: '/custos-fixos',
    },
    {
      label: 'Custos Fixos',
      value: formatCurrency(kpis.custosFixos),
      variation: variations.custosFixos,
      icon: <Lock className="h-4 w-4" />,
      tooltip: 'Despesas fixas mensais ativas — ferramentas, contabilidade, etc.',
      href: '/custos-fixos',
    },
    {
      label: 'Custos Variáveis',
      value: formatCurrency(kpis.custosVariaveis),
      variation: variations.custosVariaveis,
      icon: <ShoppingCart className="h-4 w-4" />,
      tooltip: 'Gastos que variam com vendas — marketing, freelancers, taxas',
      invertVariation: true,
      href: '/gastos-variaveis',
    },
    {
      label: 'Resultado Líquido',
      value: formatCurrency(kpis.resultadoLiquido),
      variation: variations.resultadoLiquido,
      icon: <Calculator className="h-4 w-4" />,
      tooltip: 'Receita Bruta - Custos Variáveis - Custos Fixos - Impostos',
      href: '/dre',
    },
    {
      label: 'Caixa Disponível',
      value: formatCurrency(kpis.caixaDisponivel),
      variation: variations.caixaDisponivel,
      icon: <Wallet className="h-4 w-4" />,
      tooltip: 'Saldo atual em conta bancária — atualizado manualmente',
      href: '/balanco-anual',
    },
    {
      label: 'Runway',
      value: kpis.runway >= 99 ? '99+ meses' : `${kpis.runway.toFixed(1)} meses`,
      variation: variations.runway,
      icon: <Clock className="h-4 w-4" />,
      tooltip: 'Quanto tempo a empresa sobrevive sem novas receitas — Caixa ÷ Burn Rate',
      href: '/projecoes',
    },
    {
      label: 'Break-even',
      value: kpis.receitaTotal === 0 ? 'N/D' : formatCurrency(kpis.breakEven),
      variation: null,
      icon: <Crosshair className="h-4 w-4" />,
      tooltip: 'Receita mensal necessária para cobrir custos fixos. CF ÷ (1 - CV/Receita)',
      href: '/dre',
    },
  ]

  // ── Render ────────────────────────────────────────────────────────
  return (
    <PageTransition>
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-0.5 mb-1">
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Painel Geral</h1>
        <p className="text-xs sm:text-sm text-text-muted font-medium">Visão geral do desempenho financeiro da operação.</p>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState 
          title="Erro ao carregar dashboard" 
          description={error.message} 
          onRetry={() => window.location.reload()}
          className="card-glass"
        />
      )}

      {/* Section 1 — Health Banner */}
      {isLoading ? (
        <Skeleton className="h-12 w-full rounded-xl" />
      ) : (
        <HealthBanner status={healthStatus} />
      )}

      {/* Welcome onboarding when no data */}
      {healthStatus === 'sem_dados' && !isLoading && (
        <div className="card-glass p-6 space-y-4">
          <p className="text-lg font-semibold text-text-primary">👋 Bem-vindo ao Painel CFO!</p>
          <p className="text-sm text-text-secondary">Comece cadastrando seus dados financeiros:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/custos-fixos" className="text-sm text-brand-cyan hover:underline">1. Custos Fixos →</a>
            <a href="/receitas" className="text-sm text-brand-cyan hover:underline">2. Receitas →</a>
            <a href="/gastos-variaveis" className="text-sm text-brand-cyan hover:underline">3. Gastos Variáveis →</a>
          </div>
        </div>
      )}

      {/* Section 2 — KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpiCards.map((card) => <KPICard key={card.label} {...card} />)}
      </div>

      {/* Margem Bruta note */}
      {!isLoading && margemBruta === 100 && kpis.custosVariaveis === 0 && kpis.receitaTotal > 0 && (
        <p className="text-[10px] text-status-warning px-1">Margem Bruta 100% — nenhum custo variável registrado neste período</p>
      )}

      {/* Section 3 — Smart Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Alertas Inteligentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
            ))}
          </div>
        </div>
      )}

      {/* Section 4 — Revenue vs Expenses Chart */}
      <div className="card-glass p-3 sm:p-6">
        <h2 className="text-xs sm:text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3 sm:mb-4">
          Receita vs Despesas (6 meses)
        </h2>
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <EmptyState
            title="Gráfico indisponível"
            description="Adicione receitas e despesas nos menus laterais para visualizar o histórico."
          />
        ) : (
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-lg" />}>
            <RevenueExpensesChart data={chartData} />
          </Suspense>
        )}
      </div>

      {/* Section 5 — Cost Distribution */}
      <div className="card-glass p-3 sm:p-6">
        <h2 className="text-xs sm:text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3 sm:mb-4">
          Distribuição de Custos
        </h2>
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : costDistribution.length === 0 ? (
          <EmptyState
            title="Sem custos registrados"
            description="Não há dados de custos fixos ou variáveis para este período."
            className="py-8"
          />
        ) : (
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-lg" />}>
            <CostDistributionChart data={costDistribution} />
          </Suspense>
        )}
      </div>

      {/* Section 6 — AI Summary */}
      <div className="card-glass p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-sm font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-cyan" />
            Análise IA
          </h2>
          <Button
            onClick={handleGenerateAI}
            disabled={aiLoading || isLoading}
            className="text-[11px] sm:text-xs"
            variant="outline"
            size="sm"
          >
            {aiLoading ? 'Analisando...' : 'Gerar análise'}
          </Button>
        </div>

        {aiError && (
          <div className="rounded-lg bg-status-warning/10 border border-status-warning/30 px-3 py-2 mb-3">
            <p className="text-xs text-status-warning">
              {aiError.includes('non-2xx') || aiError.includes('Edge Function')
                ? 'Configure a GROQ_API_KEY nas variáveis de ambiente do Supabase para ativar a análise por IA'
                : `Não foi possível gerar a análise agora. Tente novamente em instantes.`}
            </p>
          </div>
        )}

        {aiSummary ? (
          <div className="ai-analysis-content text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-lg font-bold text-text-primary mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold text-text-primary mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold text-text-primary mt-3 mb-1.5">{children}</h3>,
                h4: ({ children }) => <h4 className="text-sm font-semibold text-text-primary mt-3 mb-1">{children}</h4>,
                p: ({ children }) => <p className="text-text-secondary mb-2 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-text-secondary">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-text-secondary">{children}</ol>,
                li: ({ children }) => <li className="text-text-secondary leading-relaxed">{children}</li>,
                hr: () => <hr className="border-slate-200 my-3" />,
              }}
            >
              {aiSummary}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-text-dark text-sm">
            Clique em &quot;Gerar análise do mês&quot; para obter insights da IA
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  )
}

