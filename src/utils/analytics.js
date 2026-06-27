// ─── Analytics ─────────────────────────────────────────────────────────────────
//
// Provider-agnostic, PII-free event tracking. Sends events to PostHog over plain
// HTTPS (its project key is a public, write-only ingestion key — safe to ship,
// like the RevenueCat public key). No native SDK, no config plugin, no build
// changes: this cannot affect the App Store build.
//
// It NO-OPS silently until POSTHOG_API_KEY is set in .env, so the app behaves
// identically with or without analytics configured. Every call is wrapped so
// analytics can never throw into the UI.
//
// Rule we keep: events only, never PII. Track "drill_completed, score 7,
// category Technical" — never transcripts, answers, names, or emails.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { POSTHOG_API_KEY, POSTHOG_HOST } from '@env';

const DISTINCT_ID_KEY = '@chrm_analytics_id';
const HOST = (POSTHOG_HOST && POSTHOG_HOST.trim()) || 'https://us.i.posthog.com';
const ENABLED = Boolean(POSTHOG_API_KEY && POSTHOG_API_KEY.trim());

// Canonical event names. Keep this list as the single source of truth so the
// funnel stays consistent and typo-free across screens.
export const EVENTS = {
  APP_OPENED: 'app_opened',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_INTENT_SELECTED: 'onboarding_intent_selected',
  ONBOARDING_ROLE_SUBMITTED: 'onboarding_role_submitted',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  DRILL_COMPLETED: 'drill_completed',
  PAYWALL_SHOWN: 'paywall_shown',
  PAYWALL_PURCHASE_TAPPED: 'paywall_purchase_tapped',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
};

let distinctId = null;
let initPromise = null;

function generateId() {
  return (
    'anon_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 10)
  );
}

// Lazily loads (or creates) a stable anonymous id so events tie to one device
// across sessions without requiring accounts. Safe to call repeatedly.
function ensureInit() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      let id = await AsyncStorage.getItem(DISTINCT_ID_KEY);
      if (!id) {
        id = generateId();
        await AsyncStorage.setItem(DISTINCT_ID_KEY, id);
      }
      distinctId = id;
    } catch {
      distinctId = distinctId || generateId();
    }
    return distinctId;
  })();
  return initPromise;
}

async function send(payload) {
  if (!ENABLED) return;
  try {
    await fetch(`${HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Never let analytics failures surface to the user.
  }
}

// Call once on app launch. Pre-warms the distinct id; harmless if analytics is
// disabled.
export async function initAnalytics() {
  await ensureInit();
}

// Track a named event with optional PII-free properties.
export async function track(event, properties = {}) {
  if (!ENABLED) return;
  const id = await ensureInit();
  await send({
    api_key: POSTHOG_API_KEY,
    event,
    distinct_id: id,
    properties: { ...properties, $lib: 'chrm-rn' },
    timestamp: new Date().toISOString(),
  });
}

// Attach person-level properties (e.g. subscription status) to the current id.
// Properties must stay non-PII.
export async function identify(properties = {}) {
  if (!ENABLED) return;
  const id = await ensureInit();
  await send({
    api_key: POSTHOG_API_KEY,
    event: '$identify',
    distinct_id: id,
    properties: { $set: properties, $lib: 'chrm-rn' },
    timestamp: new Date().toISOString(),
  });
}
