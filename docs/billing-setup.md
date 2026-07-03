# CHRM Billing Setup — RevenueCat + Stripe

Turns on paid Pro across platforms. Both purchase paths write the **same**
`subscription_entitlements` row, so one subscription unlocks Pro everywhere the
user signs in. The code is already shipped (`server/src/index.js`,
`src/utils/purchases.js`, `src/utils/purchases.web.js`, `src/utils/entitlements.js`);
this is dashboard config + wiring 5 server-only env vars into Vercel.

Prereq: Supabase + Vercel are already configured — see `docs/supabase-setup.md`.

## Status

Updated 2026-07-03:

- **Not configured yet.** `npm run check:billing` fails: both webhook routes
  return `500 "Webhook not configured."`, meaning no billing env vars are on the
  Vercel deploy.
- Entitlement id across all code is **`CHRM Pro`** (`ENTITLEMENT_ID`).
- Pricing: **$7.99/month**, **$59.99/year**.

## Env vars this pass adds (server-only → Vercel Production + Preview)

| Var | Source |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (Secret key) |
| `STRIPE_PRICE_MONTHLY` | Price ID of the $7.99/mo recurring price |
| `STRIPE_PRICE_ANNUAL` | Price ID of the $59.99/yr recurring price |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the `/api/stripe/webhook` endpoint (`whsec_...`) |
| `REVENUECAT_WEBHOOK_SECRET` | Strong random string you set as the RC webhook Authorization header |

Client-side (native only, **public** key — safe in the app bundle, goes in the
Expo `.env`, not Vercel): `REVENUECAT_API_KEY_IOS`.

> Never put `STRIPE_SECRET_KEY`, the webhook secrets, or the Supabase service
> role key in the Expo client `.env`. Server secrets live only in `server/.env`
> and Vercel.

## 1. Stripe dashboard

1. **Product + prices.** Products → Add product “CHRM Pro”. Add **two recurring
   prices**: `$7.99` / month and `$59.99` / year. Copy both **Price IDs**
   (`price_…`) → `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`.
2. **Secret key.** Developers → API keys → copy the **Secret key**
   (`sk_live_…` for prod; `sk_test_…` while testing) → `STRIPE_SECRET_KEY`.
3. **Webhook.** Developers → Webhooks → Add endpoint:
   - URL: `https://chrm-two.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.
4. **Customer Portal.** Settings → Billing → Customer portal → enable it (and
   allow cancellation). Powers the manage/cancel button (`/api/billing/portal`).
5. Promo codes work out of the box — Checkout is created with
   `allow_promotion_codes: true`.

Decide **test vs live** up front: a `sk_test_` key, test Price IDs, and a test
webhook secret all have to come from the same mode. Use test mode for the smoke
test, then swap all four to live values before launch.

## 2. RevenueCat dashboard

1. **Entitlement.** Create/confirm an entitlement with identifier exactly
   **`CHRM Pro`** (must match `ENTITLEMENT_ID` — case sensitive). Attach the iOS
   subscription products/offering to it.
2. **iOS public SDK key.** Project → API keys → copy the **public** Apple SDK key
   (`appl_…`) → the Expo client `.env` as `REVENUECAT_API_KEY_IOS`.
3. **Webhook.** Project → Integrations → Webhooks → Add:
   - URL: `https://chrm-two.vercel.app/api/revenuecat/webhook`
   - **Authorization header**: a strong random secret (this exact string becomes
     `REVENUECAT_WEBHOOK_SECRET`). The backend accepts either the raw value or a
     `Bearer <value>` form.

## 3. Wire env vars into Vercel

Add all 5 server vars for **Production + Preview** on the `chrm` project
(`prj_C2knWNZRzUWphY5nQyqs4VfBZItF`, team `casey's projects`):

```
STRIPE_SECRET_KEY
STRIPE_PRICE_MONTHLY
STRIPE_PRICE_ANNUAL
STRIPE_WEBHOOK_SECRET
REVENUECAT_WEBHOOK_SECRET
```

Either the Vercel dashboard (Settings → Environment Variables), or the CLI once
re-authed:

```bash
npx vercel login
npx vercel link           # select team "casey's projects" → project "chrm"
# per var, Production + Preview:
printf '%s' "<value>" | npx vercel env add STRIPE_SECRET_KEY production
printf '%s' "<value>" | npx vercel env add STRIPE_SECRET_KEY preview
# …repeat for the other four…
```

Also mirror them into local `server/.env` if you run the backend locally.

**Redeploy** the latest `main` production deployment so the new env vars take
effect (env changes don't apply to existing deployments).

## 4. Verify

```bash
npm run check:billing
```

Expected once configured + redeployed:

```text
Checking billing endpoints on https://chrm-two.vercel.app
OK POST /api/stripe/webhook is configured (rejects bad input with 400)
OK POST /api/revenuecat/webhook is configured (rejects bad input with 401)
OK POST /api/checkout/session rejects missing auth
OK POST /api/billing/portal rejects missing auth
Billing endpoint checks passed. Run a live sandbox purchase to confirm entitlement upserts.
```

Then live smoke tests:

**Web (Stripe):**
1. `npm run build:web` → `npx serve dist -l 4321` → open `http://localhost:4321`.
2. Account & Sync → sign in (magic link).
3. Open the paywall → subscribe with a Stripe **test card** `4242 4242 4242 4242`.
4. Confirm the `subscription_entitlements` row flips to `status = active` with a
   `stripe_customer_id`, and Pro unlocks (Mock Interview / HireVue / Prep Kit).
5. Account & Sync → manage subscription → confirm the Stripe billing portal opens.

**iOS (RevenueCat):**
1. TestFlight/dev build, sign in (so `Purchases.logIn(userId)` ties RC to the
   Supabase id), buy with a sandbox account.
2. Confirm a `subscription_entitlements` row with `revenuecat_app_user_id`.
3. Sign in on **web** with the same account → Pro is unlocked there too
   (cross-platform reconcile).

## Done when

`npm run check:billing` passes and a sandbox purchase on either platform writes
an `active` `subscription_entitlements` row that unlocks Pro on the other.
