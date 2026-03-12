/* ═══════════════════════════════════════════════════
   BG Tech — Kanban View
   ═══════════════════════════════════════════════════ */

import { fetchProjetos, fetchTarefas, fetchAllTarefas, upsertTarefa } from '../db.js';

/* ── Helpers ── */
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

const PRIORITY = {
  alta:  { label: 'Alta',  cls: 'priority-alta' },
  media: { label: 'Média', cls: 'priority-media' },
  baixa: { label: 'Baixa', cls: 'priority-baixa' },
};

const COLUMNS = [
  { key: 'todo',  label: 'A Fazer',   dot: 'todo' },
  { key: 'doing', label: 'Fazendo',   dot: 'doing' },
  { key: 'done',  label: 'Concluído', dot: 'done' },
];

/* ── Main render ── */
export async function renderKanban() {
  let projetos = [];
  let tarefas = [];

  try {
    [projetos, tarefas] = await Promise.all([fetchProjetos(), fetchAllTarefas()]);
  } catch (e) { console.warn('[kanban]', e); }

  // Build project options
  const projectOptions = projetos.map(p =>
    `<option value="${p.id}">${esc(p.titulo)}</option>`
  ).join('');

  // Group tarefas
  const grouped = { todo: [], doing: [], done: [] };
  tarefas.forEach(t => {
    const col = grouped[t.status] ? t.status : 'todo';
    grouped[col].push(t);
  });

  const html = `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kanban</h1>
          <p class="page-subtitle">Gestão visual das tarefas</p>
        </div>
      </div>

      <div class="toolbar">
        <select id="kanban-filter">
          <option value="">Todos os projetos</option>
          ${projectOptions}
        </select>
      </div>

      <div class="kanban-board" id="kanban-board">
        ${COLUMNS.map(col => {
          const cards = grouped[col.key] || [];
          return `
            <div class="kanban-column" data-col="${col.key}">
              <div class="kanban-column-header">
                <div class="kanban-column-title">
                  <span class="kanban-column-dot ${col.dot}"></span>
                  ${col.label}
                </div>
                <span class="kanban-column-count">${cards.length}</span>
              </div>
              <div class="kanban-cards" id="col-${col.key}">
                ${cards.length === 0 ? `<div class="empty-state" style="padding:2rem 1rem"><p style="font-size:0.78rem">Nenhuma tarefa</p></div>` :
                  cards.map(t => renderCard(t, col.key)).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  // Bind events after DOM insert
  setTimeout(() => bindKanbanEvents(projetos, tarefas), 0);

  return html;
}

function renderCard(t, currentCol) {
  const prio = PRIORITY[t.prioridade] || null;
  const overdue = isOverdue(t.data_limite);
  const projTitle = t.projetos?.titulo || '';

  // Determine move buttons based on current column
  const moves = [];
  if (currentCol !== 'todo')  moves.push({ target: 'todo',  label: 'A Fazer',   arrow: '←' });
  if (currentCol !== 'doing') moves.push({ target: 'doing', label: 'Fazendo',   arrow: currentCol === 'done' ? '←' : '→' });
  if (currentCol !== 'done')  moves.push({ target: 'done',  label: 'Concluído', arrow: '→' });

  return `
    <div class="kanban-card" data-tarefa-id="${t.id}">
      <div class="kanban-card-title">${esc(t.titulo)}</div>
      <div class="kanban-card-meta">
        ${prio ? `<span class="badge ${prio.cls}">${prio.label}</span>` : ''}
        ${t.responsavel ? `
          <span class="kanban-card-assignee">
            <span class="kanban-card-assignee-dot">${esc(t.responsavel.charAt(0).toUpperCase())}</span>
            ${esc(t.responsavel)}
          </span>` : ''}
        ${t.data_limite ? `
          <span class="kanban-card-date ${overdue && currentCol !== 'done' ? 'overdue' : ''}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${fmtDate(t.data_limite)}
          </span>` : ''}
      </div>
      ${projTitle ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.35rem">${esc(projTitle)}</div>` : ''}
      <div class="kanban-card-actions">
        ${moves.map(m => `
          <button class="kanban-move-btn" data-move-tarefa="${t.id}" data-move-to="${m.target}" title="Mover para ${m.label}">
            ${m.arrow} ${m.label}
          </button>`).join('')}
      </div>
    </div>`;
}

/* ── Event binding ── */
function bindKanbanEvents(projetos, allTarefas) {
  // Filter by project
  const filter = document.getElementById('kanban-filter');
  if (filter) {
    filter.addEventListener('change', async () => {
      const pid = filter.value;
      let tarefas = [];
      try {
        tarefas = pid ? await fetchTarefas(pid) : await fetchAllTarefas();
      } catch (e) { console.warn(e); }

      const grouped = { todo: [], doing: [], done: [] };
      tarefas.forEach(t => {
        const col = grouped[t.status] ? t.status : 'todo';
        grouped[col].push(t);
      });

      COLUMNS.forEach(col => {
        const container = document.getElementById(`col-${col.key}`);
        if (!container) return;
        const cards = grouped[col.key] || [];
        container.innerHTML = cards.length === 0
          ? '<div class="empty-state" style="padding:2rem 1rem"><p style="font-size:0.78rem">Nenhuma tarefa</p></div>'
          : cards.map(t => renderCard(t, col.key)).join('');

        // Update count
        const header = container.closest('.kanban-column')?.querySelector('.kanban-column-count');
        if (header) header.textContent = cards.length;
      });

      // Re-bind move buttons
      bindMoveButtons();
    });
  }

  // Move buttons
  bindMoveButtons();
}

function bindMoveButtons() {
  document.querySelectorAll('[data-move-tarefa]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tarefaId = btn.dataset.moveTarefa;
      const newStatus = btn.dataset.moveTo;
      try {
        await upsertTarefa({ id: tarefaId, status: newStatus });
        window.__app.toast(`Tarefa movida para ${newStatus === 'todo' ? 'A Fazer' : newStatus === 'doing' ? 'Fazendo' : 'Concluído'}`, 'info');
        window.__app.renderView();
      } catch (err) {
        window.__app.toast('Erro: ' + err.message, 'error');
      }
    });
  });
}
