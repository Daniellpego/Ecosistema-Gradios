// ═══════════════════════════════════════════════
// BG Tech Ecosystem — Shared Supabase DB Layer
// ═══════════════════════════════════════════════

let _client = null;

export function initSupabase(url, anonKey) {
  if (!_client) {
    _client = window.supabase.createClient(url, anonKey);
  }
  return _client;
}

export function getSupabase() {
  if (!_client) throw new Error('Supabase not initialized. Call initSupabase() first.');
  return _client;
}

// ─── Auth helpers ────────────────────────────────

export async function signIn(email, password) {
  const sb = getSupabase();
  const ALIASES = { 'bgtech': 'acessosbgtech@gmail.com' };
  const actualEmail = ALIASES[email.toLowerCase().trim()] || email;
  const { data, error } = await sb.auth.signInWithPassword({ email: actualEmail, password });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signOut() {
  await getSupabase().auth.signOut();
  window.location.reload();
}

export async function getSession() {
  const { data: { session } } = await getSupabase().auth.getSession();
  return session;
}

export function onAuthChange(callback) {
  getSupabase().auth.onAuthStateChange((_, session) => {
    callback(session?.user || null);
  });
}

// ─── Generic CRUD ────────────────────────────────

export async function fetchAll(table, options = {}) {
  let query = getSupabase().from(table).select(options.select || '*');
  if (options.order) query = query.order(options.order, { ascending: options.ascending ?? true });
  if (options.filter) {
    for (const [col, val] of Object.entries(options.filter)) {
      query = query.eq(col, val);
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertRow(table, row) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  const payload = { ...row, user_id: session?.user?.id };
  const { data, error } = await sb.from(table).upsert(payload, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, id) {
  const { error } = await getSupabase().from(table).delete().eq('id', id);
  if (error) throw error;
}

// ─── Realtime subscription ───────────────────────

export function subscribeRealtime(channelName, tables, callback) {
  const sb = getSupabase();
  let channel = sb.channel(channelName);
  for (const table of tables) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      callback(table, payload);
    });
  }
  return channel.subscribe();
}
