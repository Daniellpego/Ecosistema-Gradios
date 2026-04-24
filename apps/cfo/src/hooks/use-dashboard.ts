'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { usePeriod } from '@/providers/period-provider'
import type { Receita, CustoFixo, GastoVariavel, Caixa, MetaFinanceira } from '@/types/database'

// ── Helpers ──────────────────────────────────────────────────────────
function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

function subtractMonths(year: number, month: number, n: number) {
  let m = month - n
  let y = year
  while (m <= 0) {
    m += 12
    y -= 1
  }
  return { year: y, month: m }
}

// ── Types ────────────────────────────────────────────────────────────
export interface DashboardKPIs {
  receitaTotal: number
  mrr: number
  burnRate: number
  custosFixos: number
  custosVariaveis: number
  resultadoLiquido: number
  caixaDisponivel: number
  runway: number // in months
  margem: number // percentage
  breakEven: number // monthly revenue needed
  margemBruta: number // percentage
}

export interface DashboardVariation {
  receitaTotal: number | null
  mrr: number | null
  burnRate: number | null
  custosFixos: number | null
  custosVariaveis: number | null
  resultadoLiquido: number | null
  caixaDisponivel: number | null
  runway: number | null
}

export interface ChartMonth {
  month: string // "jan/26"
  receita: number
  custos: number
  resultado: number
}

export interface CostSlice {
  name: string
  value: number
  color: string
}

export type HealthStatus = 'saudavel' | 'atencao' | 'critico' | 'sem_dados'

export interface DashboardAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  priority: number // 1=urgente, 2=atenção, 3=info
  icon: string
  title: string
  description: string
  action?: string
}

export interface DashboardData {
  kpis: DashboardKPIs
  variations: DashboardVariation
  chartData: ChartMonth[]
  costDistribution: CostSlice[]
  alerts: DashboardAlert[]
  healthStatus: HealthStatus
  isLoading: boolean
  error: Error | null
  metas: MetaFinanceira[]
}

// ── Category colors ──────────────────────────────────────────────────
const COST_COLORS: Record<string, string> = {
  ferramentas: '#1A6AAA',
  contabilidade: '#00C8F0',
  marketing: '#F59E0B',
  infraestrutura: '#10B981',
  administrativo: '#8B5CF6',
  pro_labore: '#EC4899',
  impostos_fixos: '#EF4444',
  outro: '#94A3B8',
  operacional: '#2B7AB5',
  comercial: '#40D8EE',
  impostos_variaveis: '#EF4444',
  freelancer: '#F97316',
  api_consumo: '#6366F1',
}

const CATEGORY_LABELS: Record<string, string> = {
  ferramentas: 'Ferramentas',
  contabilidade: 'Contabilidade',
  marketing: 'Marketing',
  infraestrutura: 'Infraestrutura',
  administrativo: 'Administrativo',
  pro_labore: 'Pró-labore',
  impostos_fixos: 'Impostos Fixos',
  outro: 'Outro',
  operacional: 'Operacional',
  comercial: 'Comercial',
  impostos_variaveis: 'Impostos Variáveis',
  freelancer: 'Freelancer',
  api_consumo: 'API / Consumo',
}

// ── Main hook ────────────────────────────────────────────────────────
export function useDashboard(): DashboardData {
  const { month, year, startDate, endDate } = usePeriod()
  const supabase = createClient()

  // 6 months ago boundary
  const sixAgo = subtractMonths(year, month, 5)
  const sixMonthsStart = `${sixAgo.year}-${String(sixAgo.month).padStart(2, '0')}-01`

  // Previous month for variation
  const prev = subtractMonths(year, month, 1)
  const prevRange = monthRange(prev.year, prev.month)

  // ── Receitas current month ──
  const receitasQuery = useQuery({
    queryKey: ['dashboard-receitas', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .eq('status', 'confirmado')
      if (error) throw error
      return data as Receita[]
    },
  })

  // ── Receitas last 6 months ──
  const receitas6mQuery = useQuery({
    queryKey: ['dashboard-receitas-6m', sixMonthsStart, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', sixMonthsStart)
        .lte('data', endDate)
        .eq('status', 'confirmado')
        .order('data', { ascending: true })
      if (error) throw error
      return data as Receita[]
    },
  })

  // ── Receitas previous month ──
  const receitasPrevQuery = useQuery({
    queryKey: ['dashboard-receitas-prev', prevRange.start, prevRange.end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', prevRange.start)
        .lte('data', prevRange.end)
        .eq('status', 'confirmado')
      if (error) throw error
      return data as Receita[]
    },
  })

  // ── Custos fixos (active) ──
  const custosFixosQuery = useQuery({
    queryKey: ['dashboard-custos-fixos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custos_fixos')
        .select('*')
        .eq('status', 'ativo')
      if (error) throw error
      return data as CustoFixo[]
    },
  })

  // ── Gastos variáveis current month ──
  const gastosQuery = useQuery({
    queryKey: ['dashboard-gastos', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_variaveis')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .eq('status', 'confirmado')
      if (error) throw error
      return data as GastoVariavel[]
    },
  })

  // ── Gastos variáveis last 6 months ──
  const gastos6mQuery = useQuery({
    queryKey: ['dashboard-gastos-6m', sixMonthsStart, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_variaveis')
        .select('*')
        .gte('data', sixMonthsStart)
        .lte('data', endDate)
        .eq('status', 'confirmado')
        .order('data', { ascending: true })
      if (error) throw error
      return data as GastoVariavel[]
    },
  })

  // ── Gastos variáveis previous month ──
  const gastosPrevQuery = useQuery({
    queryKey: ['dashboard-gastos-prev', prevRange.start, prevRange.end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_variaveis')
        .select('*')
        .gte('data', prevRange.start)
        .lte('data', prevRange.end)
        .eq('status', 'confirmado')
      if (error) throw error
      return data as GastoVariavel[]
    },
  })

  // ── Caixa (latest) ──
  const caixaQuery = useQuery({
    queryKey: ['dashboard-caixa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('caixa')
        .select('*')
        .order('data', { ascending: false })
        .limit(3)
      if (error) throw error
      return data as Caixa[]
    },
  })

  // ── Metas financeiras (current month) ──
  const periodoDate = `${year}-${String(month).padStart(2, '0')}-01`
  const metasQuery = useQuery({
    queryKey: ['dashboard-metas', periodoDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_financeiras')
        .select('*')
        .eq('periodo', periodoDate)
      if (error) throw error
      return data as MetaFinanceira[]
    },
  })

  // ── Compute KPIs ──────────────────────────────────────────────────
  const kpisAndVariations = React.useMemo(() => {
    const receitas = receitasQuery.data ?? []
    const receitasPrev = receitasPrevQuery.data ?? []
    const custosFixos = custosFixosQuery.data ?? []
    const gastos = gastosQuery.data ?? []
    const gastosPrev = gastosPrevQuery.data ?? []
    const caixaEntries = caixaQuery.data ?? []

    // Receita Bruta (valor_bruto) — mesma base da DRE
    const receitaTotal = receitas.reduce((s, r) => s + Number(r.valor_bruto || 0), 0)
    const mrr = receitas.filter(r => r.recorrente && r.tipo !== 'setup').reduce((s, r) => s + Number(r.valor_bruto || 0), 0)
    const totalCustosFixos = custosFixos.reduce((s, c) => s + Number(c.valor_mensal || 0), 0)
    
    // Gastos variáveis SEM impostos (consistente com DRE)
    const gastosVarSemImpostos = gastos.filter(g => g.tipo !== 'impostos')
    const totalGastosVar = gastosVarSemImpostos.reduce((s, g) => s + Number(g.valor || 0), 0)
    const impostos = gastos.filter(g => g.tipo === 'impostos').reduce((s, g) => s + Number(g.valor || 0), 0)
    
    // Burn Rate with 3-month avg of variable costs
    const gastos6m = gastos6mQuery.data ?? []
    const threeMonthsAgoDate = subtractMonths(year, month, 2)
    const threeMonthsStart = `${threeMonthsAgoDate.year}-${String(threeMonthsAgoDate.month).padStart(2, '0')}-01`
    const gastos3m = gastos6m.filter(g => g.data >= threeMonthsStart && g.data <= endDate)
    const totalGastos3m = gastos3m.reduce((s, g) => s + Number(g.valor || 0), 0)
    const avgGastosVar3m = totalGastos3m / 3

    // Burn rate inclui impostos (Simples Nacional sobre faturamento)
    const gastos3mSemImpostos = gastos3m.filter(g => g.tipo !== 'impostos')
    const impostos3m = gastos3m.filter(g => g.tipo === 'impostos')
    const avgGastosVar3mSemImp = gastos3mSemImpostos.reduce((s, g) => s + Number(g.valor || 0), 0) / 3
    const avgImpostos3m = impostos3m.reduce((s, g) => s + Number(g.valor || 0), 0) / 3
    const burnRate = totalCustosFixos + avgGastosVar3mSemImp + avgImpostos3m
    // DRE cascade: Receita - CV - CF - Impostos
    const margemBrutaVal = receitaTotal - totalGastosVar
    const resultadoOperacional = margemBrutaVal - totalCustosFixos
    const resultadoLiquido = resultadoOperacional - impostos

    // Break-even point (monthly revenue to cover fixed costs)
    const cvRatio = receitaTotal > 0 ? totalGastosVar / receitaTotal : 0
    const breakEven = cvRatio < 1 ? totalCustosFixos / (1 - cvRatio) : 0
    const margemBruta = receitaTotal > 0 ? ((receitaTotal - totalGastosVar) / receitaTotal) * 100 : 0
    const caixaDisponivel = caixaEntries.length > 0 ? Number(caixaEntries[0]?.saldo || 0) : 0
    const runway = burnRate > 0 ? caixaDisponivel / burnRate : 0
    const margem = receitaTotal > 0 ? (resultadoLiquido / receitaTotal) * 100 : 0

    const kpis: DashboardKPIs = {
      receitaTotal,
      mrr,
      burnRate,
      custosFixos: totalCustosFixos,
      custosVariaveis: totalGastosVar,
      resultadoLiquido,
      caixaDisponivel,
      runway,
      margem,
      breakEven,
      margemBruta,
    }

    // Previous month KPIs for variation
    const prevReceitaTotal = receitasPrev.reduce((s, r) => s + Number(r.valor_bruto || 0), 0)
    const prevMrr = receitasPrev.filter(r => r.recorrente && r.tipo !== 'setup').reduce((s, r) => s + Number(r.valor_bruto || 0), 0)
    const prevGastosVarSemImp = gastosPrev.filter(g => g.tipo !== 'impostos')
    const prevGastosVar = prevGastosVarSemImp.reduce((s, g) => s + Number(g.valor || 0), 0)
    const prevImpostos = gastosPrev.filter(g => g.tipo === 'impostos').reduce((s, g) => s + Number(g.valor || 0), 0)
    const prevBurnRate = totalCustosFixos + prevGastosVar + prevImpostos
    const prevResultado = prevReceitaTotal - prevGastosVar - totalCustosFixos - prevImpostos

    function pctChange(curr: number, prev: number): number | null {
      if (prev === 0) return curr === 0 ? null : 100
      return ((curr - prev) / Math.abs(prev)) * 100
    }

    const variations: DashboardVariation = {
      receitaTotal: pctChange(receitaTotal, prevReceitaTotal),
      mrr: pctChange(mrr, prevMrr),
      burnRate: pctChange(burnRate, prevBurnRate),
      custosFixos: null,
      custosVariaveis: pctChange(totalGastosVar, prevGastosVar),
      resultadoLiquido: pctChange(resultadoLiquido, prevResultado),
      caixaDisponivel: caixaEntries.length >= 2 ? pctChange(Number(caixaEntries[0]?.saldo || 0), Number(caixaEntries[1]?.saldo || 0)) : null,
      runway: null,
    }

    return { kpis, variations }
  }, [
    receitasQuery.data,
    receitasPrevQuery.data,
    custosFixosQuery.data,
    gastosQuery.data,
    gastosPrevQuery.data,
    gastos6mQuery.data,
    caixaQuery.data,
    year,
    month,
    endDate,
  ])

  const { kpis, variations } = kpisAndVariations

  // ── Chart data (last 6 months) ────────────────────────────────────
  const { chartData, costDistribution } = React.useMemo(() => {
    const receitas6m = receitas6mQuery.data ?? []
    const gastos6m = gastos6mQuery.data ?? []
    const custosFixos = custosFixosQuery.data ?? []
    const gastos = gastosQuery.data ?? []
    const totalCustosFixos = kpis.custosFixos

    const chartData: ChartMonth[] = []
    for (let i = 5; i >= 0; i--) {
      const m = subtractMonths(year, month, i)
      const range = monthRange(m.year, m.month)
      const monthReceita = receitas6m
        .filter(r => r.data >= range.start && r.data <= range.end)
        .reduce((s, r) => s + Number(r.valor_bruto || 0), 0)
      const monthGastos = gastos6m
        .filter(g => g.data >= range.start && g.data <= range.end)
        .reduce((s, g) => s + Number(g.valor || 0), 0)
      const monthCustos = monthGastos + totalCustosFixos
      const label = new Date(m.year, m.month - 1)
        .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

      chartData.push({
        month: label,
        receita: monthReceita,
        custos: monthCustos,
        resultado: monthReceita - monthCustos,
      })
    }

    // ── Cost distribution ─────────────────────────────────────────────
    const costMap: Record<string, number> = {}

    for (const cf of custosFixos) {
      const key = cf.categoria
      costMap[key] = (costMap[key] ?? 0) + Number(cf.valor_mensal || 0)
    }
    for (const gv of gastos) {
      const key = gv.categoria
      costMap[key] = (costMap[key] ?? 0) + Number(gv.valor || 0)
    }

    const costDistribution: CostSlice[] = Object.entries(costMap)
      .map(([name, value]) => ({
        name: CATEGORY_LABELS[name] ?? name,
        value,
        color: COST_COLORS[name] ?? '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value)

    return { chartData, costDistribution }
  }, [
    receitas6mQuery.data,
    gastos6mQuery.data,
    custosFixosQuery.data,
    gastosQuery.data,
    kpis.custosFixos,
    year,
    month,
  ])

  // ── Health status ─────────────────────────────────────────────────
  const { hasData, healthStatus, caixaDropping3m } = React.useMemo(() => {
    const caixaEntries = caixaQuery.data ?? []
    const hasData = kpis.receitaTotal > 0 || kpis.custosFixos > 0 || kpis.custosVariaveis > 0 || kpis.caixaDisponivel > 0
    let healthStatus: HealthStatus = 'saudavel'

    const caixaDropping3m =
      caixaEntries.length >= 3 &&
      Number(caixaEntries[0]?.saldo || 0) < Number(caixaEntries[1]?.saldo || 0) &&
      Number(caixaEntries[1]?.saldo || 0) < Number(caixaEntries[2]?.saldo || 0)

    if (!hasData) {
      healthStatus = 'sem_dados'
    } else if (kpis.runway < 1 || kpis.burnRate > kpis.receitaTotal || caixaDropping3m) {
      healthStatus = 'critico'
    } else if (
      (kpis.runway >= 1 && kpis.runway < 3) ||
      (kpis.resultadoLiquido < 0 && kpis.resultadoLiquido > -(kpis.receitaTotal * 0.1))
    ) {
      healthStatus = 'atencao'
    } else if (kpis.runway >= 3 && kpis.resultadoLiquido >= 0 && kpis.margem >= 30) {
      healthStatus = 'saudavel'
    } else {
      healthStatus = 'atencao'
    }
    
    return { hasData, healthStatus, caixaDropping3m }
  }, [kpis, caixaQuery.data])

  // ── Alerts ────────────────────────────────────────────────────────
  const alerts = React.useMemo(() => {
    const alerts: DashboardAlert[] = []

    if (hasData) {
      if (kpis.runway < 1 && kpis.burnRate > 0) {
        alerts.push({
          id: 'runway-critical',
          type: 'critical',
          priority: 1,
          icon: '🚨',
          title: 'Runway crítico',
          description: `Caixa cobre menos de 1 mês de operação. Runway atual: ${kpis.runway.toFixed(1)} meses.`,
          action: 'Revise custos ou aporte capital',
        })
      } else if (kpis.runway < 3 && kpis.runway >= 1) {
        alerts.push({
          id: 'runway-low',
          type: 'warning',
          priority: 2,
          icon: '⚠️',
          title: 'Runway baixo',
          description: `Runway de ${kpis.runway.toFixed(1)} meses. Recomendado mínimo de 3 meses.`,
          action: 'Avalie redução de custos',
        })
      }

      if (kpis.burnRate > kpis.receitaTotal && kpis.receitaTotal > 0) {
        alerts.push({
          id: 'burn-exceeds-revenue',
          type: 'critical',
          priority: 1,
          icon: '🔥',
          title: 'Burn rate superior à receita',
          description: `Custos totais (${kpis.burnRate.toFixed(0)}) excedem receita (${kpis.receitaTotal.toFixed(0)}).`,
          action: 'Reduza custos ou aumente receita',
        })
      }

      if (caixaDropping3m) {
        alerts.push({
          id: 'cash-declining',
          type: 'critical',
          priority: 1,
          icon: '📉',
          title: 'Caixa em queda por 3 meses',
          description: 'O saldo de caixa está caindo consecutivamente nos últimos 3 registros.',
          action: 'Analise fluxo de caixa urgente',
        })
      }

      if (kpis.resultadoLiquido < 0) {
        alerts.push({
          id: 'negative-result',
          type: 'warning',
          priority: 1,
          icon: '📊',
          title: 'Resultado líquido negativo',
          description: `Prejuízo de R$ ${Math.abs(kpis.resultadoLiquido).toFixed(2)} no período.`,
          action: 'Verifique DRE para detalhes',
        })
      }

      if (kpis.margem < 30 && kpis.margem >= 0 && kpis.receitaTotal > 0) {
        alerts.push({
          id: 'low-margin',
          type: 'warning',
          priority: 2,
          icon: '💹',
          title: 'Margem abaixo do ideal',
          description: `Margem líquida de ${kpis.margem.toFixed(1)}%. Meta: 30%.`,
          action: 'Otimize custos operacionais',
        })
      }

      if (kpis.mrr === 0 && kpis.receitaTotal > 0) {
        alerts.push({
          id: 'no-mrr',
          type: 'info',
          priority: 3,
          icon: '🔄',
          title: 'Sem receita recorrente',
          description: 'Nenhuma receita recorrente identificada este mês.',
          action: 'Considere criar planos mensais',
        })
      }

      alerts.sort((a, b) => a.priority - b.priority)
    }
    return alerts
  }, [hasData, kpis, caixaDropping3m])

  // ── Loading / error ───────────────────────────────────────────────
  const isLoading =
    receitasQuery.isLoading ||
    receitas6mQuery.isLoading ||
    receitasPrevQuery.isLoading ||
    custosFixosQuery.isLoading ||
    gastosQuery.isLoading ||
    gastos6mQuery.isLoading ||
    gastosPrevQuery.isLoading ||
    caixaQuery.isLoading ||
    metasQuery.isLoading

  const error =
    (receitasQuery.error ??
      receitas6mQuery.error ??
      receitasPrevQuery.error ??
      custosFixosQuery.error ??
      gastosQuery.error ??
      gastos6mQuery.error ??
      gastosPrevQuery.error ??
      caixaQuery.error ??
      metasQuery.error) as Error | null

  return {
    kpis,
    variations,
    chartData,
    costDistribution,
    alerts,
    healthStatus,
    isLoading,
    error,
    metas: metasQuery.data ?? [],
  }
}
