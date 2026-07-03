#!/usr/bin/env node

// Verifies the deployed billing plumbing (RevenueCat + Stripe) the same way
// check-supabase.mjs verifies the account/sync plumbing: it probes the live
// Vercel endpoints and asserts each one is *configured*, not just reachable.
//
// The tell is the "not configured" 500s: with no secret set, both webhook
// routes short-circuit to `500 {"error":"Webhook not configured."}`. Once the
// matching secret is present in Vercel (and the deployment is redeployed), the
// route instead reaches signature/auth checking:
//   - /api/stripe/webhook   -> 400 "Signature verification failed" (bogus sig)
//   - /api/revenuecat/webhook -> 401 "Unauthorized." (wrong auth header)
// The auth-gated routes (checkout/session, billing/portal) must reject missing
// auth with 401 regardless of billing config.
//
// This does NOT need any secrets locally — it only reads the deployed behavior,
// so it's safe to run anywhere. Set API_BASE_URL to point at a different deploy.

const apiBase = (process.env.API_BASE_URL || 'https://chrm-two.vercel.app').replace(/\/$/, '');

async function post(path, { headers = {}, body = '{}' } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
  const json = await response.json().catch(() => ({}));
  return { status: response.status, json };
}

function fail(message) {
  throw new Error(message);
}

// A webhook route is "configured" once it stops returning the not-configured 500.
function assertWebhookConfigured(name, { status, json }, expectStatus) {
  const notConfigured = status === 500 && /not configured/i.test(json.error || '');
  if (notConfigured) {
    fail(`${name}: secret not set on the deploy (got 500 "${json.error}"). Add the env var in Vercel and redeploy.`);
  }
  if (status !== expectStatus) {
    fail(`${name}: expected ${expectStatus} once configured, got ${status}: ${JSON.stringify(json)}`);
  }
  console.log(`OK ${name} is configured (rejects bad input with ${status})`);
}

function assertAuthGated(name, { status, json }) {
  if (status !== 401) {
    fail(`${name}: expected 401 without a token, got ${status}: ${JSON.stringify(json)}`);
  }
  console.log(`OK ${name} rejects missing auth`);
}

try {
  console.log(`Checking billing endpoints on ${apiBase}`);

  // Stripe webhook: bogus signature. Configured -> 400 (sig verify), not 500.
  assertWebhookConfigured(
    'POST /api/stripe/webhook',
    await post('/api/stripe/webhook', { headers: { 'stripe-signature': 't=0,v1=deadbeef' } }),
    400
  );

  // RevenueCat webhook: wrong Authorization. Configured -> 401, not 500.
  assertWebhookConfigured(
    'POST /api/revenuecat/webhook',
    await post('/api/revenuecat/webhook', { headers: { authorization: 'Bearer wrong-secret' } }),
    401
  );

  // Auth-gated billing routes must reject missing tokens.
  assertAuthGated('POST /api/checkout/session', await post('/api/checkout/session'));
  assertAuthGated('POST /api/billing/portal', await post('/api/billing/portal'));

  console.log('Billing endpoint checks passed. Run a live sandbox purchase to confirm entitlement upserts.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
