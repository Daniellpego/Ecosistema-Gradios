/* ============================================
   Gradios CRM — Auth Module (Supabase)
   ============================================ */

import { CONFIG } from './config.js';

let supabase = null;

/**
 * Initialise the Supabase client (singleton).
 * Uses the global `window.supabase` UMD loaded from CDN.
 */
export function getSupabase() {
  if (supabase) return supabase;

  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.warn('[auth] Supabase credentials not configured — running in offline mode.');
    return null;
  }

  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return supabase;
}

/**
 * Sign in with email + password.
 * @returns {{ user, session, error }}
 */
export async function signIn(email, password) {
  const sb = getSupabase();
  if (!sb) return { user: null, session: null, error: { message: 'Supabase não configurado' } };

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { user: data?.user ?? null, session: data?.session ?? null, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

/**
 * Get the currently authenticated user (from local session).
 * @returns {object|null}
 */
export async function getCurrentUser() {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/**
 * Listen to auth state changes.
 * @param {function} callback — receives (event, session)
 * @returns {object} subscription with .unsubscribe()
 */
export function onAuthStateChange(callback) {
  const sb = getSupabase();
  if (!sb) return { data: { subscription: { unsubscribe() {} } } };

  return sb.auth.onAuthStateChange(callback);
}
