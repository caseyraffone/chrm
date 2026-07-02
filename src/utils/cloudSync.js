import { supabase, getCurrentUser, isSupabaseConfigured } from './supabase';

let syncInFlight = false;

export async function upsertProfile(user) {
  if (!supabase || !user) return;
  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email || null,
    updated_at: new Date().toISOString(),
  });
}

function drillToRow(drill, userId) {
  return {
    id: String(drill.id),
    user_id: userId,
    category: drill.category || 'Practice',
    question: drill.question || '',
    transcript: drill.transcript || '',
    feedback: drill.feedback || null,
    duration: drill.duration || 0,
    score: drill.score || drill.feedback?.score || null,
    company: drill.company || null,
    created_at: drill.date || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function syncDrillToCloud(drill) {
  if (!isSupabaseConfigured || !supabase || !drill?.id) return { skipped: true };
  const user = await getCurrentUser();
  if (!user) return { skipped: true };
  await upsertProfile(user);
  const { error } = await supabase
    .from('drill_sessions')
    .upsert(drillToRow(drill, user.id), { onConflict: 'id' });
  if (error) throw error;
  return { synced: true };
}

export async function syncLocalDrillsToCloud(getLocalDrills) {
  if (syncInFlight || !isSupabaseConfigured || !supabase) return { skipped: true };
  syncInFlight = true;
  try {
    const user = await getCurrentUser();
    if (!user) return { skipped: true };
    await upsertProfile(user);
    const drills = await getLocalDrills();
    if (!drills.length) return { synced: 0 };
    const rows = drills.map((drill) => drillToRow(drill, user.id));
    const { error } = await supabase.from('drill_sessions').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return { synced: rows.length };
  } finally {
    syncInFlight = false;
  }
}

export async function fetchCloudDrills() {
  if (!isSupabaseConfigured || !supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('drill_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    category: row.category,
    question: row.question,
    transcript: row.transcript,
    feedback: row.feedback,
    duration: row.duration,
    date: row.created_at,
    score: row.score,
    company: row.company,
  }));
}

// ─── Prep kits ────────────────────────────────────────────────────────────────
// Keyed by (user_id, company, role) so re-generating a kit for the same
// company/role overwrites cleanly. Role is normalized to '' (never null) so the
// unique constraint dedupes reliably — Postgres treats NULLs as distinct.

let prepKitSyncInFlight = false;

function prepKitToRow(company, role, kit, userId) {
  return {
    user_id: userId,
    company,
    role: role || '',
    kit,
    updated_at: new Date().toISOString(),
  };
}

export async function syncPrepKitToCloud(company, role, kit) {
  if (!isSupabaseConfigured || !supabase || !company || !kit) return { skipped: true };
  const user = await getCurrentUser();
  if (!user) return { skipped: true };
  await upsertProfile(user);
  const { error } = await supabase
    .from('prep_kits')
    .upsert(prepKitToRow(company, role, kit, user.id), { onConflict: 'user_id,company,role' });
  if (error) throw error;
  return { synced: true };
}

export async function syncLocalPrepKitsToCloud(getLocalPrepKits) {
  if (prepKitSyncInFlight || !isSupabaseConfigured || !supabase) return { skipped: true };
  prepKitSyncInFlight = true;
  try {
    const user = await getCurrentUser();
    if (!user) return { skipped: true };
    await upsertProfile(user);
    const kits = await getLocalPrepKits();
    if (!kits.length) return { synced: 0 };
    const rows = kits.map(({ company, role, kit }) => prepKitToRow(company, role, kit, user.id));
    const { error } = await supabase
      .from('prep_kits')
      .upsert(rows, { onConflict: 'user_id,company,role' });
    if (error) throw error;
    return { synced: rows.length };
  } finally {
    prepKitSyncInFlight = false;
  }
}

export async function fetchCloudPrepKits() {
  if (!isSupabaseConfigured || !supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase.from('prep_kits').select('*');
  if (error) throw error;
  return (data || []).map((row) => ({
    company: row.company,
    role: row.role || '',
    kit: row.kit,
  }));
}

// ─── HireVue sessions ─────────────────────────────────────────────────────────

let hireVueSyncInFlight = false;

function hireVueToRow(session, userId) {
  return {
    id: String(session.id),
    user_id: userId,
    company: session.company || null,
    role: session.role || null,
    items: session.items || [],
    created_at: session.date || new Date().toISOString(),
  };
}

export async function syncHireVueSessionToCloud(session) {
  if (!isSupabaseConfigured || !supabase || !session?.id) return { skipped: true };
  const user = await getCurrentUser();
  if (!user) return { skipped: true };
  await upsertProfile(user);
  const { error } = await supabase
    .from('hirevue_sessions')
    .upsert(hireVueToRow(session, user.id), { onConflict: 'id' });
  if (error) throw error;
  return { synced: true };
}

export async function syncLocalHireVueSessionsToCloud(getLocalSessions) {
  if (hireVueSyncInFlight || !isSupabaseConfigured || !supabase) return { skipped: true };
  hireVueSyncInFlight = true;
  try {
    const user = await getCurrentUser();
    if (!user) return { skipped: true };
    await upsertProfile(user);
    const sessions = await getLocalSessions();
    if (!sessions.length) return { synced: 0 };
    const rows = sessions.map((session) => hireVueToRow(session, user.id));
    const { error } = await supabase
      .from('hirevue_sessions')
      .upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return { synced: rows.length };
  } finally {
    hireVueSyncInFlight = false;
  }
}

export async function fetchCloudHireVueSessions() {
  if (!isSupabaseConfigured || !supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('hirevue_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    company: row.company,
    role: row.role,
    items: row.items || [],
    date: row.created_at,
  }));
}
