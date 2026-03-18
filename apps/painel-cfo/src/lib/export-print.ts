import type { DRELine } from '@/hooks/use-dre'
import type { BalancoMes } from '@/hooks/use-balanco'

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function pctFmt(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Poppins', sans-serif; background: #0A1628; color: #F0F4F8; padding: 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #153B5F; }
  .header h1 { font-size: 24px; font-weight: 700; color: #00C8F0; }
  .header .period { font-size: 14px; color: #94A3B8; }
  .header .brand { font-size: 12px; color: #94A3B8; letter-spacing: 2px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { text-align: left; padding: 10px 12px; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #153B5F; }
  td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #153B5F20; }
  .row-header td { font-weight: 700; font-size: 13px; color: #F0F4F8; background: #131F3580; }
  .row-sub td { padding-left: 28px; color: #94A3B8; font-size: 12px; }
  .row-subtotal td { font-weight: 600; color: #00C8F0; border-top: 1px solid #153B5F; }
  .row-total td { font-weight: 700; font-size: 14px; border-top: 2px solid #00C8F0; }
  .row-separator td { height: 8px; border: none; }
  .positive { color: #10B981; }
  .negative { color: #EF4444; }
  .text-right { text-align: right; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .kpi-card { background: #131F35; border: 1px solid #153B5F; border-radius: 12px; padding: 20px; }
  .kpi-label { font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .kpi-value { font-size: 24px; font-weight: 700; color: #F0F4F8; }
  .kpi-sub { font-size: 11px; color: #94A3B8; margin-top: 4px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #153B5F; font-size: 10px; color: #94A3B8; text-align: center; }
  @media print {
    body { background: white; color: #1a1a1a; padding: 20px; }
    .header h1 { color: #0A1628; }
    .header .period, .header .brand { color: #666; }
    th { color: #666; border-bottom-color: #ddd; }
    td { border-bottom-color: #eee; color: #333; }
    .row-header td { background: #f5f5f5; color: #1a1a1a; }
    .row-sub td { color: #666; }
    .row-subtotal td { color: #0A1628; border-top-color: #ddd; }
    .row-total td { border-top-color: #0A1628; color: #0A1628; }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .kpi-card { background: #f8f8f8; border-color: #ddd; }
    .kpi-label { color: #666; }
    .kpi-value { color: #1a1a1a; }
    .kpi-sub { color: #666; }
    .footer { color: #999; border-top-color: #ddd; }
  }
`

function wrapHTML(title: string, period: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} — Gradios</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${title}</h1>
      <div class="period">${period}</div>
    </div>
    <div class="brand">Gradios</div>
  </div>
  ${content}
  <div class="footer">
    Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — Painel CFO Gradios
  </div>
</body>
</html>`
}

export function openPrintWindow(htmlContent: string): void {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(htmlContent)
  win.document.close()
  // Wait for fonts to load before printing
  setTimeout(() => win.print(), 800)
}

export function buildDREReportHTML(lines: DRELine[], month: number, year: number): string {
  const period = `${MONTH_NAMES[month - 1]} ${year}`

  let tableRows = ''
  for (const line of lines) {
    if (line.type === 'separator') {
      tableRows += '<tr class="row-separator"><td colspan="4"></td></tr>'
      continue
    }
    const valueClass = line.month >= 0 ? 'positive' : 'negative'
    const rowClass = `row-${line.type}`
    tableRows += `<tr class="${rowClass}">
      <td>${line.label}</td>
      <td class="text-right ${valueClass}">${fmt(line.month)}</td>
      <td class="text-right">${line.percent.toFixed(1)}%</td>
      <td class="text-right ${line.ytd >= 0 ? 'positive' : 'negative'}">${fmt(line.ytd)}</td>
    </tr>`
  }

  const content = `
    <table>
      <thead>
        <tr>
          <th>Conta</th>
          <th class="text-right">Mês Atual</th>
          <th class="text-right">% Receita</th>
          <th class="text-right">Acumulado (YTD)</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `

  return wrapHTML('DRE — Demonstrativo de Resultado', period, content)
}

export function buildBalancoReportHTML(meses: BalancoMes[], year: number): string {
  const period = `Ano Fiscal ${year}`
  const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const totalEntradas = meses.reduce((s, m) => s + m.entradas, 0)
  const totalSaidas = meses.reduce((s, m) => s + m.saidas, 0)
  const totalSaldo = totalEntradas - totalSaidas

  let tableRows = ''
  for (const m of meses) {
    const saldoClass = m.saldo >= 0 ? 'positive' : 'negative'
    tableRows += `<tr>
      <td style="font-weight:600">${monthLabels[m.mes - 1]}/${year}</td>
      <td class="text-right positive">${fmt(m.entradas)}</td>
      <td class="text-right negative">${fmt(m.saidas)}</td>
      <td class="text-right">${fmt(m.custosFixos)}</td>
      <td class="text-right">${fmt(m.gastosVariaveis)}</td>
      <td class="text-right ${saldoClass}" style="font-weight:600">${fmt(m.saldo)}</td>
    </tr>`
  }

  tableRows += `<tr class="row-total">
    <td>TOTAL ${year}</td>
    <td class="text-right positive">${fmt(totalEntradas)}</td>
    <td class="text-right negative">${fmt(totalSaidas)}</td>
    <td class="text-right">—</td>
    <td class="text-right">—</td>
    <td class="text-right ${totalSaldo >= 0 ? 'positive' : 'negative'}">${fmt(totalSaldo)}</td>
  </tr>`

  const content = `
    <table>
      <thead>
        <tr>
          <th>Mês</th>
          <th class="text-right">Entradas</th>
          <th class="text-right">Saídas</th>
          <th class="text-right">Custos Fixos</th>
          <th class="text-right">Gastos Var.</th>
          <th class="text-right">Saldo</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `

  return wrapHTML('Balanço Anual', period, content)
}

interface MonthlyReportData {
  receitaBruta: number
  mrr: number
  resultadoLiquido: number
  margemLiquida: number
  burnRate: number
  runway: number
  caixa: number
  dreLines: DRELine[]
}

export function buildMonthlyReportHTML(data: MonthlyReportData, month: number, year: number): string {
  const period = `${MONTH_NAMES[month - 1]} ${year}`

  const kpis = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Receita Bruta</div>
        <div class="kpi-value">${fmt(data.receitaBruta)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">MRR</div>
        <div class="kpi-value">${fmt(data.mrr)}</div>
        <div class="kpi-sub">Receita recorrente mensal</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Resultado Líquido</div>
        <div class="kpi-value ${data.resultadoLiquido >= 0 ? 'positive' : 'negative'}">${fmt(data.resultadoLiquido)}</div>
        <div class="kpi-sub">Margem: ${pctFmt(data.margemLiquida)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Caixa Disponível</div>
        <div class="kpi-value">${fmt(data.caixa)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Burn Rate</div>
        <div class="kpi-value negative">${fmt(data.burnRate)}</div>
        <div class="kpi-sub">Gasto mensal total</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Runway</div>
        <div class="kpi-value">${data.runway.toFixed(1)} meses</div>
        <div class="kpi-sub">${data.runway >= 6 ? 'Saudável' : data.runway >= 3 ? 'Atenção' : 'Crítico'}</div>
      </div>
    </div>
  `

  // Mini DRE table
  const keyLines = data.dreLines.filter(l =>
    l.type === 'header' || l.type === 'subtotal' || l.type === 'total'
  )
  let dreTable = ''
  for (const line of keyLines) {
    const cls = line.type === 'total' ? 'row-total' : line.type === 'subtotal' ? 'row-subtotal' : 'row-header'
    const valCls = line.month >= 0 ? 'positive' : 'negative'
    dreTable += `<tr class="${cls}">
      <td>${line.label}</td>
      <td class="text-right ${valCls}">${fmt(line.month)}</td>
      <td class="text-right">${line.percent.toFixed(1)}%</td>
    </tr>`
  }

  const content = `
    <h2 style="font-size:16px;color:#00C8F0;margin-bottom:16px;">Indicadores-Chave</h2>
    ${kpis}
    <h2 style="font-size:16px;color:#00C8F0;margin-bottom:16px;margin-top:32px;">DRE Resumida</h2>
    <table>
      <thead>
        <tr>
          <th>Conta</th>
          <th class="text-right">Valor</th>
          <th class="text-right">% Receita</th>
        </tr>
      </thead>
      <tbody>${dreTable}</tbody>
    </table>
  `

  return wrapHTML('Relatório Mensal', period, content)
}
