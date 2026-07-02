// Web build of the purchases adapter.
//
// RevenueCat's mobile SDKs (`react-native-purchases` / `-ui`) have no web
// support, so this stub stands in for them on the web target. Metro resolves
// this file over `purchases.js` automatically when bundling for web.
//
// Full parity TODO: replace these stubs with RevenueCat Web Billing
// (https://www.revenuecat.com/docs/web/web-billing) so browser users can
// subscribe. Until then, web treats everyone as "free" and the paywall
// buttons surface a "not yet available on web" notice.

import { getSubscriptionStatus, setSubscriptionStatus } from './storage';

// Must match the entitlement identifier in the RevenueCat dashboard.
export const ENTITLEMENT_ID = 'CHRM Pro';

/** No native SDK to configure on web. */
export function initializePurchases() {
  // no-op on web
}

/**
 * On web we don't have a RevenueCat customer; fall back to whatever status is
 * already persisted (defaults to "free"). Returns true if Pro.
 */
export async function syncSubscriptionStatus() {
  const status = await getSubscriptionStatus();
  const isPro = status === 'pro';
  // Normalize so downstream gating always has a concrete value.
  await setSubscriptionStatus(isPro ? 'pro' : 'free');
  return isPro;
}

/** Lightweight check mirroring the native adapter. */
export async function checkProEntitlement() {
  const status = await getSubscriptionStatus();
  return status === 'pro';
}

/** No customer-info stream on web; return a no-op unsubscribe. */
export function addSubscriptionListener() {
  return () => {};
}

/**
 * Web paywall. No checkout is wired up yet — return false so callers keep the
 * user gated. Replaced by RevenueCat Web Billing / Stripe checkout in the
 * parity phase.
 */
export async function presentPaywall() {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert('Subscriptions are coming to the web app soon. For now, subscribe in the CHRM mobile app.');
  }
  return false;
}

/** Web Customer Center placeholder. */
export async function presentCustomerCenter() {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert('Manage your subscription in the CHRM mobile app for now.');
  }
}

// No RevenueCat SDK on web. Entitlement here comes from the account-level
// subscription_entitlements row (see utils/entitlements.js), populated by the
// RevenueCat webhook — so a mobile purchase still unlocks Pro in the browser.
export async function linkUser() {}
export async function unlinkUser() {}
