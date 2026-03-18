/* ============================================
   Gradios CRM — Deals View
   ============================================ */

import { fetchDeals, upsertDeal, deleteDeal, fetchLeads } from '../db.js';

const DEAL_STATUSES = [
  { value: 'aberto',  label: 'Aberto' },
  { value: 'ganho',   label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
];

export async function renderDeals(container, ctx) {
  container.innerHTML = `
    <div class="view">
      <div class="page-header">
        <div>
          <h1>Deals</h1>
          <p>Gerencie suas negociações e oportunidades</p>
        </div>
        <button class="btn btn-primary" id="btn-add-deal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Deal
        </button>
      </div>

      <div class="filter-bar">
        <div class="search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="deals-search" placeholder="Buscar por título...">
        </div>
        <select id="deals-filter-status">
          <option value="todos">Todos os Status</option>
          ${DEAL_STATUSES.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
        </select>
      </div>

      <div id="deals-content">
        <div style="padding:2rem;text-align:center">
          <div class="loading-skeleton" style="height:120px;margin-bottom:12px;border-radius:12px"></div>
          <div class="loading-skeleton" style="height:120px;margin-bottom:12px;border-radius:12px"></div>
        </div>
      </div>
    </div>`;

  const searchInput  = container.querySelector('#deals-search');
  const statusFilter = container.querySelector('#deals-filter-status');
  const btnAddDeal   = container.querySelector('#btn-add-deal');
  const dealsContent = container.querySelector('#deals-content');

  let filters = { status: 'todos', search: '' };
  let debounceTimer;

  async function loadAndRender() {
    const deals = await fetchDeals(filters);
    renderDealsGrid(deals, dealsContent, ctx, loadAndRender);
  }

  searchInput.addEventListener('input', (e) => {
    filters.search = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadAndRender, 300);
  });

  statusFilter.addEventListener('change', (e) => {
    filters.status = e.target.value;
    loadAndRender();
  });

  btnAddDeal.addEventListener('click', () => {
    openDealModal(null, ctx, loadAndRender);
  });

  await loadAndRender();
}

function renderDealsGrid(deals, wrapper, ctx, reload) {
  if (deals.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <p>Nenhum deal encontrado</p>
      </div>`;
    return;
  }

  // Stats
  const totalValue = deals.reduce((s, d) => s + (Number(d.valor) || 0), 0);
  const openDeals = deals.filter(d => d.status === 'aberto');
  const wonDeals = deals.filter(d => d.status === 'ganho');
  const wonValue = wonDeals.reduce((s, d) => s + (Number(d.valor) || 0), 0);

  wrapper.innerHTML = `
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card stat-cyan">
        <div class="stat-label">Total de Deals</div>
        <div class="stat-value">${deals.length}</div>
      </div>
      <div class="stat-card stat-green">
        <div class="stat-label">Valor Total</div>
        <div class="stat-value">${ctx.formatCurrency(totalValue)}</div>
      </div>
      <div class="stat-card stat-amber">
        <div class="stat-label">Em Aberto</div>
        <div class="stat-value">${openDeals.length}</div>
      </div>
      <div class="stat-card stat-purple">
        <div class="stat-label">Receita Ganha</div>
        <div class="stat-value">${ctx.formatCurrency(wonValue)}</div>
      </div>
    </div>

    <div class="deals-grid">
      ${deals.map(deal => {
        const leadName = deal.leads?.nome || '—';
        const leadCompany = deal.leads?.empresa || '';
        const statusClass = deal.status === 'ganho' ? 'badge-ganho' : deal.status === 'perdido' ? 'badge-perdido' : 'badge-aberto';

        return `
          <div class="deal-card" data-id="${deal.id}">
            <div class="deal-card-header">
              <div>
                <div class="deal-card-title">${escapeHtml(deal.titulo || 'Sem título')}</div>
                <div class="deal-card-company">${escapeHtml(leadName)}${leadCompany ? ' — ' + escapeHtml(leadCompany) : ''}</div>
              </div>
              <span class="badge ${statusClass}">${statusLabel(deal.status)}</span>
            </div>
            <div class="deal-card-value">${ctx.formatCurrency(deal.valor)}</div>
            <div class="deal-card-meta">
              <span style="font-size:0.75rem;color:var(--text-muted)">${ctx.formatDate(deal.created_at)}</span>
              <div class="deal-card-actions">
                ${deal.status === 'aberto' ? `
                  <button class="btn btn-sm btn-success btn-mark-won" data-id="${deal.id}" title="Marcar como Ganho">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Ganho
                  </button>
                  <button class="btn btn-sm btn-danger btn-mark-lost" data-id="${deal.id}" title="Marcar como Perdido">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Perdido
                  </button>
                ` : ''}
                <button class="btn-icon btn-edit-deal" data-id="${deal.id}" title="Editar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-delete-deal" data-id="${deal.id}" title="Excluir" style="color:var(--red)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;

  // Mark as won
  wrapper.querySelectorAll('.btn-mark-won').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const deal = deals.find(d => d.id === btn.dataset.id);
      if (!deal) return;

      const { error } = await upsertDeal({
        id: deal.id,
        status: 'ganho',
        closed_at: new Date().toISOString(),
      });

      if (error) {
        ctx.toast('Erro ao atualizar deal', 'error');
      } else {
        showDealWonAnimation(deal, ctx);
        ctx.toast('Deal marcado como Ganho!', 'success');
        setTimeout(reload, 1500);
      }
    });
  });

  // Mark as lost
  wrapper.querySelectorAll('.btn-mark-lost').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const deal = deals.find(d => d.id === btn.dataset.id);
      if (!deal) return;
      if (!confirm('Marcar este deal como perdido?')) return;

      const { error } = await upsertDeal({
        id: deal.id,
        status: 'perdido',
        closed_at: new Date().toISOString(),
      });

      if (error) {
        ctx.toast('Erro ao atualizar deal', 'error');
      } else {
        ctx.toast('Deal marcado como Perdido', 'warning');
        reload();
      }
    });
  });

  // Edit
  wrapper.querySelectorAll('.btn-edit-deal').forEach(btn => {
    btn.addEventListener('click', () => {
      const deal = deals.find(d => d.id === btn.dataset.id);
      if (deal) openDealModal(deal, ctx, reload);
    });
  });

  // Delete
  wrapper.querySelectorAll('.btn-delete-deal').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja excluir este deal?')) return;
      const { error } = await deleteDeal(btn.dataset.id);
      if (error) {
        ctx.toast('Erro ao excluir deal', 'error');
      } else {
        ctx.toast('Deal excluído', 'success');
        reload();
      }
    });
  });
}

async function openDealModal(deal, ctx, onSave) {
  const isEdit = !!deal;
  const title = isEdit ? 'Editar Deal' : 'Novo Deal';

  // Fetch qualified leads for selection
  const leads = await fetchLeads({ status: 'todos' });
  const qualifiedLeads = leads.filter(l =>
    ['qualificado', 'proposta', 'negociacao', 'fechado'].includes(l.status)
  );

  ctx.openModal(`
    <div class="modal-header">
      <h2>${title}</h2>
      <button class="btn-icon modal-close-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form id="deal-form" class="modal-body">
      <div class="form-group">
        <label for="deal-titulo">Título *</label>
        <input type="text" id="deal-titulo" class="form-control" value="${escapeAttr(deal?.titulo || '')}" required>
      </div>
      <div class="form-group">
        <label for="deal-lead">Lead Associado</label>
        <select id="deal-lead" class="form-control">
          <option value="">Nenhum</option>
          ${leads.map(l => `<option value="${l.id}" ${deal?.lead_id === l.id ? 'selected' : ''}>${escapeHtml(l.nome)}${l.empresa ? ' (' + escapeHtml(l.empresa) + ')' : ''}</option>`).join('')}
        </select>
        ${qualifiedLeads.length > 0 ? '' : '<small style="color:var(--text-muted);font-size:0.75rem">Qualifique leads no pipeline para associar a deals</small>'}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="deal-valor">Valor (R$)</label>
          <input type="number" id="deal-valor" class="form-control" step="0.01" min="0" value="${deal?.valor || ''}">
        </div>
        <div class="form-group">
          <label for="deal-status">Status</label>
          <select id="deal-status" class="form-control">
            ${DEAL_STATUSES.map(s => `<option value="${s.value}" ${(deal?.status || 'aberto') === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="deal-notas">Notas</label>
        <textarea id="deal-notas" class="form-control" rows="3">${escapeHtml(deal?.notas || '')}</textarea>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-ghost modal-cancel-btn">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-deal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        ${isEdit ? 'Salvar' : 'Criar Deal'}
      </button>
    </div>
  `);

  document.querySelector('.modal-close-btn')?.addEventListener('click', ctx.closeModal);
  document.querySelector('.modal-cancel-btn')?.addEventListener('click', ctx.closeModal);

  document.querySelector('#btn-save-deal')?.addEventListener('click', async () => {
    const titulo = document.querySelector('#deal-titulo').value.trim();
    if (!titulo) {
      ctx.toast('Título é obrigatório', 'warning');
      return;
    }

    const newStatus = document.querySelector('#deal-status').value;
    const payload = {
      titulo,
      lead_id: document.querySelector('#deal-lead').value || null,
      valor:   parseFloat(document.querySelector('#deal-valor').value) || 0,
      status:  newStatus,
      notas:   document.querySelector('#deal-notas').value.trim() || null,
    };

    // Set closed_at when status changes to ganho/perdido
    if (newStatus === 'ganho' || newStatus === 'perdido') {
      if (!deal?.closed_at) payload.closed_at = new Date().toISOString();
    } else {
      payload.closed_at = null;
    }

    if (isEdit) payload.id = deal.id;

    const { data, error } = await upsertDeal(payload);
    if (error) {
      ctx.toast(`Erro: ${error.message}`, 'error');
    } else {
      // If newly marked as won, show animation
      if (newStatus === 'ganho' && deal?.status !== 'ganho') {
        showDealWonAnimation({ ...payload, ...data }, ctx);
      }
      ctx.toast(isEdit ? 'Deal atualizado!' : 'Deal criado!', 'success');
      ctx.closeModal();
      if (onSave) setTimeout(onSave, newStatus === 'ganho' && deal?.status !== 'ganho' ? 1500 : 100);
    }
  });
}

/* ─── Deal Won Animation ─── */
function showDealWonAnimation(deal, ctx) {
  const overlay = document.createElement('div');
  overlay.className = 'deal-won-overlay';
  overlay.innerHTML = `
    <div class="deal-won-content">
      <div class="deal-won-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2>Deal Fechado!</h2>
      <p>${escapeHtml(deal.titulo || '')} — ${ctx.formatCurrency(deal.valor)}</p>
    </div>`;
  document.body.appendChild(overlay);

  // Confetti particles
  const colors = ['#10B981', '#00C8F0', '#F59E0B', '#A78BFA', '#EC4899'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = (50 + Math.random() * 30) + 'vh';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDelay = (Math.random() * 0.5) + 's';
    particle.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
  }

  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }, 2500);
}

/* ─── Helpers ─── */
function statusLabel(status) {
  const map = { aberto: 'Aberto', ganho: 'Ganho', perdido: 'Perdido' };
  return map[status] || status || 'Aberto';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
