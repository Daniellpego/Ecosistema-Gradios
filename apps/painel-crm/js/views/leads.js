/* ============================================
   Gradios CRM — Leads View
   ============================================ */

import { fetchLeads, upsertLead, deleteLead } from '../db.js';

const STATUS_OPTIONS = [
  { value: 'novo',        label: 'Novo' },
  { value: 'contatado',   label: 'Contatado' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'proposta',    label: 'Proposta' },
  { value: 'negociacao',  label: 'Negociação' },
  { value: 'fechado',     label: 'Fechado' },
  { value: 'perdido',     label: 'Perdido' },
];

const ORIGEM_OPTIONS = [
  'Site', 'Google Ads', 'Facebook', 'Instagram', 'LinkedIn',
  'Indicação', 'Evento', 'Cold Call', 'E-mail', 'Outro',
];

let currentFilters = { status: 'todos', origem: 'todas', search: '' };

export async function renderLeads(container, ctx) {
  container.innerHTML = `
    <div class="view">
      <div class="page-header">
        <div>
          <h1>Leads</h1>
          <p>Gerencie todos os seus leads e contatos</p>
        </div>
        <button class="btn btn-primary" id="btn-add-lead">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Lead
        </button>
      </div>

      <div class="filter-bar">
        <div class="search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="leads-search" placeholder="Buscar por nome, empresa ou email..." value="${escapeAttr(currentFilters.search)}">
        </div>
        <select id="leads-filter-status">
          <option value="todos">Todos os Status</option>
          ${STATUS_OPTIONS.map(s => `<option value="${s.value}" ${currentFilters.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
        <select id="leads-filter-origem">
          <option value="todas">Todas as Origens</option>
          ${ORIGEM_OPTIONS.map(o => `<option value="${o}" ${currentFilters.origem === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>

      <div id="leads-table-wrapper">
        <div style="padding:2rem;text-align:center">
          <div class="loading-skeleton" style="height:40px;margin-bottom:8px"></div>
          <div class="loading-skeleton" style="height:40px;margin-bottom:8px"></div>
          <div class="loading-skeleton" style="height:40px;margin-bottom:8px"></div>
        </div>
      </div>
    </div>`;

  const searchInput    = container.querySelector('#leads-search');
  const statusFilter   = container.querySelector('#leads-filter-status');
  const origemFilter   = container.querySelector('#leads-filter-origem');
  const btnAddLead     = container.querySelector('#btn-add-lead');
  const tableWrapper   = container.querySelector('#leads-table-wrapper');

  let debounceTimer;

  async function loadAndRender() {
    const leads = await fetchLeads(currentFilters);
    renderTable(leads, tableWrapper, ctx);
  }

  searchInput.addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadAndRender, 300);
  });

  statusFilter.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    loadAndRender();
  });

  origemFilter.addEventListener('change', (e) => {
    currentFilters.origem = e.target.value;
    loadAndRender();
  });

  btnAddLead.addEventListener('click', () => {
    openLeadModal(null, ctx, loadAndRender);
  });

  await loadAndRender();
}

function renderTable(leads, wrapper, ctx) {
  if (leads.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        <p>Nenhum lead encontrado</p>
        <button class="btn btn-ghost btn-sm" id="btn-clear-filters">Limpar filtros</button>
      </div>`;
    wrapper.querySelector('#btn-clear-filters')?.addEventListener('click', () => {
      currentFilters = { status: 'todos', origem: 'todas', search: '' };
      // Re-render parent to reset filter inputs
      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        import('./leads.js').then(m => m.renderLeads(mainContent, ctx));
      }
    });
    return;
  }

  wrapper.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Empresa</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Origem</th>
            <th>Status</th>
            <th>Valor Est.</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(lead => `
            <tr data-id="${lead.id}">
              <td class="td-name">${escapeHtml(lead.nome || '—')}</td>
              <td>${escapeHtml(lead.empresa || '—')}</td>
              <td>${escapeHtml(lead.email || '—')}</td>
              <td>${escapeHtml(lead.telefone || '—')}</td>
              <td>${escapeHtml(lead.origem || '—')}</td>
              <td><span class="badge badge-${lead.status || 'novo'}">${statusLabel(lead.status)}</span></td>
              <td class="td-value">${ctx.formatCurrency(lead.valor_estimado)}</td>
              <td style="white-space:nowrap">${ctx.formatDate(lead.created_at)}</td>
              <td>
                <div class="td-actions">
                  <button class="btn-icon btn-edit-lead" data-id="${lead.id}" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon btn-delete-lead" data-id="${lead.id}" title="Excluir" style="color:var(--red)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;

  // Edit buttons
  wrapper.querySelectorAll('.btn-edit-lead').forEach(btn => {
    btn.addEventListener('click', () => {
      const lead = leads.find(l => l.id === btn.dataset.id);
      if (lead) openLeadModal(lead, ctx, async () => {
        const updatedLeads = await fetchLeads(currentFilters);
        renderTable(updatedLeads, wrapper, ctx);
      });
    });
  });

  // Delete buttons
  wrapper.querySelectorAll('.btn-delete-lead').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja excluir este lead?')) return;
      const { error } = await deleteLead(btn.dataset.id);
      if (error) {
        ctx.toast('Erro ao excluir lead', 'error');
      } else {
        ctx.toast('Lead excluído', 'success');
        const updatedLeads = await fetchLeads(currentFilters);
        renderTable(updatedLeads, wrapper, ctx);
      }
    });
  });
}

function openLeadModal(lead, ctx, onSave) {
  const isEdit = !!lead;
  const title = isEdit ? 'Editar Lead' : 'Novo Lead';

  ctx.openModal(`
    <div class="modal-header">
      <h2>${title}</h2>
      <button class="btn-icon modal-close-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form id="lead-form" class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label for="lead-nome">Nome *</label>
          <input type="text" id="lead-nome" class="form-control" value="${escapeAttr(lead?.nome || '')}" required>
        </div>
        <div class="form-group">
          <label for="lead-empresa">Empresa</label>
          <input type="text" id="lead-empresa" class="form-control" value="${escapeAttr(lead?.empresa || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="lead-email">E-mail</label>
          <input type="email" id="lead-email" class="form-control" value="${escapeAttr(lead?.email || '')}">
        </div>
        <div class="form-group">
          <label for="lead-telefone">Telefone</label>
          <input type="tel" id="lead-telefone" class="form-control" value="${escapeAttr(lead?.telefone || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="lead-origem">Origem</label>
          <select id="lead-origem" class="form-control">
            <option value="">Selecione...</option>
            ${ORIGEM_OPTIONS.map(o => `<option value="${o}" ${lead?.origem === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="lead-status">Status</label>
          <select id="lead-status" class="form-control">
            ${STATUS_OPTIONS.map(s => `<option value="${s.value}" ${(lead?.status || 'novo') === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="lead-valor">Valor Estimado (R$)</label>
        <input type="number" id="lead-valor" class="form-control" step="0.01" min="0" value="${lead?.valor_estimado || ''}">
      </div>
      <div class="form-group">
        <label for="lead-notas">Notas</label>
        <textarea id="lead-notas" class="form-control" rows="3">${escapeHtml(lead?.notas || '')}</textarea>
      </div>
    </form>
    <div class="modal-footer">
      <button class="btn btn-ghost modal-cancel-btn">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-lead">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        ${isEdit ? 'Salvar' : 'Criar Lead'}
      </button>
    </div>
  `);

  // Close handlers
  document.querySelector('.modal-close-btn')?.addEventListener('click', ctx.closeModal);
  document.querySelector('.modal-cancel-btn')?.addEventListener('click', ctx.closeModal);

  // Save handler
  document.querySelector('#btn-save-lead')?.addEventListener('click', async () => {
    const form = document.querySelector('#lead-form');
    const nome = document.querySelector('#lead-nome').value.trim();
    if (!nome) {
      ctx.toast('Nome é obrigatório', 'warning');
      return;
    }

    const payload = {
      nome,
      empresa:         document.querySelector('#lead-empresa').value.trim() || null,
      email:           document.querySelector('#lead-email').value.trim() || null,
      telefone:        document.querySelector('#lead-telefone').value.trim() || null,
      origem:          document.querySelector('#lead-origem').value || null,
      status:          document.querySelector('#lead-status').value || 'novo',
      valor_estimado:  parseFloat(document.querySelector('#lead-valor').value) || 0,
      notas:           document.querySelector('#lead-notas').value.trim() || null,
    };

    if (isEdit) payload.id = lead.id;

    const { data, error } = await upsertLead(payload);
    if (error) {
      ctx.toast(`Erro: ${error.message}`, 'error');
    } else {
      ctx.toast(isEdit ? 'Lead atualizado!' : 'Lead criado!', 'success');
      ctx.closeModal();
      if (onSave) onSave();
    }
  });
}

/* ─── Helpers ─── */

function statusLabel(status) {
  const map = {
    novo: 'Novo', contatado: 'Contatado', qualificado: 'Qualificado',
    proposta: 'Proposta', negociacao: 'Negociação', fechado: 'Fechado', perdido: 'Perdido',
  };
  return map[status] || status || 'Novo';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
