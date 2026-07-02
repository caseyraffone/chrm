// Web build of the purchases adapter.
//
// RevenueCat's mobile SDKs (`react-native-purchases` / `-ui`) have no web
// support, so this stub stands in for them on the web target. Metro resolves
// this file over `purchases.js` automatically when bundling for web.
//
// Purchasing on web goes through Stripe Checkout: the backend creates a
// subscription Checkout Session, we redirect the browser to it, and Stripe's
// webhook writes the account entitlement (subscription_entitlements) that the
// reconcile logic reads back — the same table the RevenueCat webhook writes, so
// Pro unlocks across web and mobile from one source of truth.

import { API_BASE_URL } from '@env';
import { getSubscriptionStatus, setSubscriptionStatus } from './storage';
import { getCurrentSession } from './supabase';

const API_BASE = (API_BASE_URL || 'https://chrm-two.vercel.app').replace(/\/$/, '');

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
 * Web paywall via Stripe Checkout. Requires a signed-in account (so the
 * purchase attaches to the user id). Creates a Checkout Session on the backend
 * and redirects the browser to Stripe. On return, entitlement reconciliation
 * unlocks Pro — so this navigates away rather than resolving to `true`.
 *
 * @param {'monthly'|'annual'} plan
 */
export async function presentPaywall(plan = 'annual') {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Please sign in first (Account & Sync) so your subscription is saved to your account.');
    }
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/api/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        plan,
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      throw new Error(body.error || 'Could not start checkout.');
    }
    if (typeof window !== 'undefined') {
      window.location.href = body.url;
    }
    return false; // redirecting; Pro unlocks on return via reconcile
  } catch (error) {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(error.message || 'Checkout is unavailable right now.');
    }
    return false;
  }
}

/**
 * Opens the Stripe billing portal so web subscribers can manage or cancel.
 * Redirects the browser; falls back to a notice if there's no web subscription.
 */
export async function presentCustomerCenter() {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Sign in to manage your subscription.');
    }
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/billing/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      throw new Error(body.error || 'No web subscription to manage.');
    }
    if (typeof window !== 'undefined') {
      window.location.href = body.url;
    }
  } catch (error) {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(error.message || 'Billing management is unavailable right now.');
    }
  }
}

// No RevenueCat SDK on web. Entitlement here comes from the account-level
// subscription_entitlements row (see utils/entitlements.js), populated by the
// RevenueCat webhook — so a mobile purchase still unlocks Pro in the browser.
export async function linkUser() {}
export async function unlinkUser() {}
