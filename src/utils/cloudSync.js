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
