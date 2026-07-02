# CHRM Supabase Setup

Use this when turning on accounts, cloud drill sync, and account deletion.

## Current Vercel Project

- Team: `casey's projects` / `team_VTDyDbA5p1o6z4eOTfqZImYd`
- Project: `chrm` / `prj_C2knWNZRzUWphY5nQyqs4VfBZItF`
- Production app/API: `https://chrm-two.vercel.app`

## 1. Create Supabase Project

1. Create a new Supabase project named `chrm`.
2. In Supabase SQL Editor, run the full contents of `supabase/schema.sql`.
3. In Authentication settings, keep Email provider enabled.
4. Add redirect URLs:
   - `https://chrm-two.vercel.app`
   - `http://localhost:4321`
   - `http://localhost:8081`
   - any Expo/native deep link added later for production mobile auth.

## 2. Copy Keys

From Supabase Project Settings > API:

- Project URL -> `SUPABASE_URL`
- Publishable/anon key -> `SUPABASE_ANON_KEY`
- Service role key -> `SUPABASE_SERVICE_ROLE_KEY`

Important: `SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not put it in the Expo client `.env`.

## 3. Set Local Env

Client `.env`:

```bash
API_BASE_URL=https://chrm-two.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ey...
```

Server `server/.env`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

## 4. Set Vercel Env Vars

In Vercel > `chrm` > Settings > Environment Variables, add for Production and Preview:

```bash
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`OPENAI_API_KEY` and `ANTHROPIC_API_KEY` should already exist. Keep them.

After adding env vars, redeploy the latest `main` deployment.

## 5. Verify

Run:

```bash
npm run check:supabase
```

Expected result:

```text
OK profiles
OK drill_sessions
OK prep_kits
OK hirevue_sessions
OK subscription_entitlements
OK https://chrm-two.vercel.app/api/account rejects missing auth
Supabase schema and account-delete route checks passed.
```

Then smoke-test in the browser:

1. `npm run build:web`
2. `npx serve dist -l 4321`
3. Open `http://localhost:4321`
4. Go to Account & Sync.
5. Send a magic link.
6. Complete sign-in.
7. Do one free drill.
8. Click Sync Progress.
9. Confirm a row appears in Supabase `drill_sessions`.
10. Test Delete account with a throwaway user.

## 6. Cross-platform subscriptions (RevenueCat webhook)

Entitlements are unified through the `subscription_entitlements` table so a
purchase on any platform unlocks Pro on the account. The plumbing is already in
the code:

- On sign-in the app calls `Purchases.logIn(supabaseUserId)` so the RevenueCat
  app user id **is** the Supabase user id (`src/utils/purchases.js`).
- The backend exposes `POST /api/revenuecat/webhook`, which validates a shared
  secret and upserts the account's entitlement (`server/src/index.js`).
- Clients read the account entitlement and reconcile it into local Pro status
  (`src/utils/entitlements.js`) — this is what lets the **web** app recognize a
  subscription bought on mobile even though it has no RevenueCat SDK.

To turn it on:

1. In RevenueCat, set the entitlement identifier to `CHRM Pro` (matches
   `ENTITLEMENT_ID`).
2. RevenueCat → Project → Integrations → **Webhooks**: URL
   `https://chrm-two.vercel.app/api/revenuecat/webhook`, and set the
   **Authorization header** to a strong random secret.
3. Add that same value as `REVENUECAT_WEBHOOK_SECRET` in `server/.env` and in
   Vercel env vars, then redeploy.
4. Test a sandbox purchase and confirm a row lands in
   `subscription_entitlements`, then that Pro unlocks after signing in on the web.

## 7. Web checkout (Stripe)

Browser users subscribe through Stripe Checkout; Stripe's webhook writes the same
`subscription_entitlements` table, so Pro stays unified with mobile. Wiring is in
the code (`/api/checkout/session`, `/api/stripe/webhook`, `/api/billing/portal`;
`src/utils/purchases.web.js`).

To turn it on:

1. In Stripe, create a **product** with two recurring prices: $7.99/month and
   $59.99/year. Copy the two Price IDs.
2. Stripe → Developers → **Webhooks**: add endpoint
   `https://chrm-two.vercel.app/api/stripe/webhook`, subscribe to
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the signing secret.
3. Add server env vars (local `server/.env` **and** Vercel):
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`,
   `STRIPE_WEBHOOK_SECRET`. Redeploy.
4. Enable the Stripe **Customer Portal** (Settings → Billing) so the manage/cancel
   button works.
5. Test: sign in on web → open the paywall → subscribe with a Stripe test card →
   confirm a `subscription_entitlements` row flips to `active` and Pro unlocks.

Note: the client sends its own `window.location.origin` for the Checkout
success/return URLs, so the web app can live on any domain; `WEB_APP_URL` is only
a fallback.

## Done when

Both purchase paths (iOS via RevenueCat, web via Stripe) write the same account
entitlement, and signing in on any device/browser unlocks Pro — one subscription,
everywhere.
