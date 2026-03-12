/* ═══════════════════════════════════════════════════
   BG Tech — Dashboard View
   ═══════════════════════════════════════════════════ */

import { fetchProjetos } from '../db.js';
import { fetchAllTarefas } from '../db.js';

/** Format BRL currency */
function fmtBRL(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Relative time label */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

/** Build a progress ring SVG */
function progressRing(pct, size = 60, stroke = 5) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 100 ? 'var(--green)' : pct >= 60 ? 'var(--cyan)' : pct >= 30 ? 'var(--amber)' : 'var(--red)';
  return `
    <div class="progress-ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <circle class="progress-ring-bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${stroke}"/>
        <circle class="progress-ring-fill" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${stroke}"
          stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <span class="progress-ring-text">${Math.round(pct)}%</span>
    </div>`;
}

export async function renderDashboard() {
  let projetos = [];
  let tarefas = [];

  try {
    [projetos, tarefas] = await Promise.all([fetchProjetos(), fetchAllTarefas()]);
  } catch (err) {
    console.warn('[dashboard] fetch error:', err);
  }

  const total        = projetos.length;
  const emAndamento  = projetos.filter(p => p.status === 'em_andamento').length;
  const entregues    = projetos.filter(p => p.status === 'entregue').length;
  const atrasados    = projetos.filter(p => p.status === 'atrasado').length;
  const valorTotal   = projetos.reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);

  const now = new Date();
  const thisMonth = projetos.filter(p => {
    const d = new Date(p.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Active projects for progress section
  const active = projetos.filter(p => p.status === 'em_andamento' || p.status === 'atrasado').slice(0, 6);

  // Recent activity (latest updated projetos + tarefas merged)
  const activities = [
    ...projetos.slice(0, 5).map(p => ({
      text: `Projeto <strong>${esc(p.titulo)}</strong> atualizado`,
      time: p.updated_at,
      color: 'var(--cyan)',
    })),
    ...tarefas.slice(-5).reverse().map(t => ({
      text: `Tarefa <strong>${esc(t.titulo)}</strong> ${t.status === 'done' ? 'concluída' : 'atualizada'}`,
      time: t.updated_at || t.created_at,
      color: t.status === 'done' ? 'var(--green)' : 'var(--amber)',
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral dos projetos</p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Total de Projetos</span>
            <div class="stat-card-icon" style="background:var(--cyan-10);color:var(--cyan)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
          <span class="stat-card-value text-cyan">${total}</span>
          <span class="stat-card-footer">${thisMonth} criado(s) este mês</span>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Em Andamento</span>
            <div class="stat-card-icon" style="background:var(--amber-10);color:var(--amber)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <span class="stat-card-value text-amber">${emAndamento}</span>
          <span class="stat-card-footer">projetos ativos</span>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Entregues</span>
            <div class="stat-card-icon" style="background:var(--green-10);color:var(--green)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <span class="stat-card-value text-green">${entregues}</span>
          <span class="stat-card-footer">projetos concluídos</span>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Atrasados</span>
            <div class="stat-card-icon" style="background:var(--red-10);color:var(--red)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <span class="stat-card-value text-red">${atrasados}</span>
          <span class="stat-card-footer">requer atenção</span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid-2 mb-4">
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <span class="section-title" style="margin-bottom:0">Valor Total dos Projetos</span>
          </div>
          <span style="font-size:1.75rem;font-weight:700;color:var(--green)">${fmtBRL(valorTotal)}</span>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.35rem">${total} projeto(s) cadastrados</p>
        </div>
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <span class="section-title" style="margin-bottom:0">Projetos este Mês</span>
          </div>
          <span style="font-size:1.75rem;font-weight:700;color:var(--purple)">${thisMonth}</span>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.35rem">${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div class="grid-2">
        <!-- Active Projects Progress -->
        <div class="card">
          <span class="section-title">Progresso dos Projetos Ativos</span>
          ${active.length === 0 ? '<p class="text-muted" style="font-size:0.85rem">Nenhum projeto ativo</p>' :
            active.map(p => {
              const pct = parseFloat(p.progresso) || 0;
              return `
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
                  ${progressRing(pct, 48, 4)}
                  <div style="flex:1;min-width:0">
                    <div style="font-size:0.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.titulo)}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted)">${esc(p.cliente || '')}</div>
                  </div>
                  <span class="badge ${p.status === 'atrasado' ? 'badge-red' : 'badge-amber'}">${statusLabel(p.status)}</span>
                </div>`;
            }).join('')}
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <span class="section-title">Atividade Recente</span>
          ${activities.length === 0 ? '<p class="text-muted" style="font-size:0.85rem">Nenhuma atividade recente</p>' :
            `<div class="activity-list">${activities.map(a => `
              <div class="activity-item">
                <span class="activity-dot" style="background:${a.color}"></span>
                <div class="activity-content">
                  <div class="activity-text">${a.text}</div>
                  <div class="activity-time">${timeAgo(a.time)}</div>
                </div>
              </div>`).join('')}</div>`}
        </div>
      </div>
    </div>`;
}

/* ── Helpers ── */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function statusLabel(s) {
  const map = {
    planejamento: 'Planejamento',
    em_andamento: 'Em Andamento',
    entregue: 'Entregue',
    atrasado: 'Atrasado',
    cancelado: 'Cancelado',
  };
  return map[s] || s || '—';
}
