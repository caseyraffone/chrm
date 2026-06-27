# CHRM Commercial Build — Goal & Loop

## /goal — The Directive

```
GOAL: Evolve CHRM from a single iOS app into a commercial-grade product
available as both a polished iOS app and a web app, without breaking or
deprioritizing the current App Store submission in progress.

NON-NEGOTIABLE CONSTRAINTS:
- Do not touch App Store submission files, RevenueCat config, or
  app.config.js unless explicitly asked. That track is separate and
  currently blocking everything else.
- Reuse existing logic wherever possible (src/utils/api.js, storage.js,
  purchases.js, existing screens). Propose changes, don't silently rewrite.
- Casey works in short weekend sessions. Every unit must be finishable
  (build + test) in under 3 hours.
- iOS and web should share business logic (API calls, scoring, prompts).
  Do not duplicate prompt logic between two codebases.
```

---

## The Session Loop (run every subsequent session)

```
Read GOAL.md "Current Phase" section and CLAUDE.md before doing anything.

1. Tell me in 3-5 bullets what's done, in progress, and next — confirm it
   matches my understanding before proceeding.
2. Pick ONE unit of work from the current phase, sized for this session.
   State it back as a one-line goal.
3. Implement it.
4. Run/test it yourself (don't just say "should work").
5. Update the "Current Phase" section below with what changed and what's next.
6. Stop. Don't cascade into the next unit without me confirming.
```

---

## PHASE 0 PLAN — for Casey's review *(no code written yet)*

### 1. Web app architecture recommendation

**Recommendation: build a shared backend FIRST, then ship the web app as React
Native Web reusing the Expo codebase — with a separate lightweight marketing
site for SEO.**

The "RN-Web vs separate Next.js" question is partly a false choice, because
*both_ options require the same prerequisite: a backend. Two forces make a
backend non-optional:

- **Security (the big one):** today both API keys are bundled into the client
  (`app.config.js` → `extra` → `@env`, used directly in `src/utils/api.js`).
  Anyone can extract them from a shipped build and run up your OpenAI/Anthropic
  bill. This must be fixed for *any* commercial release, iOS or web.
- **Logic sharing:** the constraint says don't duplicate prompt/scoring logic.
  The clean way to share it across iOS + web is to move `api.js`'s Claude/Whisper
  calls and prompts into backend endpoints both clients call. Then the web client
  is thin and the RN-Web-vs-Next.js decision is about UI only, not logic.

Once the backend owns the AI logic, the two web options compare like this:

| | **React Native Web (reuse Expo)** ✅ recommended | **Separate Next.js app** |
|---|---|---|
| Logic reuse | Automatic — same screens/components | Must re-call backend; UI rebuilt from scratch |
| Time to first web release | Fast (weeks) | Slow (forks the whole UI) |
| Fit with weekend sessions | Good — incremental | Poor — large upfront rebuild |
| Web UX / SEO | SPA, weaker SEO | Best-in-class SSR/SEO |
| Audio recording | Needs a web `MediaRecorder` shim (expo-av recording is weak on web) | Native web audio, easy |
| Payments | RevenueCat RN doesn't run on web → need Stripe/RC Web Billing | Same need, but easier to wire |

**Why RN-Web wins for CHRM specifically:** Casey's time is the scarcest resource,
and RN-Web reuses the most while respecting "don't duplicate logic." The two real
RN-Web weaknesses are contained: transcription already happens server-side (only
the *recording* component is platform-specific — a small `MediaRecorder` shim
behind the same interface as expo-av), and payments need a web layer either way.
SEO is the one thing RN-Web is genuinely bad at — so carve out a **separate
lightweight marketing/landing site** (static or minimal Next) for SEO and
top-of-funnel, while the authenticated app is RN-Web. Hybrid, not either/or.

A full separate Next.js app is the wrong call now: it forks the UI, breaks the
weekend-chunk model, and risks exactly the duplicated prompt logic the constraints
forbid.

### 2. What "commercial-grade" requires that CHRM doesn't have yet

Ordered roughly by severity:

1. **Backend proxy for AI calls (critical/security).** Keys must move off the
   client. Without this, a public launch is a financial liability.
2. **Rate limiting + abuse protection.** A public/web endpoint without per-user
   throttling is an open invoice to OpenAI/Anthropic.
3. **Accounts + cloud data.** All state (drills, rep count, prep kits) lives in
   device-local AsyncStorage. No accounts = no cross-device, no web/iOS sync, no
   foundation for web payments. Needed before web is actually useful.
4. **Web payments.** RevenueCat's RN SDK is mobile-only; web needs Stripe Checkout
   or RevenueCat Web Billing, gated by the same entitlement model.
5. **Error monitoring** (e.g. Sentry) — currently only `console.error`.
6. **Product analytics** (e.g. PostHog/Amplitude) — currently none; needed to
   understand funnel/retention for a commercial product.
7. **ToS / Privacy Policy + data-handling infra** — required by App Store, Stripe,
   and GDPR/CCPA; especially since we send user audio/transcripts to third parties.
8. **Observability + cost controls** — logging, per-user cost visibility, alerting.
9. **CI / automated checks** — currently manual bundle checks only.

### 3. Phased roadmap (weekend-sized units, each < 3 hrs)

**Phase 1 — Backend foundation** *(unblocks security, web, and logic-sharing)*
- 1a. Decide backend host + stack (serverless: Vercel / Cloudflare Workers /
  Expo API routes vs small Node service). *Decision needed from Casey.*
- 1b. Stand up the backend skeleton + one proxied endpoint (`/transcribe`),
  keys living only as server env vars.
- 1c. Port the remaining Claude calls (feedback, questions, prep kit, mock turn,
  HireVue, technical grading) into backend endpoints, keeping request/response
  shapes identical so client `api.js` becomes thin fetch wrappers.
- 1d. Point iOS `api.js` at the backend; remove keys from the client bundle;
  verify the app still works end-to-end.
- 1e. Add per-user/IP rate limiting + a simple abuse guard.

**Phase 2 — Accounts & cloud sync** *(prereq for web value + web payments)*
- 2a. Choose auth/data provider (Supabase / Firebase / Clerk). *Decision needed.*
- 2b. Add auth to the iOS app (keep guest mode working).
- 2c. Move drills / rep count / prep kits to backend storage keyed by user,
  with AsyncStorage as a local cache; migrate existing local data on upgrade.

**Phase 3 — Web app (React Native Web)**
- 3a. Get `expo start --web` building; fix responsive layout basics.
- 3b. Web audio-recording component (`MediaRecorder`) behind the same interface
  the app uses for expo-av.
- 3c. Web auth + history via the Phase 2 backend.
- 3d. Web payments (Stripe Checkout or RC Web Billing) gated by the shared
  entitlement check.

**Phase 4 — Commercial hardening**
- Sentry, analytics, ToS/Privacy pages, structured logging + cost alerts, CI.

**Phase 5 — Marketing site + SEO**
- Lightweight static/Next landing site for top-of-funnel and SEO.

**Sequencing logic:** backend first (fixes the security liability *and* unblocks
both web and logic-sharing), then accounts (needed before web is useful and
before web payments), then the web client, then hardening, then growth.

### Decisions (made 2026-06-27 — Casey delegated these to Claude)
- **Backend host/stack: Vercel serverless functions, plain JS (Node).** Lowest-
  friction API proxy, git-push deploy, generous free tier, and the natural home
  for the Phase 5 marketing site (no second platform). JS to match the codebase.
- **Auth + data: Supabase.** Auth + Postgres + storage + RLS in one dashboard;
  CHRM's data is clean relational data. Fewer providers than Clerk (auth-only) and
  less lock-in/NoSQL friction than Firebase.
- **Web payments: RevenueCat Web Billing.** Keeps ONE entitlement system across
  iOS + web (iOS already uses RevenueCat); reuses the existing `purchases.js`
  entitlement model. RC Web Billing runs on Stripe under the hood.

Architecture summary: Vercel functions (compute/proxy) validate Supabase JWTs and
use the Supabase service role for privileged reads; RevenueCat is the single
source of entitlement truth across platforms.

---

## Current Phase

**Status:**
- Backend (Phase 1b): `server/` skeleton + `/transcribe` Whisper proxy built &
  tested; standalone (client not wired). Awaiting Vercel deploy by Casey.
- Analytics foundation: `src/utils/analytics.js` added — PII-free PostHog-over-
  HTTPS tracker (no native SDK, no build/app.config impact, no-ops without a key).
  Wired into the funnel: app_opened, onboarding (started/intent/role/skipped/
  completed), drill_completed (category+score+role, never transcript), and
  paywall (shown/purchase_tapped/subscription_purchased). Bundles clean.

Casey's chosen build order: (1) analytics ✅ → (3) deepen interview-prep content
→ (4) backend Phase 1c → (2) onboarding/paywall conversion LAST (research-heavy,
to be tuned with real data).

**Last updated:** 2026-06-27 (by Claude)
**Next session should:**
1. Casey: deploy `server/` to Vercel (root dir `server`, set OPENAI/ANTHROPIC
   keys), smoke-test `/api/health`. And to turn analytics on, add
   `POSTHOG_API_KEY` (+ optional `POSTHOG_HOST`) to `.env` / the web session env.
2. Then build next: deepen interview-prep content (IB Technical → 150+, expand
   Behavioral/Fit/Markets, and/or stand up the first non-IB vertical, e.g. PE).
3. Hold unit 1d (point client at backend + strip keys) until Casey confirms —
   touches app.config.js (constraint-protected) and needs a device test.

**App Store / privacy reminder:** analytics now means the submission must declare
data collection in Apple's App Privacy section and needs a Privacy Policy URL.
Events are PII-free (no transcripts/names/emails) — keep it that way.

---

### Overnight A-grade push (2026-06-27, by Claude)

Done in this run (all pushed to main, each bundles clean):
- **Grading overhaul** (`src/utils/api.js`): one calibrated SCORING_RUBRIC across
  every mode; insufficient-answer guard; tolerant JSON parsing + score clamping;
  shared callClaude with retry; per-category guidance; richer mock-interview
  persona; category-aware HireVue debrief. All return shapes unchanged.
- **Content → 242 curated questions:** IB Technical 116→151 (+Capital Markets &
  IPOs, +Restructuring); IB Behavioral→24 (+Ethics & Judgment); Fit→19;
  Markets→15; **new PE vertical** (LBO & Modeling, Deal Sense, Technical, Fit;
  33 Qs) flipped active.
- **Per-question mastery tracking:** best score + attempts per bank item; "BEST
  n/10" pills and an "X of N practiced" line in the question bank.
- **Analytics:** free funnel + premium completions (mock, HireVue, prep kit,
  resume) instrumented; PII-free; no-ops without a PostHog key.

Next opportunities (not yet done): point client at the backend + strip keys
(unit 1d, needs sign-off — touches app.config.js); add the remaining verticals
(S&T, ER, Consulting); onboarding/paywall conversion pass (deferred by Casey
until there's data); device-test the PDF resume upload.

> Note: a separate, already-shipped track in this repo expanded the IB Interview
> Prep banks (116 technical Qs + Behavioral/Fit/Markets tracks). That is unrelated
> to the commercial build and did not touch App Store / RevenueCat / app.config.js.
