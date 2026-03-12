/* ═══════════════════════════════════════════════════
   BG Tech — Timeline / Gantt View
   ═══════════════════════════════════════════════════ */

import { fetchProjetos } from '../db.js';

/* ── Helpers ── */
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

const STATUS_COLORS = {
  planejamento: 'status-planejamento',
  em_andamento: 'status-em_andamento',
  entregue:     'status-entregue',
  atrasado:     'status-atrasado',
  cancelado:    'status-cancelado',
};

const STATUS_LABELS = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  entregue:     'Entregue',
  atrasado:     'Atrasado',
  cancelado:    'Cancelado',
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* ── Main render ── */
export async function renderTimeline() {
  let projetos = [];
  try { projetos = await fetchProjetos(); } catch (e) { console.warn('[timeline]', e); }

  // Filter projects that have date ranges
  const withDates = projetos.filter(p => p.data_inicio && p.data_entrega);
  const noDates = projetos.filter(p => !p.data_inicio || !p.data_entrega);

  if (withDates.length === 0) {
    return `
      <div class="fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">Timeline</h1>
            <p class="page-subtitle">Visão temporal dos projetos</p>
          </div>
        </div>
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="3" y1="12" x2="21" y2="12"/><polyline points="8 6 3 12 8 18"/>
            <line x1="9" y1="6" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="18"/>
          </svg>
          <h3>Nenhum projeto com datas</h3>
          <p>Adicione data de início e entrega aos projetos para visualizar a timeline.</p>
        </div>
        ${noDates.length > 0 ? `<p style="text-align:center;font-size:0.82rem;color:var(--text-muted);margin-top:1rem">${noDates.length} projeto(s) sem datas definidas</p>` : ''}
      </div>`;
  }

  // Calculate date range for the timeline
  const allStarts = withDates.map(p => new Date(p.data_inicio));
  const allEnds   = withDates.map(p => new Date(p.data_entrega));
  const minDate   = new Date(Math.min(...allStarts));
  const maxDate   = new Date(Math.max(...allEnds));

  // Extend range to full months
  const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const endMonth   = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

  // Generate months array
  const months = [];
  const cur = new Date(startMonth);
  while (cur <= endMonth) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth(), label: `${MONTH_NAMES[cur.getMonth()]} ${cur.getFullYear()}` });
    cur.setMonth(cur.getMonth() + 1);
  }

  // Calculate total days in range
  const totalDays = Math.max(1, Math.ceil((endMonth - startMonth) / (1000 * 60 * 60 * 24)));
  const LABEL_WIDTH = 200;
  const DAY_WIDTH = Math.max(3, Math.min(12, 900 / totalDays)); // adaptive
  const CHART_WIDTH = totalDays * DAY_WIDTH;
  const TOTAL_WIDTH = LABEL_WIDTH + CHART_WIDTH;

  // Today marker position
  const today = new Date();
  const todayOffset = Math.ceil((today - startMonth) / (1000 * 60 * 60 * 24));
  const todayLeft = LABEL_WIDTH + todayOffset * DAY_WIDTH;
  const showToday = todayOffset >= 0 && todayOffset <= totalDays;

  // Month header positions
  const monthHeaders = months.map(m => {
    const mStart = new Date(m.year, m.month, 1);
    const mEnd   = new Date(m.year, m.month + 1, 0);
    const daysInMonth = mEnd.getDate();
    const offset = Math.max(0, Math.ceil((mStart - startMonth) / (1000 * 60 * 60 * 24)));
    return {
      ...m,
      left: LABEL_WIDTH + offset * DAY_WIDTH,
      width: daysInMonth * DAY_WIDTH,
    };
  });

  // Project bars
  const rows = withDates.map(p => {
    const pStart = new Date(p.data_inicio);
    const pEnd   = new Date(p.data_entrega);
    const startDay = Math.max(0, Math.ceil((pStart - startMonth) / (1000 * 60 * 60 * 24)));
    const endDay   = Math.ceil((pEnd - startMonth) / (1000 * 60 * 60 * 24));
    const barLeft  = LABEL_WIDTH + startDay * DAY_WIDTH;
    const barWidth = Math.max(DAY_WIDTH, (endDay - startDay) * DAY_WIDTH);
    return { ...p, barLeft, barWidth };
  });

  // Grid lines (one per month boundary)
  const gridLines = monthHeaders.map(m => m.left);

  // Legend
  const legendItems = Object.entries(STATUS_LABELS).map(([key, label]) => `
    <span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.75rem;color:var(--text-secondary)">
      <span style="width:10px;height:10px;border-radius:3px" class="timeline-bar ${STATUS_COLORS[key]}"></span>
      ${label}
    </span>`).join('');

  return `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Timeline</h1>
          <p class="page-subtitle">${withDates.length} projeto(s) com datas${noDates.length > 0 ? ` · ${noDates.length} sem datas` : ''}</p>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem">${legendItems}</div>

      <div class="card" style="padding:0;overflow:hidden">
        <div class="timeline-container">
          <div style="position:relative;min-width:${TOTAL_WIDTH}px">

            <!-- Month headers -->
            <div class="timeline-header" style="min-width:${TOTAL_WIDTH}px">
              <div style="width:${LABEL_WIDTH}px;flex-shrink:0;padding:0.65rem 0.75rem;font-size:0.78rem;font-weight:600;color:var(--text-muted);border-right:1px solid var(--border)">Projeto</div>
              ${monthHeaders.map(m =>
                `<div class="timeline-month" style="width:${m.width}px">${m.label}</div>`
              ).join('')}
            </div>

            <!-- Body -->
            <div class="timeline-body" style="min-width:${TOTAL_WIDTH}px">

              <!-- Grid lines -->
              ${gridLines.map(x => `<div class="timeline-grid-line" style="left:${x}px"></div>`).join('')}

              <!-- Today marker -->
              ${showToday ? `<div class="timeline-today" style="left:${todayLeft}px"></div>` : ''}

              <!-- Project rows -->
              ${rows.map((p, i) => `
                <div class="timeline-row" style="animation-delay:${i * 40}ms">
                  <div class="timeline-row-label" title="${esc(p.titulo)}">${esc(p.titulo)}</div>
                  <div class="timeline-bar ${STATUS_COLORS[p.status] || 'status-planejamento'}"
                       style="left:${p.barLeft}px;width:${p.barWidth}px"
                       title="${esc(p.titulo)} — ${new Date(p.data_inicio).toLocaleDateString('pt-BR')} → ${new Date(p.data_entrega).toLocaleDateString('pt-BR')}">
                    ${p.barWidth > 80 ? esc(p.titulo) : ''}
                  </div>
                </div>`).join('')}

            </div>
          </div>
        </div>
      </div>
    </div>`;
}
