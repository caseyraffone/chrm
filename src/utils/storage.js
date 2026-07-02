import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchCloudDrills,
  syncDrillToCloud,
  syncLocalDrillsToCloud,
  syncPrepKitToCloud,
  syncLocalPrepKitsToCloud,
  fetchCloudPrepKits,
  syncHireVueSessionToCloud,
  syncLocalHireVueSessionsToCloud,
  fetchCloudHireVueSessions,
} from './cloudSync';

const DRILLS_KEY = '@chrm_drills';
const REP_COUNT_KEY = '@chrm_rep_count';
const ONBOARDING_KEY = '@chrm_onboarding_completed';
const SUBSCRIPTION_KEY = '@chrm_subscription_status';

export const FREE_DAILY_LIMIT = 3;

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function getOnboardingCompleted() {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding flag:', error);
  }
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function getSubscriptionStatus() {
  try {
    const val = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    return val === 'pro' ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}

export async function setSubscriptionStatus(status) {
  try {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, status);
  } catch (error) {
    console.error('Error setting subscription status:', error);
  }
}

// ─── Daily drill count ────────────────────────────────────────────────────────

function dailyDrillKey() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `@chrm_drills_today_${date}`;
}

export async function getDailyDrillCount() {
  try {
    const val = await AsyncStorage.getItem(dailyDrillKey());
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function incrementDailyDrillCount() {
  try {
    const current = await getDailyDrillCount();
    await AsyncStorage.setItem(dailyDrillKey(), String(current + 1));
  } catch (error) {
    console.error('Error incrementing daily drill count:', error);
  }
}

export async function resetDailyDrillCount() {
  try {
    await AsyncStorage.setItem(dailyDrillKey(), '0');
  } catch (error) {
    console.error('Error resetting daily drill count:', error);
  }
}

const CACHE_PREFIX = '@chrm_questions_';
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

// ─── Drill storage ───────────────────────────────────────────────────────────

export async function saveDrill(drill) {
  try {
    const existing = await getDrills();
    const updated = [drill, ...existing];
    await AsyncStorage.setItem(DRILLS_KEY, JSON.stringify(updated));

    const count = await getRepCount();
    await AsyncStorage.setItem(REP_COUNT_KEY, String(count + 1));

    await incrementDailyDrillCount();
    syncDrillToCloud(drill).catch((error) => {
      console.warn('Cloud drill sync failed:', error.message);
    });
  } catch (error) {
    console.error('Error saving drill:', error);
    throw error;
  }
}

export async function getDrills() {
  try {
    const data = await AsyncStorage.getItem(DRILLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting drills:', error);
    return [];
  }
}

export async function syncDrillsWithCloud() {
  try {
    await syncLocalDrillsToCloud(getDrills);
    const cloud = await fetchCloudDrills();
    if (!cloud.length) return await getDrills();

    const local = await getDrills();
    const byId = new Map();
    [...cloud, ...local].forEach((drill) => {
      if (drill?.id && !byId.has(drill.id)) byId.set(drill.id, drill);
    });
    const merged = Array.from(byId.values()).sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    await AsyncStorage.setItem(DRILLS_KEY, JSON.stringify(merged));
    await AsyncStorage.setItem(REP_COUNT_KEY, String(merged.length));
    return merged;
  } catch (error) {
    console.warn('Cloud history sync failed:', error.message);
    return await getDrills();
  }
}

// Syncs all cloud-backed data (drills, prep kits, HireVue sessions) on login.
// Returns the merged drills so callers can show a rep count. Prep kit and
// HireVue merges run even if one fails, so a single error can't block the rest.
export async function syncAllWithCloud() {
  const drills = await syncDrillsWithCloud();
  await Promise.allSettled([syncPrepKitsWithCloud(), syncHireVueSessionsWithCloud()]);
  return drills;
}

export async function getRepCount() {
  try {
    const count = await AsyncStorage.getItem(REP_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    return 0;
  }
}

export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([DRILLS_KEY, REP_COUNT_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// ─── Question cache ───────────────────────────────────────────────────────────

function cacheKey(role, category) {
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, '_');
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
  return `${CACHE_PREFIX}${normalizedRole}_${normalizedCategory}`;
}

export async function getCachedQuestions(role, category) {
  try {
    const key = cacheKey(role, category);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const { questions, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return questions;
  } catch (error) {
    return null;
  }
}

export async function setCachedQuestions(role, category, questions) {
  try {
    const key = cacheKey(role, category);
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ questions, timestamp: Date.now() })
    );
  } catch (error) {
    console.error('Error caching questions:', error);
  }
}

export async function clearCachedQuestions(role, category) {
  try {
    const key = cacheKey(role, category);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing question cache:', error);
  }
}

// ─── Question bank progress ───────────────────────────────────────────────────
//
// Tracks the user's best score per curated bank question (keyed by item id), so
// the question list can show mastery and progress over time.

const BANK_PROGRESS_KEY = '@chrm_bank_progress';

export async function getBankProgress() {
  try {
    const json = await AsyncStorage.getItem(BANK_PROGRESS_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

// Records an attempt, keeping the best score and an attempt count per item.
export async function saveBankAttempt(itemId, score) {
  try {
    if (!itemId) return;
    const progress = await getBankProgress();
    const prev = progress[itemId] || { best: 0, attempts: 0 };
    progress[itemId] = {
      best: Math.max(prev.best || 0, score || 0),
      attempts: (prev.attempts || 0) + 1,
      last: score || 0,
      date: new Date().toISOString(),
    };
    await AsyncStorage.setItem(BANK_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving bank attempt:', error);
  }
}

// ─── Mock Interview storage ───────────────────────────────────────────────────

const MOCK_INTERVIEWS_KEY = '@chrm_mock_interviews';

export async function saveMockInterview(interview) {
  try {
    const existing = await getMockInterviews();
    const updated = [interview, ...existing];
    await AsyncStorage.setItem(MOCK_INTERVIEWS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving mock interview:', error);
  }
}

export async function getMockInterviews() {
  try {
    const data = await AsyncStorage.getItem(MOCK_INTERVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

// ─── Resume storage ───────────────────────────────────────────────────────────

const RESUME_KEY = '@chrm_resume';

export async function saveResume(text) {
  try {
    await AsyncStorage.setItem(RESUME_KEY, text);
  } catch (error) {
    console.error('Error saving resume:', error);
  }
}

export async function getResume() {
  try {
    const text = await AsyncStorage.getItem(RESUME_KEY);
    return text || '';
  } catch (error) {
    return '';
  }
}

// ─── HireVue Simulation storage ───────────────────────────────────────────────

const HIREVUE_SESSIONS_KEY = '@chrm_hirevue_sessions';

async function saveHireVueSessionLocal(session) {
  const existing = await getHireVueSessions();
  const deduped = existing.filter((s) => String(s.id) !== String(session.id));
  const updated = [session, ...deduped];
  await AsyncStorage.setItem(HIREVUE_SESSIONS_KEY, JSON.stringify(updated));
}

export async function saveHireVueSession(session) {
  try {
    await saveHireVueSessionLocal(session);
    syncHireVueSessionToCloud(session).catch((error) => {
      console.warn('Cloud HireVue sync failed:', error.message);
    });
  } catch (error) {
    console.error('Error saving HireVue session:', error);
  }
}

export async function getHireVueSessions() {
  try {
    const data = await AsyncStorage.getItem(HIREVUE_SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

// Pushes local HireVue sessions to the cloud, then merges cloud sessions back
// (union by id, newest first) so history carries over across devices on login.
export async function syncHireVueSessionsWithCloud() {
  try {
    await syncLocalHireVueSessionsToCloud(getHireVueSessions);
    const cloud = await fetchCloudHireVueSessions();
    if (!cloud.length) return await getHireVueSessions();

    const local = await getHireVueSessions();
    const byId = new Map();
    [...cloud, ...local].forEach((session) => {
      if (session?.id && !byId.has(String(session.id))) byId.set(String(session.id), session);
    });
    const merged = Array.from(byId.values()).sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    await AsyncStorage.setItem(HIREVUE_SESSIONS_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.warn('Cloud HireVue sync failed:', error.message);
    return await getHireVueSessions();
  }
}

// ─── Prep Kit storage ─────────────────────────────────────────────────────────

const PREP_KIT_INDEX_KEY = '@chrm_prepkit_index';

function prepKitKey(company, role) {
  const c = company.toLowerCase().trim().replace(/\s+/g, '_');
  const r = (role || '').toLowerCase().trim().replace(/\s+/g, '_');
  return `@chrm_prepkit_${c}${r ? `_${r}` : ''}`;
}

async function savePrepKitLocal(company, role, kit) {
  const key = prepKitKey(company, role);
  await AsyncStorage.setItem(key, JSON.stringify(kit));

  const indexJson = await AsyncStorage.getItem(PREP_KIT_INDEX_KEY);
  const index = indexJson ? JSON.parse(indexJson) : [];
  const entry = { company, role, key, date: new Date().toISOString() };
  const existing = index.findIndex((i) => i.key === key);
  if (existing >= 0) {
    index[existing] = entry;
  } else {
    index.unshift(entry);
  }
  await AsyncStorage.setItem(PREP_KIT_INDEX_KEY, JSON.stringify(index));
}

export async function savePrepKit(company, role, kit) {
  try {
    await savePrepKitLocal(company, role, kit);
    syncPrepKitToCloud(company, role, kit).catch((error) => {
      console.warn('Cloud prep kit sync failed:', error.message);
    });
  } catch (error) {
    console.error('Error saving prep kit:', error);
  }
}

// Assembles every locally-stored prep kit as [{ company, role, kit }] for sync.
export async function getAllPrepKits() {
  try {
    const meta = await getAllPrepKitMeta();
    const kits = [];
    for (const entry of meta) {
      const kit = await getPrepKit(entry.company, entry.role);
      if (kit) kits.push({ company: entry.company, role: entry.role || '', kit });
    }
    return kits;
  } catch {
    return [];
  }
}

// Pushes local prep kits up, then pulls any cloud kits missing locally so
// generated kits carry over across devices on login.
export async function syncPrepKitsWithCloud() {
  try {
    await syncLocalPrepKitsToCloud(getAllPrepKits);
    const cloud = await fetchCloudPrepKits();
    for (const { company, role, kit } of cloud) {
      const existing = await getPrepKit(company, role);
      if (!existing) await savePrepKitLocal(company, role, kit);
    }
  } catch (error) {
    console.warn('Cloud prep kit sync failed:', error.message);
  }
}

export async function getPrepKit(company, role) {
  try {
    const key = prepKitKey(company, role);
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    return null;
  }
}

export async function clearPrepKit(company, role) {
  try {
    const key = prepKitKey(company, role);
    await AsyncStorage.removeItem(key);
    const indexJson = await AsyncStorage.getItem(PREP_KIT_INDEX_KEY);
    if (indexJson) {
      const index = JSON.parse(indexJson).filter((i) => i.key !== key);
      await AsyncStorage.setItem(PREP_KIT_INDEX_KEY, JSON.stringify(index));
    }
  } catch (error) {
    console.error('Error clearing prep kit:', error);
  }
}

export async function getAllPrepKitMeta() {
  try {
    const json = await AsyncStorage.getItem(PREP_KIT_INDEX_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    return [];
  }
}

// ─── PrepKit Progress ─────────────────────────────────────────────────────────

function prepKitProgressKey(company, role) {
  const c = company.toLowerCase().trim().replace(/\s+/g, '_');
  const r = (role || '').toLowerCase().trim().replace(/\s+/g, '_');
  return `@chrm_prepkit_progress_${c}${r ? `_${r}` : ''}`;
}

export async function getPrepKitProgress(company, role) {
  try {
    const key = prepKitProgressKey(company, role);
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export async function savePrepKitQuestionAttempt(company, role, question, score) {
  try {
    const key = prepKitProgressKey(company, role);
    const existing = await getPrepKitProgress(company, role);
    existing[question] = { score, timestamp: new Date().toISOString() };
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving prep kit progress:', error);
  }
}
