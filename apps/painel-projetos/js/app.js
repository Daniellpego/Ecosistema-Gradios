/* ═══════════════════════════════════════════════════
   Gradios — Painel de Projetos  ·  Main App Controller
   ═══════════════════════════════════════════════════ */

import { signIn, signOut, getSession, onAuthChange } from './auth.js';
import { subscribeRealtime } from './db.js';
import { renderDashboard } from './views/dashboard.js';
import { renderProjetos } from './views/projetos.js';
import { renderKanban } from './views/kanban.js';
import { renderTimeline } from './views/timeline.js';

/* ─── DOM refs ─── */
const $login       = document.getElementById('login-screen');
const $app         = document.getElementById('app-shell');
const $main        = document.getElementById('main-content');
const $loginForm   = document.getElementById('login-form');
const $loginEmail  = document.getElementById('login-email');
const $loginPass   = document.getElementById('login-password');
const $loginBtn    = document.getElementById('login-btn');
const $loginError  = document.getElementById('login-error');
const $sidebar     = document.getElementById('sidebar');
const $menuToggle  = document.getElementById('menu-toggle');
const $overlay     = document.getElementById('sidebar-overlay');
const $logoutBtn   = document.getElementById('logout-btn');
const $userName    = document.getElementById('user-name');
const $userAvatar  = document.getElementById('user-avatar');
const $toastBox    = document.getElementById('toast-container');

/* ─── State ─── */
let currentView = 'dashboard';
let realtimeSub = null;

/* ═══════════ AUTH FLOW ═══════════ */

async function boot() {
  const session = await getSession();
  if (session) {
    showApp(session);
  } else {
    showLogin();
  }

  onAuthChange((session) => {
    if (session) showApp(session);
    else showLogin();
  });
}

function showLogin() {
  $login.hidden = false;
  $app.hidden   = true;
  if (realtimeSub) { realtimeSub.unsubscribe(); realtimeSub = null; }
}

function showApp(session) {
  $login.hidden = true;
  $app.hidden   = false;

  const email = session?.user?.email || '';
  const name  = session?.user?.user_metadata?.name || email.split('@')[0] || 'Usuário';
  $userName.textContent  = name;
  $userAvatar.textContent = name.charAt(0).toUpperCase();

  // Start realtime
  if (realtimeSub) realtimeSub.unsubscribe();
  realtimeSub = subscribeRealtime({
    onProjetosChange: () => refreshCurrentView(),
    onTarefasChange:  () => refreshCurrentView(),
  });

  // Route
  handleRoute();
}

$loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  $loginError.hidden = true;
  $loginBtn.querySelector('.btn-text').hidden = true;
  $loginBtn.querySelector('.btn-loading').hidden = false;
  $loginBtn.disabled = true;

  try {
    await signIn($loginEmail.value.trim(), $loginPass.value);
  } catch (err) {
    $loginError.textContent = err.message || 'Erro ao fazer login';
    $loginError.hidden = false;
  } finally {
    $loginBtn.querySelector('.btn-text').hidden = false;
    $loginBtn.querySelector('.btn-loading').hidden = true;
    $loginBtn.disabled = false;
  }
});

$logoutBtn.addEventListener('click', async () => {
  try { await signOut(); } catch (err) { toast('Erro ao sair', 'error'); }
  showLogin();
});

/* ═══════════ ROUTER ═══════════ */

const VIEWS = {
  dashboard: renderDashboard,
  projetos:  renderProjetos,
  kanban:    renderKanban,
  timeline:  renderTimeline,
};

function handleRoute() {
  const hash = (location.hash || '#dashboard').replace('#', '').split('/')[0];
  currentView = VIEWS[hash] ? hash : 'dashboard';

  // Update active nav
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === currentView);
  });

  renderView();
}

async function renderView() {
  $main.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px"><span class="spinner" style="width:28px;height:28px;border-width:3px"></span></div>';
  try {
    const html = await VIEWS[currentView]();
    $main.innerHTML = html;
    bindViewEvents();
  } catch (err) {
    console.error('[app] render error:', err);
    $main.innerHTML = `<div class="empty-state"><h3>Erro ao carregar</h3><p>${err.message}</p></div>`;
  }
}

function refreshCurrentView() {
  renderView();
}

/* Expose globally for views */
window.__app = {
  renderView: refreshCurrentView,
  toast,
  navigate(view) {
    location.hash = '#' + view;
  },
};

window.addEventListener('hashchange', handleRoute);

/* ═══════════ SIDEBAR (mobile) ═══════════ */

$menuToggle.addEventListener('click', () => {
  $sidebar.classList.add('open');
  $overlay.classList.add('open');
});

function closeSidebar() {
  $sidebar.classList.remove('open');
  $overlay.classList.remove('open');
}

$overlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-item').forEach((el) => {
  el.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

/* ═══════════ TOAST ═══════════ */

export function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  $toastBox.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-exit');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* ═══════════ VIEW EVENT BINDING ═══════════ */

function bindViewEvents() {
  // Delegate click events from rendered view HTML
  $main.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const action = el.dataset.action;
      const handler = window.__viewHandlers?.[action];
      if (handler) handler(e, el);
    });
  });
}

/* ═══════════ BOOT ═══════════ */

boot().catch((err) => console.error('[app] boot failed:', err));
