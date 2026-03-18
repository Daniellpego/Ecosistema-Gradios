/* ============================================
   Gradios CRM — Main Application Controller
   ============================================ */

import { signIn, signOut, getCurrentUser, onAuthStateChange } from './auth.js';
import { subscribeRealtime } from './db.js';
import { renderPipeline } from './views/pipeline.js';
import { renderLeads } from './views/leads.js';
import { renderDeals } from './views/deals.js';
import { renderAnalytics } from './views/analytics.js';

/* ─── State ─── */
const state = {
  user: null,
  currentView: 'pipeline',
  unsubscribeRealtime: null,
};

/* ─── DOM refs ─── */
const $ = (sel) => document.querySelector(sel);
const loginScreen  = $('#login-screen');
const appShell     = $('#app');
const loginForm    = $('#login-form');
const loginBtn     = $('#login-btn');
const loginError   = $('#login-error');
const mainContent  = $('#main-content');
const userAvatar   = $('#user-avatar');
const userName     = $('#user-name');
const userEmail    = $('#user-email');
const logoutBtn    = $('#logout-btn');
const sidebarToggle = $('#sidebar-toggle');
const sidebar      = $('#sidebar');
const modalOverlay = $('#modal-overlay');

/* ═══════════════════════════════════════════
   AUTH FLOW
   ═══════════════════════════════════════════ */

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = $('#login-email').value.trim();
  const password = $('#login-password').value;

  if (!email || !password) return;

  // Show spinner
  loginBtn.querySelector('.btn-text').hidden = true;
  loginBtn.querySelector('.btn-spinner').classList.remove('hidden');
  loginBtn.disabled = true;
  loginError.classList.add('hidden');

  const { user, error } = await signIn(email, password);

  if (error) {
    loginError.textContent = error.message || 'Erro ao fazer login';
    loginError.classList.remove('hidden');
    loginBtn.querySelector('.btn-text').hidden = false;
    loginBtn.querySelector('.btn-spinner').classList.add('hidden');
    loginBtn.disabled = false;
    return;
  }

  state.user = user;
  showApp();
});

logoutBtn?.addEventListener('click', async () => {
  await signOut();
  state.user = null;
  if (state.unsubscribeRealtime) {
    state.unsubscribeRealtime();
    state.unsubscribeRealtime = null;
  }
  showLogin();
});

function showLogin() {
  loginScreen.classList.remove('hidden');
  appShell.classList.add('hidden');
  loginForm.reset();
  loginError.classList.add('hidden');
  loginBtn.querySelector('.btn-text').hidden = false;
  loginBtn.querySelector('.btn-spinner').classList.add('hidden');
  loginBtn.disabled = false;
}

function showApp() {
  loginScreen.classList.add('hidden');
  appShell.classList.remove('hidden');

  // Set user info
  if (state.user) {
    const email = state.user.email || '';
    const name = state.user.user_metadata?.name || email.split('@')[0] || 'Usuario';
    userName.textContent = name;
    userEmail.textContent = email;
    userAvatar.textContent = name.charAt(0).toUpperCase();
  }

  // Start realtime
  state.unsubscribeRealtime = subscribeRealtime(
    () => { if (state.currentView === 'pipeline' || state.currentView === 'leads') navigateTo(state.currentView); },
    () => { if (state.currentView === 'deals' || state.currentView === 'pipeline') navigateTo(state.currentView); }
  );

  // Navigate to current hash or default
  const hash = window.location.hash.replace('#', '') || 'pipeline';
  navigateTo(hash);
}

/* ═══════════════════════════════════════════
   ROUTER (hash-based)
   ═══════════════════════════════════════════ */

const views = {
  pipeline:  renderPipeline,
  leads:     renderLeads,
  deals:     renderDeals,
  analytics: renderAnalytics,
};

function navigateTo(view) {
  if (!views[view]) view = 'pipeline';
  state.currentView = view;
  window.location.hash = view;

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  // Render view
  mainContent.innerHTML = '<div class="view" style="display:flex;align-items:center;justify-content:center;min-height:300px"><div class="loading-skeleton" style="width:60px;height:60px;border-radius:50%"></div></div>';
  views[view](mainContent, { toast, openModal, closeModal, navigateTo, formatCurrency, formatDate });

  // Close sidebar on mobile after navigation
  sidebar.classList.remove('open');
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
  if (!state.user) return;
  const hash = window.location.hash.replace('#', '') || 'pipeline';
  if (hash !== state.currentView) navigateTo(hash);
});

// Sidebar nav clicks
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.view);
  });
});

/* ═══════════════════════════════════════════
   SIDEBAR (mobile toggle)
   ═══════════════════════════════════════════ */

sidebarToggle?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth > 768) return;
  if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

/* ═══════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════ */

export function openModal(html) {
  const modalContent = $('#modal-content');
  modalContent.innerHTML = html;
  modalOverlay.classList.remove('hidden');
}

export function closeModal() {
  modalOverlay.classList.add('hidden');
  $('#modal-content').innerHTML = '';
}

// Close modal on overlay click
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════ */

const toastContainer = $('#toast-container');

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration — ms
 */
export function toast(message, type = 'info', duration = 3500) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;

  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  el.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  toastContainer.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */

async function init() {
  const user = await getCurrentUser();
  if (user) {
    state.user = user;
    showApp();
  } else {
    showLogin();
  }

  // Listen for auth state changes (e.g. token refresh)
  onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      state.user = null;
      showLogin();
    } else if (event === 'SIGNED_IN' && session?.user) {
      state.user = session.user;
    }
  });
}

init();
