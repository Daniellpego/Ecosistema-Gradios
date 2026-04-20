'use client'

export const dynamic = 'force-dynamic'

import { useMemo, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useDRE, type DRELine } from '@/hooks/use-dre'
import { useTax } from '@/providers/tax-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/motion'
import { EmptyState } from '@/components/ui/empty-state'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
} from 'recharts'

function DRETableSkeleton() {
  return (
    <div className="card-glass space-y-3">
      <Skeleton className="h-5 w-48 mb-4" />
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="card-glass">
      <Skeleton className="h-5 w-48 mb-4" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}

function formatDREValue(value: number): string {
  return formatCurrency(Math.abs(value))
}

function formatDREPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function DRERow({ line }: { line: DRELine }) {
  if (line.type === 'separator') {
    return (
      <tr>
        <td colSpan={4} className="py-0.5 sm:py-1">
          <div className="border-t border-slate-200" />
        </td>
      </tr>
    )
  }

  const isSimplesLine = line.label.includes('SIMPLES NACIONAL')
  const isNegativeHeader =
    !isSimplesLine && (line.label.startsWith('(-)') || line.label.includes('CUSTOS') || line.label.includes('IMPOSTOS'))
  const isPositiveHeader = line.label === 'RECEITA BRUTA'
  const isSubtotal = line.type === 'subtotal'
  const isTotal = line.type === 'total'
  const isSub = line.type === 'sub'

  const valuePositive = line.month >= 0
  const ytdPositive = line.ytd >= 0

  return (
    <tr
      className={cn(
        'transition-colors border-b border-slate-100',
        isTotal && 'bg-brand-cyan/5 border-y-2 border-brand-cyan/20 group/total',
        isSubtotal && 'bg-slate-50/80 font-bold',
        isSimplesLine && 'bg-status-warning/5',
        isSub && 'hover:bg-slate-50/50'
      )}
    >
      {/* Label */}
      <td
        className={cn(
          'py-1.5 sm:py-2 pr-2 sm:pr-4',
          line.indent && 'pl-4 sm:pl-8',
          !line.indent && 'pl-2 sm:pl-3',
          isTotal && 'text-sm sm:text-lg font-bold text-text-primary',
          isSubtotal && 'font-semibold text-text-primary text-xs sm:text-sm',
          isPositiveHeader && 'font-bold text-status-positive text-xs sm:text-sm',
          isSimplesLine && 'font-semibold text-status-warning text-xs sm:text-sm',
          isNegativeHeader && !isSubtotal && !isTotal && 'font-semibold text-status-negative text-xs sm:text-sm',
          isSub && 'text-xs sm:text-sm text-text-secondary'
        )}
      >
        {line.label}
      </td>

      {/* Mes Selecionado */}
      <td
        className={cn(
          'py-1.5 sm:py-2 px-2 sm:px-4 text-right font-mono whitespace-nowrap',
          isTotal && 'text-sm sm:text-lg font-bold',
          isSubtotal && 'font-semibold text-xs sm:text-sm',
          isSub && 'text-xs sm:text-sm',
          isSimplesLine
            ? 'text-status-warning'
            : isTotal || isSubtotal
              ? valuePositive
                ? 'text-status-positive'
                : 'text-status-negative'
              : isNegativeHeader
                ? 'text-status-negative'
                : isPositiveHeader
                  ? 'text-status-positive'
                  : 'text-text-primary'
        )}
      >
        {(isNegativeHeader || isSimplesLine) && !isSubtotal && !isTotal && line.month > 0 ? '-' : ''}
        {formatDREValue(line.month)}
      </td>

      {/* Acumulado Ano */}
      <td
        className={cn(
          'py-1.5 sm:py-2 px-2 sm:px-4 text-right font-mono whitespace-nowrap hidden sm:table-cell',
          isTotal && 'text-sm sm:text-lg font-bold',
          isSubtotal && 'font-semibold text-xs sm:text-sm',
          isSub && 'text-xs sm:text-sm',
          isSimplesLine
            ? 'text-status-warning'
            : isTotal || isSubtotal
              ? ytdPositive
                ? 'text-status-positive'
                : 'text-status-negative'
              : 'text-text-secondary'
        )}
      >
        {(isNegativeHeader || isSimplesLine) && !isSubtotal && !isTotal && line.ytd > 0 ? '-' : ''}
        {formatDREValue(line.ytd)}
      </td>

      {/* % Receita */}
      <td
        className={cn(
          'py-1.5 sm:py-2 pl-2 sm:pl-4 pr-2 sm:pr-3 text-right font-mono whitespace-nowrap hidden md:table-cell',
          isTotal && 'text-sm sm:text-lg font-bold',
          isSubtotal && 'font-semibold text-xs sm:text-sm',
          isSub && 'text-xs sm:text-sm',
          valuePositive ? 'text-status-positive' : 'text-status-negative'
        )}
      >
        {formatDREPercent(line.percent)}
      </td>
    </tr>
  )
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="tooltip-brand shadow-xl">
      <p className="mb-2 text-sm font-medium text-text-primary">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function DREPage() {
  useEffect(() => { document.title = 'DRE | Gradios CFO' }, [])

  const { lines: rawLines, current, ytd, chartData, isLoading, isChartLoading } = useDRE()
  const { simplesEnabled, aliquota } = useTax()

  // Inject Simples Nacional line when toggle is ON
  const lines = useMemo(() => {
    if (!simplesEnabled || isLoading) return rawLines
    const impostoSimples = current.receitaBruta * (aliquota / 100)
    const impostoSimplesYtd = ytd.receitaBruta * (aliquota / 100)
    const rb = current.receitaBruta
    const rbYtd = ytd.receitaBruta
    const result: DRELine[] = []

    for (const line of rawLines) {
      if (line.type === 'total' && line.label === '(=) RESULTADO LÍQUIDO') {
        // Before resultado liquido, inject simples line
        result.push({
          label: `(-) SIMPLES NACIONAL (${aliquota}%)`,
          month: impostoSimples,
          ytd: impostoSimplesYtd,
          percent: rb > 0 ? (impostoSimples / rb) * 100 : 0,
          percentYtd: rbYtd > 0 ? (impostoSimplesYtd / rbYtd) * 100 : 0,
          type: 'header',
        })
        result.push({ label: '', month: 0, ytd: 0, percent: 0, percentYtd: 0, type: 'separator' })
        // Adjust resultado liquido
        const adjustedRL = current.resultadoLiquido - impostoSimples
        const adjustedRLYtd = ytd.resultadoLiquido - impostoSimplesYtd
        result.push({
          ...line,
          month: adjustedRL,
          ytd: adjustedRLYtd,
          percent: rb > 0 ? (adjustedRL / rb) * 100 : 0,
          percentYtd: rbYtd > 0 ? (adjustedRLYtd / rbYtd) * 100 : 0,
        })
      } else {
        result.push(line)
      }
    }
    return result
  }, [rawLines, simplesEnabled, aliquota, current, ytd, isLoading])

  const last6 = useMemo(() => chartData.slice(-6), [chartData])

  const impostoSimples = simplesEnabled ? current.receitaBruta * (aliquota / 100) : 0

  const kpis = useMemo(() => {
    if (isLoading) return null
    return {
      receitaBruta: current.receitaBruta,
      margemBruta: current.pctMargemBruta,
      resultadoLiquido: current.resultadoLiquido - impostoSimples,
      margemLiquida: current.receitaBruta > 0
        ? ((current.resultadoLiquido - impostoSimples) / current.receitaBruta) * 100
        : 0,
    }
  }, [current, isLoading, impostoSimples])

  return (
    <PageTransition>
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-0.5 mb-1">
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">DRE Simplificada</h1>
        <p className="text-xs sm:text-sm text-text-muted font-medium">Demonstrativo de Resultados do Exercício — Visão Gerencial.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-glass">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-32" />
            </div>
          ))
        ) : (
          <>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-status-positive" />
                <span className="text-xs text-text-secondary">Receita Bruta</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-status-positive">
                {formatCurrency(kpis!.receitaBruta)}
              </p>
            </div>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-brand-cyan" />
                <span className="text-xs text-text-secondary">Margem Bruta</span>
              </div>
              <p
                className={cn(
                  'text-lg font-bold',
                  kpis!.margemBruta >= 0 ? 'text-status-positive' : 'text-status-negative'
                )}
              >
                {formatDREPercent(kpis!.margemBruta)}
              </p>
            </div>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-1">
                {kpis!.resultadoLiquido >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-status-positive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-status-negative" />
                )}
                <span className="text-xs text-text-secondary">Resultado Liq.</span>
              </div>
              <p
                className={cn(
                  'text-lg font-bold',
                  kpis!.resultadoLiquido >= 0
                    ? 'text-status-positive'
                    : 'text-status-negative'
                )}
              >
                {formatCurrency(kpis!.resultadoLiquido)}
              </p>
            </div>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-brand-cyan" />
                <span className="text-xs text-text-secondary">Margem Liq.</span>
              </div>
              <p
                className={cn(
                  'text-lg font-bold',
                  kpis!.margemLiquida >= 0 ? 'text-status-positive' : 'text-status-negative'
                )}
              >
                {formatDREPercent(kpis!.margemLiquida)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* DRE Table */}
      {isLoading ? (
        <DRETableSkeleton />
      ) : (current.receitaBruta === 0 && current.resultadoLiquido === 0 && current.cfTotal === 0) ? (
        <EmptyState 
          title="DRE sem dados no período" 
          description="Cadastre receitas e custos para visualizar a Demonstração de Resultado."
          className="card-glass py-20"
        />
      ) : (
        <div className="card-glass overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2.5 sm:py-3 pl-2 sm:pl-3 pr-2 sm:pr-4 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Conta
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-right text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Mês Atual
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-right text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">
                  Acumulado Ano
                </th>
                <th className="py-2.5 sm:py-3 pl-2 sm:pl-4 pr-2 sm:pr-3 text-right text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">
                  % Receita
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <DRERow key={`${line.label}-${i}`} line={line} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Receita vs Custos - last 6 months */}
        {isChartLoading ? (
          <ChartSkeleton />
        ) : last6.length === 0 ? (
          <div className="card-glass flex items-center justify-center h-72 text-text-dark text-sm">
            Adicione dados para visualizar o gráfico
          </div>
        ) : (
          <div className="card-glass">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Receita vs Custos (6 meses)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={last6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#153B5F" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    axisLine={{ stroke: '#153B5F' }}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#153B5F' }}
                    tickFormatter={(v: number) =>
                      `${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#94A3B8' }}
                  />
                  <Bar
                    dataKey="receitaBruta"
                    name="Receita"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="custosVariaveis"
                    name="Custos Var."
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="custosFixos"
                    name="Custos Fixos"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Line
                    type="monotone"
                    dataKey="margemBruta"
                    name="Margem Bruta"
                    stroke="#00C8F0"
                    strokeWidth={2}
                    dot={{ fill: '#00C8F0', r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Resultado Líquido - last 12 months */}
        {isChartLoading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <div className="card-glass flex items-center justify-center h-72 text-text-dark text-sm">
            Adicione dados para visualizar o gráfico
          </div>
        ) : (
          <div className="card-glass">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Resultado Líquido (12 meses)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#153B5F" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    axisLine={{ stroke: '#153B5F' }}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#153B5F' }}
                    tickFormatter={(v: number) =>
                      `${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#94A3B8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resultadoLiquido"
                    name="Resultado Liq."
                    stroke="#00C8F0"
                    strokeWidth={2.5}
                    dot={{ fill: '#00C8F0', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#00C8F0', stroke: '#0A1628', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="receitaBruta"
                    name="Receita"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  )
}

