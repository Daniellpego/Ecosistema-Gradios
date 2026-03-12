/* ============================================
   BG Tech CRM — Analytics View
   ============================================ */

import { fetchAnalytics, fetchPipelineStats } from '../db.js';

export async function renderAnalytics(container, ctx) {
  container.innerHTML = `
    <div class="view">
      <div class="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Métricas e insights do seu funil de vendas</p>
        </div>
      </div>
      <div class="stats-grid">
        ${Array(4).fill('<div class="stat-card"><div class="loading-skeleton" style="height:20px;width:80px;margin-bottom:8px"></div><div class="loading-skeleton" style="height:32px;width:120px"></div></div>').join('')}
      </div>
      <div class="analytics-grid">
        ${Array(4).fill('<div class="chart-container"><div class="loading-skeleton" style="height:200px"></div></div>').join('')}
      </div>
    </div>`;

  try {
    const [analytics, pipelineStats] = await Promise.all([
      fetchAnalytics(),
      fetchPipelineStats(),
    ]);

    const { leadsByOrigin, monthlyRevenue, winRate, totalDeals, wonDeals, lostDeals } = analytics;
    const { totalLeads, totalValue, conversionRate } = pipelineStats;

    container.innerHTML = `
      <div class="view">
        <div class="page-header">
          <div>
            <h1>Analytics</h1>
            <p>Métricas e insights do seu funil de vendas</p>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-cyan">
            <div class="stat-label">Total de Leads</div>
            <div class="stat-value">${totalLeads}</div>
          </div>
          <div class="stat-card stat-green">
            <div class="stat-label">Deals Ganhos</div>
            <div class="stat-value">${wonDeals}</div>
          </div>
          <div class="stat-card stat-amber">
            <div class="stat-label">Win Rate</div>
            <div class="stat-value">${winRate.toFixed(1)}%</div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-label">Valor no Pipeline</div>
            <div class="stat-value">${ctx.formatCurrency(totalValue)}</div>
          </div>
        </div>

        <div class="analytics-grid">
          <!-- Leads by Origin -->
          <div class="chart-container">
            <div class="chart-title">Leads por Origem</div>
            ${renderOriginChart(leadsByOrigin)}
          </div>

          <!-- Conversion Funnel -->
          <div class="chart-container">
            <div class="chart-title">Funil de Conversão</div>
            ${renderFunnel(pipelineStats)}
          </div>

          <!-- Monthly Revenue -->
          <div class="chart-container">
            <div class="chart-title">Receita Mensal (Deals Ganhos)</div>
            ${renderMonthlyChart(monthlyRevenue, ctx)}
          </div>

          <!-- Win Rate Ring -->
          <div class="chart-container" style="display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div class="chart-title" style="align-self:flex-start;width:100%">Taxa de Vitória</div>
            ${renderWinRateRing(winRate, wonDeals, lostDeals, totalDeals)}
          </div>
        </div>
      </div>`;

  } catch (err) {
    console.error('[analytics] render error:', err);
    container.innerHTML = `
      <div class="view">
        <div class="page-header"><div><h1>Analytics</h1></div></div>
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>Erro ao carregar analytics. Verifique sua conexão.</p>
          <button class="btn btn-ghost btn-sm" onclick="location.reload()">Tentar novamente</button>
        </div>
      </div>`;
  }
}

/* ─── Chart Renderers ─── */

function renderOriginChart(leadsByOrigin) {
  const entries = Object.entries(leadsByOrigin).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) {
    return '<p style="color:var(--text-muted);font-size:0.875rem;text-align:center;padding:2rem 0">Sem dados de leads</p>';
  }

  const max = Math.max(...entries.map(([, v]) => v));
  const colors = ['var(--cyan)', 'var(--green)', 'var(--amber)', 'var(--purple)', '#EC4899', '#3B82F6', 'var(--red)', '#06B6D4', '#8B5CF6', '#F97316'];

  return `
    <div class="bar-chart">
      ${entries.map(([origin, count], i) => {
        const pct = max > 0 ? (count / max * 100) : 0;
        const color = colors[i % colors.length];
        return `
          <div class="bar-chart-row">
            <div class="bar-chart-label">${escapeHtml(origin)}</div>
            <div class="bar-chart-track">
              <div class="bar-chart-fill" style="width:${pct}%;background:${color}">${count}</div>
            </div>
            <div class="bar-chart-value">${count}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderFunnel(pipelineStats) {
  const stages = [
    { key: 'novo',        label: 'Novo',        color: 'rgba(0,200,240,0.7)' },
    { key: 'contatado',   label: 'Contatado',   color: 'rgba(167,139,250,0.7)' },
    { key: 'qualificado', label: 'Qualificado', color: 'rgba(245,158,11,0.7)' },
    { key: 'proposta',    label: 'Proposta',    color: 'rgba(59,130,246,0.7)' },
    { key: 'negociacao',  label: 'Negociação',  color: 'rgba(236,72,153,0.7)' },
    { key: 'fechado',     label: 'Fechado',     color: 'rgba(16,185,129,0.7)' },
  ];

  const total = pipelineStats.totalLeads || 1;

  return `
    <div class="funnel">
      ${stages.map((s, i) => {
        const count = pipelineStats.byStatus[s.key]?.count || 0;
        const widthPct = Math.max(20, 100 - (i * 13));
        return `
          <div class="funnel-step" style="width:${widthPct}%;background:${s.color}">
            <span class="funnel-step-label">${s.label}</span>
            <span class="funnel-step-count">(${count})</span>
          </div>`;
      }).join('')}
    </div>`;
}

function renderMonthlyChart(monthlyRevenue, ctx) {
  if (monthlyRevenue.length === 0) {
    return '<p style="color:var(--text-muted);font-size:0.875rem;text-align:center;padding:2rem 0">Sem dados de receita</p>';
  }

  const max = Math.max(...monthlyRevenue.map(m => m.value));

  const monthNames = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
  };

  return `
    <div style="display:flex;align-items:flex-end;gap:0.75rem;height:180px;padding-top:1rem">
      ${monthlyRevenue.map(m => {
        const heightPct = max > 0 ? (m.value / max * 100) : 0;
        const monthLabel = monthNames[m.month.substring(5, 7)] || m.month.substring(5, 7);
        const year = m.month.substring(2, 4);
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0.375rem">
            <span style="font-size:0.6875rem;color:var(--green);font-weight:600">${ctx.formatCurrency(m.value)}</span>
            <div style="width:100%;height:${Math.max(4, heightPct)}%;background:var(--green);border-radius:4px 4px 0 0;min-height:4px;transition:height 0.6s ease"></div>
            <span style="font-size:0.6875rem;color:var(--text-muted)">${monthLabel}/${year}</span>
          </div>`;
      }).join('')}
    </div>`;
}

function renderWinRateRing(winRate, wonDeals, lostDeals, totalDeals) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100 * circumference);
  const openDeals = totalDeals - wonDeals - lostDeals;

  return `
    <div style="display:flex;align-items:center;gap:2rem;padding:1rem 0;flex-wrap:wrap;justify-content:center">
      <div class="percentage-ring">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="${radius}" stroke="var(--bg-elevated)" stroke-width="10" fill="none"/>
          <circle cx="75" cy="75" r="${radius}" stroke="var(--green)" stroke-width="10" fill="none"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" style="transition:stroke-dashoffset 1s ease"/>
        </svg>
        <div class="ring-label">
          <span class="ring-value">${winRate.toFixed(0)}%</span>
          <span class="ring-text">Win Rate</span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:12px;height:12px;border-radius:50%;background:var(--green)"></div>
          <span style="font-size:0.8125rem;color:var(--text-secondary)">Ganhos: <strong style="color:var(--text-primary)">${wonDeals}</strong></span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:12px;height:12px;border-radius:50%;background:var(--red)"></div>
          <span style="font-size:0.8125rem;color:var(--text-secondary)">Perdidos: <strong style="color:var(--text-primary)">${lostDeals}</strong></span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:12px;height:12px;border-radius:50%;background:var(--cyan)"></div>
          <span style="font-size:0.8125rem;color:var(--text-secondary)">Em aberto: <strong style="color:var(--text-primary)">${openDeals}</strong></span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:12px;height:12px;border-radius:50%;background:var(--text-muted)"></div>
          <span style="font-size:0.8125rem;color:var(--text-secondary)">Total: <strong style="color:var(--text-primary)">${totalDeals}</strong></span>
        </div>
      </div>
    </div>`;
}

/* ─── Helpers ─── */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
