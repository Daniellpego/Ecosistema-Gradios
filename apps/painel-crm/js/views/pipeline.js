/* ============================================
   Gradios CRM — Pipeline View (Kanban)
   ============================================ */

import { fetchLeads, fetchPipelineStats } from '../db.js';

const STATUSES = [
  { key: 'novo',        label: 'Novo',        color: 'var(--cyan)' },
  { key: 'contatado',   label: 'Contatado',   color: 'var(--purple)' },
  { key: 'qualificado', label: 'Qualificado', color: 'var(--amber)' },
  { key: 'proposta',    label: 'Proposta',    color: '#3B82F6' },
  { key: 'negociacao',  label: 'Negociação',  color: '#EC4899' },
  { key: 'fechado',     label: 'Fechado',     color: 'var(--green)' },
];

export async function renderPipeline(container, ctx) {
  // Show loading
  container.innerHTML = `
    <div class="view">
      <div class="page-header">
        <div>
          <h1>Pipeline</h1>
          <p>Visualize seus leads por etapa do funil</p>
        </div>
      </div>
      <div class="stats-grid">
        ${Array(4).fill('<div class="stat-card"><div class="loading-skeleton" style="height:20px;width:80px;margin-bottom:8px"></div><div class="loading-skeleton" style="height:32px;width:120px"></div></div>').join('')}
      </div>
      <div class="kanban-board">
        ${STATUSES.map(() => '<div class="kanban-column"><div class="loading-skeleton" style="height:100%;min-height:300px"></div></div>').join('')}
      </div>
    </div>`;

  try {
    const [stats, leads] = await Promise.all([
      fetchPipelineStats(),
      fetchLeads(),
    ]);

    const leadsByStatus = {};
    for (const s of STATUSES) leadsByStatus[s.key] = [];
    for (const lead of leads) {
      const status = lead.status || 'novo';
      if (leadsByStatus[status]) leadsByStatus[status].push(lead);
      else leadsByStatus['novo'].push(lead);
    }

    container.innerHTML = `
      <div class="view">
        <div class="page-header">
          <div>
            <h1>Pipeline</h1>
            <p>Visualize seus leads por etapa do funil</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card stat-cyan">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div class="stat-label">Total de Leads</div>
                <div class="stat-value">${stats.totalLeads}</div>
              </div>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              </div>
            </div>
          </div>

          <div class="stat-card stat-green">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div class="stat-label">Valor Total</div>
                <div class="stat-value">${ctx.formatCurrency(stats.totalValue)}</div>
              </div>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
          </div>

          <div class="stat-card stat-amber">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div class="stat-label">Taxa de Conversão</div>
                <div class="stat-value">${stats.conversionRate.toFixed(1)}%</div>
              </div>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
            </div>
          </div>

          <div class="stat-card stat-purple">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div class="stat-label">Em Negociação</div>
                <div class="stat-value">${(stats.byStatus['negociacao']?.count || 0) + (stats.byStatus['proposta']?.count || 0)}</div>
              </div>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div class="kanban-board">
          ${STATUSES.map(s => {
            const items = leadsByStatus[s.key] || [];
            return `
              <div class="kanban-column" data-status="${s.key}">
                <div class="kanban-column-header">
                  <div class="kanban-column-title">
                    <span>${s.label}</span>
                    <span class="kanban-column-count">${items.length}</span>
                  </div>
                </div>
                <div class="kanban-column-body">
                  ${items.length === 0
                    ? '<div class="empty-state" style="padding:1.5rem 0.5rem"><p style="font-size:0.75rem;color:var(--text-muted)">Nenhum lead</p></div>'
                    : items.map(lead => `
                      <div class="kanban-card" data-id="${lead.id}" title="Clique para ver detalhes">
                        <div class="kanban-card-name">${escapeHtml(lead.nome || 'Sem nome')}</div>
                        <div class="kanban-card-company">${escapeHtml(lead.empresa || '—')}</div>
                        <div class="kanban-card-footer">
                          <span class="kanban-card-value">${ctx.formatCurrency(lead.valor_estimado)}</span>
                          <span class="kanban-card-date">${ctx.formatDate(lead.created_at)}</span>
                        </div>
                      </div>
                    `).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    // Kanban card click -> navigate to leads
    container.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('click', () => {
        ctx.navigateTo('leads');
      });
    });

  } catch (err) {
    console.error('[pipeline] render error:', err);
    container.innerHTML = `
      <div class="view">
        <div class="page-header"><div><h1>Pipeline</h1></div></div>
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>Erro ao carregar pipeline. Verifique sua conexão.</p>
          <button class="btn btn-ghost btn-sm" onclick="location.reload()">Tentar novamente</button>
        </div>
      </div>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
