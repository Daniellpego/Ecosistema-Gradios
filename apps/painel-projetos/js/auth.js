/* ═══════════════════════════════════════════════════
   Gradios — Auth Module (Supabase)
   ═══════════════════════════════════════════════════ */

import { CONFIG } from './config.js';

let _supabase = null;

/** Lazily initialise and return the Supabase client */
export function getSupabase() {
  if (!_supabase) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
      console.warn('[auth] Supabase credentials not configured — running in offline mode');
      return null;
    }
    const { createClient } = window.supabase;
    _supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return _supabase;
}

/** Sign in with email + password */
export async function signIn(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase não configurado');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

/** Get current session (null if not logged in) */
export async function getSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

/** Listen for auth state changes */
export function onAuthChange(callback) {
  const sb = getSupabase();
  if (!sb) return { data: { subscription: { unsubscribe() {} } } };
  return sb.auth.onAuthStateChange((_event, session) => callback(session));
}
