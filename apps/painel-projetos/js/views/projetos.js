/* ═══════════════════════════════════════════════════
   BG Tech — Projetos View
   ═══════════════════════════════════════════════════ */

import { fetchProjetos, upsertProjeto, deleteProjeto, fetchTarefas, upsertTarefa, deleteTarefa } from '../db.js';

/* ── Helpers ── */
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function fmtBRL(v) { return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—'; }

const STATUS_MAP = {
  planejamento: { label: 'Planejamento', badge: 'badge-purple' },
  em_andamento: { label: 'Em Andamento', badge: 'badge-amber' },
  entregue:     { label: 'Entregue',     badge: 'badge-green' },
  atrasado:     { label: 'Atrasado',     badge: 'badge-red' },
  cancelado:    { label: 'Cancelado',    badge: 'badge-muted' },
};

function statusBadge(s) {
  const info = STATUS_MAP[s] || { label: s || '—', badge: 'badge-muted' };
  return `<span class="badge ${info.badge}">${info.label}</span>`;
}

function progressColor(pct) {
  if (pct >= 100) return 'green';
  if (pct >= 60) return '';
  if (pct >= 30) return 'amber';
  return 'red';
}

/* ── Main render ── */
export async function renderProjetos() {
  let projetos = [];
  try { projetos = await fetchProjetos(); } catch (e) { console.warn('[projetos]', e); }

  const cards = projetos.map(p => {
    const pct = parseFloat(p.progresso) || 0;
    const tags = (p.tags || []);
    return `
      <div class="project-card" data-action="openProject" data-id="${p.id}">
        <div class="project-card-header">
          <div>
            <div class="project-card-title">${esc(p.titulo)}</div>
            <div class="project-card-client">${esc(p.cliente || 'Sem cliente')}</div>
          </div>
          ${statusBadge(p.status)}
        </div>
        <div class="project-card-body">
          <div class="project-card-row">
            <span class="label">Responsável</span>
            <span class="value">${esc(p.responsavel || '—')}</span>
          </div>
          <div class="project-card-row">
            <span class="label">Valor</span>
            <span class="value">${fmtBRL(p.valor)}</span>
          </div>
          <div class="project-card-row">
            <span class="label">Entrega</span>
            <span class="value">${fmtDate(p.data_entrega)}</span>
          </div>
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:0.72rem;color:var(--text-muted)">Progresso</span>
              <span style="font-size:0.72rem;font-weight:600;color:var(--text-secondary)">${Math.round(pct)}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill ${progressColor(pct)}" style="width:${pct}%"></div></div>
          </div>
          ${tags.length ? `<div class="tags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  // Register handlers
  setTimeout(() => registerHandlers(projetos), 0);

  return `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Projetos</h1>
          <p class="page-subtitle">${projetos.length} projeto(s) cadastrados</p>
        </div>
        <button class="btn btn-primary" data-action="addProject">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Projeto
        </button>
      </div>

      ${projetos.length === 0 ? `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <h3>Nenhum projeto ainda</h3>
          <p>Crie seu primeiro projeto para começar a gerenciar.</p>
        </div>` : `
        <div class="projects-grid">${cards}</div>`}

      <div id="project-detail"></div>
    </div>`;
}

/* ── Event handlers ── */
function registerHandlers(projetos) {
  const { toast, renderView } = window.__app;

  // Add project
  window.__viewHandlers = window.__viewHandlers || {};

  window.__viewHandlers.addProject = () => showProjectModal(null, renderView);
  window.__viewHandlers.openProject = (_e, el) => {
    const id = el.dataset.id;
    const p = projetos.find(x => x.id === id);
    if (p) showProjectDetail(p);
  };

  // Re-bind after render
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
      const h = window.__viewHandlers?.[el.dataset.action];
      if (h) h(e, el);
    });
  });
}

/* ── Project Modal ── */
function showProjectModal(projeto, onSave) {
  const isEdit = !!projeto;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? 'Editar Projeto' : 'Novo Projeto'}</h2>
        <button class="btn-icon" id="modal-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Título *</label>
          <input type="text" id="m-titulo" value="${esc(projeto?.titulo || '')}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Cliente</label>
            <input type="text" id="m-cliente" value="${esc(projeto?.cliente || '')}">
          </div>
          <div class="form-group">
            <label>Responsável</label>
            <input type="text" id="m-responsavel" value="${esc(projeto?.responsavel || '')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select id="m-status">
              ${['planejamento','em_andamento','entregue','atrasado','cancelado'].map(s =>
                `<option value="${s}" ${projeto?.status === s ? 'selected' : ''}>${STATUS_MAP[s].label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Valor (R$)</label>
            <input type="number" id="m-valor" step="0.01" min="0" value="${projeto?.valor || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data Início</label>
            <input type="date" id="m-data-inicio" value="${projeto?.data_inicio || ''}">
          </div>
          <div class="form-group">
            <label>Data Entrega</label>
            <input type="date" id="m-data-entrega" value="${projeto?.data_entrega || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Progresso (%)</label>
          <input type="number" id="m-progresso" min="0" max="100" value="${projeto?.progresso || 0}">
        </div>
        <div class="form-group">
          <label>Tags (separadas por vírgula)</label>
          <input type="text" id="m-tags" value="${(projeto?.tags || []).join(', ')}">
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea id="m-descricao" rows="3">${esc(projeto?.descricao || '')}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        ${isEdit ? '<button class="btn btn-danger" id="modal-delete">Excluir</button>' : ''}
        <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
        <button class="btn btn-primary" id="modal-save">Salvar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#modal-close').addEventListener('click', close);
  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#modal-save').addEventListener('click', async () => {
    const titulo = overlay.querySelector('#m-titulo').value.trim();
    if (!titulo) { window.__app.toast('Preencha o título', 'warning'); return; }

    const tagsRaw = overlay.querySelector('#m-tags').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const payload = {
      ...(isEdit ? { id: projeto.id } : {}),
      titulo,
      cliente: overlay.querySelector('#m-cliente').value.trim(),
      responsavel: overlay.querySelector('#m-responsavel').value.trim(),
      status: overlay.querySelector('#m-status').value,
      valor: parseFloat(overlay.querySelector('#m-valor').value) || 0,
      data_inicio: overlay.querySelector('#m-data-inicio').value || null,
      data_entrega: overlay.querySelector('#m-data-entrega').value || null,
      progresso: parseFloat(overlay.querySelector('#m-progresso').value) || 0,
      tags,
      descricao: overlay.querySelector('#m-descricao').value.trim(),
    };

    try {
      await upsertProjeto(payload);
      window.__app.toast(isEdit ? 'Projeto atualizado' : 'Projeto criado', 'success');
      close();
      if (onSave) onSave();
    } catch (err) {
      window.__app.toast('Erro: ' + err.message, 'error');
    }
  });

  if (isEdit) {
    overlay.querySelector('#modal-delete').addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
      try {
        await deleteProjeto(projeto.id);
        window.__app.toast('Projeto excluído', 'success');
        close();
        window.__app.renderView();
      } catch (err) {
        window.__app.toast('Erro: ' + err.message, 'error');
      }
    });
  }
}

/* ── Project Detail (with tarefas) ── */
async function showProjectDetail(projeto) {
  const container = document.getElementById('project-detail');
  if (!container) return;

  let tarefas = [];
  try { tarefas = await fetchTarefas(projeto.id); } catch (e) { console.warn(e); }

  const totalTarefas = tarefas.length;
  const doneTarefas = tarefas.filter(t => t.status === 'done').length;

  container.innerHTML = `
    <div class="detail-panel fade-in">
      <div class="detail-panel-header">
        <div>
          <h2 style="font-size:1.15rem;font-weight:600">${esc(projeto.titulo)}</h2>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.15rem">${esc(projeto.cliente || '')} · ${esc(projeto.responsavel || '')}</p>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-secondary btn-sm" id="detail-edit">Editar</button>
          <button class="btn btn-ghost btn-sm" id="detail-close">Fechar</button>
        </div>
      </div>

      ${projeto.descricao ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem">${esc(projeto.descricao)}</p>` : ''}

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
        <span class="section-title" style="margin-bottom:0">Tarefas (${doneTarefas}/${totalTarefas})</span>
        <button class="btn btn-primary btn-sm" id="add-tarefa">+ Tarefa</button>
      </div>

      <div class="task-list" id="tarefa-list">
        ${tarefas.length === 0 ? '<p class="text-muted" style="font-size:0.82rem;padding:0.5rem">Nenhuma tarefa cadastrada</p>' :
          tarefas.map(t => `
            <div class="task-item" data-tarefa-id="${t.id}">
              <div class="task-item-check ${t.status === 'done' ? 'checked' : ''}" data-toggle-tarefa="${t.id}"></div>
              <span class="task-item-title ${t.status === 'done' ? 'done' : ''}">${esc(t.titulo)}</span>
              ${t.prioridade ? `<span class="badge priority-${t.prioridade}">${t.prioridade}</span>` : ''}
              ${t.responsavel ? `<span style="font-size:0.72rem;color:var(--text-muted)">${esc(t.responsavel)}</span>` : ''}
              <div class="task-item-actions">
                <button class="btn-icon" style="width:28px;height:28px" data-delete-tarefa="${t.id}" title="Excluir">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>`).join('')}
      </div>
    </div>`;

  // Scroll into view
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Bind detail events
  container.querySelector('#detail-close').addEventListener('click', () => { container.innerHTML = ''; });
  container.querySelector('#detail-edit').addEventListener('click', () => {
    showProjectModal(projeto, () => window.__app.renderView());
  });
  container.querySelector('#add-tarefa').addEventListener('click', () => {
    showTarefaPrompt(projeto.id, () => showProjectDetail(projeto));
  });

  // Toggle tarefa status
  container.querySelectorAll('[data-toggle-tarefa]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.toggleTarefa;
      const t = tarefas.find(x => x.id === id);
      if (!t) return;
      try {
        await upsertTarefa({ id: t.id, projeto_id: t.projeto_id, titulo: t.titulo, status: t.status === 'done' ? 'todo' : 'done' });
        showProjectDetail(projeto);
      } catch (err) { window.__app.toast('Erro: ' + err.message, 'error'); }
    });
  });

  // Delete tarefa
  container.querySelectorAll('[data-delete-tarefa]').forEach(el => {
    el.addEventListener('click', async () => {
      if (!confirm('Excluir esta tarefa?')) return;
      try {
        await deleteTarefa(el.dataset.deleteTarefa);
        window.__app.toast('Tarefa excluída', 'success');
        showProjectDetail(projeto);
      } catch (err) { window.__app.toast('Erro: ' + err.message, 'error'); }
    });
  });
}

/* ── Quick tarefa prompt ── */
function showTarefaPrompt(projetoId, onDone) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:440px">
      <div class="modal-header">
        <h2 class="modal-title">Nova Tarefa</h2>
        <button class="btn-icon" id="tp-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Título *</label>
          <input type="text" id="tp-titulo" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Prioridade</label>
            <select id="tp-prioridade">
              <option value="baixa">Baixa</option>
              <option value="media" selected>Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div class="form-group">
            <label>Responsável</label>
            <input type="text" id="tp-responsavel">
          </div>
        </div>
        <div class="form-group">
          <label>Data Limite</label>
          <input type="date" id="tp-data-limite">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="tp-cancel">Cancelar</button>
        <button class="btn btn-primary" id="tp-save">Criar</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('#tp-close').addEventListener('click', close);
  overlay.querySelector('#tp-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelector('#tp-save').addEventListener('click', async () => {
    const titulo = overlay.querySelector('#tp-titulo').value.trim();
    if (!titulo) { window.__app.toast('Preencha o título', 'warning'); return; }
    try {
      await upsertTarefa({
        projeto_id: projetoId,
        titulo,
        prioridade: overlay.querySelector('#tp-prioridade').value,
        responsavel: overlay.querySelector('#tp-responsavel').value.trim(),
        data_limite: overlay.querySelector('#tp-data-limite').value || null,
        status: 'todo',
      });
      window.__app.toast('Tarefa criada', 'success');
      close();
      if (onDone) onDone();
    } catch (err) {
      window.__app.toast('Erro: ' + err.message, 'error');
    }
  });
}
