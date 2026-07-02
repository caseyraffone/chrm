// Account-level entitlement resolution.
//
// The `subscription_entitlements` table (written by the RevenueCat webhook) is
// the cross-platform source of truth for Pro. Reading it lets a purchase made
// on one platform unlock Pro on another — most importantly, it lets the web
// app (which has no RevenueCat SDK) recognize a subscription bought on mobile.

import { Platform } from 'react-native';
import { supabase, getCurrentUser, isSupabaseConfigured } from './supabase';
import { setSubscriptionStatus } from './storage';

/** Fetches the signed-in user's entitlement row, or null. */
export async function fetchCloudEntitlement() {
  if (!isSupabaseConfigured || !supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('subscription_entitlements')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

/** True if the row grants an active, unexpired entitlement. */
export function entitlementIsActive(row) {
  if (!row) return false;
  if (row.status !== 'active' && row.status !== 'pro') return false;
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return false;
  return true;
}

/**
 * Reconciles the account entitlement into local subscription status.
 *
 * On web the account row is authoritative (no store SDK), so we set pro/free
 * directly. On native, RevenueCat remains the source of truth for this device's
 * store purchases, so we only ever *upgrade* from the cloud — this is what makes
 * a web/Stripe purchase light up Pro in the app without letting a stale cloud
 * row clobber a fresh StoreKit purchase.
 *
 * Returns true if the user is Pro after reconciliation.
 */
export async function reconcileCloudEntitlement() {
  try {
    const row = await fetchCloudEntitlement();
    const active = entitlementIsActive(row);
    if (Platform.OS === 'web') {
      await setSubscriptionStatus(active ? 'pro' : 'free');
      return active;
    }
    if (active) {
      await setSubscriptionStatus('pro');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Entitlement reconcile failed:', error.message);
    return false;
  }
}
