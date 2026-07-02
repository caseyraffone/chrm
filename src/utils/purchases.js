import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { REVENUECAT_API_KEY_IOS } from '@env';
import { setSubscriptionStatus } from './storage';

// RevenueCat public API keys — safe to embed in the app bundle.
const API_KEYS = {
  ios: REVENUECAT_API_KEY_IOS,
  // android: 'YOUR_REVENUECAT_ANDROID_KEY',
};

// Must match the entitlement identifier in the RevenueCat dashboard.
export const ENTITLEMENT_ID = 'CHRM Pro';

/**
 * Call once on app launch before any other Purchases calls.
 */
export function initializePurchases() {
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (!apiKey) {
    console.warn('[RevenueCat] No API key for platform:', Platform.OS);
    return;
  }

  Purchases.configure({ apiKey });
}

/**
 * Fetches the latest customer info from RevenueCat and syncs the result
 * into AsyncStorage so the rest of the app can read it synchronously.
 * Returns true if the user has an active Pro entitlement.
 */
export async function syncSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    await setSubscriptionStatus(isPro ? 'pro' : 'free');
    return isPro;
  } catch (error) {
    console.error('[RevenueCat] syncSubscriptionStatus error:', error);
    return false;
  }
}

/**
 * Lightweight entitlement check without writing to storage.
 * Use for one-off checks when you need a real-time answer.
 */
export async function checkProEntitlement() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}

/**
 * Registers a listener that automatically syncs subscription status
 * whenever RevenueCat detects a customer info change (e.g. renewal,
 * cancellation, billing retry). Call this once after initialization.
 * Returns the remove function — call it on cleanup.
 */
export function addSubscriptionListener() {
  return Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
    const isPro = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    await setSubscriptionStatus(isPro ? 'pro' : 'free');
  });
}

// ─── Paywall UI ──────────────────────────────────────────────────────────────
// Wrappers around the native RevenueCat paywall UI. PaywallScreen imports these
// instead of `react-native-purchases-ui` directly so the screen stays
// platform-agnostic — `purchases.web.js` provides browser equivalents.

/**
 * Presents the native RevenueCat paywall. Resolves to `true` if the user
 * purchased or restored an entitlement, `false` otherwise.
 */
export async function presentPaywall() {
  const result = await RevenueCatUI.presentPaywall();
  const success =
    result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  if (success) await syncSubscriptionStatus();
  return success;
}

/**
 * Opens the RevenueCat Customer Center (manage / restore purchases), then
 * re-syncs entitlement status in case a restore happened inside it.
 */
export async function presentCustomerCenter() {
  await RevenueCatUI.presentCustomerCenter();
  await syncSubscriptionStatus();
}

// ─── Cross-platform identity ─────────────────────────────────────────────────
// Aliasing the RevenueCat customer to the Supabase user id ties every purchase
// to the account, so entitlements follow the user across devices and platforms
// (and the backend webhook can attribute events to the right account).

/**
 * Links the RevenueCat identity to the signed-in Supabase user. Call on login.
 */
export async function linkUser(userId) {
  if (!userId) return;
  try {
    await Purchases.logIn(userId);
    await syncSubscriptionStatus();
  } catch (error) {
    console.warn('[RevenueCat] linkUser failed:', error.message);
  }
}

/**
 * Resets RevenueCat to an anonymous identity on sign-out so the next user
 * doesn't inherit the previous account's entitlements on this device.
 */
export async function unlinkUser() {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.warn('[RevenueCat] unlinkUser failed:', error.message);
  }
}
