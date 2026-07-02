# CHRM — AI Communication Coach

**Tagline:** Clear. Confident. Under Pressure.

## Current Handoff — Updated 2026-07-02

**The commercialization arc (accounts → sync → cross-platform subscriptions) is
code-complete on `main`.** All of it compiles and web-builds clean; what's left
is dashboard configuration (Supabase, RevenueCat, Stripe) — no code is blocked.
Full setup checklist: `docs/supabase-setup.md`. Verify with `npm run check:supabase`.

What's built:
- **Accounts** (Codex): Supabase magic-link auth (`src/utils/supabase.js`),
  `AccountScreen`, `DELETE /api/account`, `supabase/schema.sql` + RLS.
- **Cloud sync — all progress** (`src/utils/cloudSync.js` + `storage.js`): drills,
  prep kits, and HireVue sessions sync. `saveX` pushes on save; `syncAllWithCloud()`
  merges on login (guest→account) — wired into `App.js` auth listener + the
  AccountScreen Sync button.
- **Cross-platform entitlements** (`src/utils/entitlements.js`, `purchases.js`,
  `server/src/index.js`): `Purchases.logIn(userId)` ties RevenueCat's app_user_id
  to the Supabase id; `POST /api/revenuecat/webhook` writes `subscription_entitlements`;
  clients reconcile that row into local Pro (authoritative on web, upgrade-only on
  native).
- **Stripe web checkout** (`purchases.web.js`, `server/src/index.js`): browser
  subscriptions via `POST /api/checkout/session`, recorded by `POST /api/stripe/webhook`
  into the SAME entitlement table; `POST /api/billing/portal` for manage/cancel.
  PaywallScreen threads the plan ('monthly'/'annual'); native ignores it.

Invariants to preserve:
- Guest mode must keep working; sign-in merges local history into the cloud.
- Service-role / Stripe / webhook secrets live ONLY in `server/.env` / Vercel —
  never in the Expo client `.env`.
- `subscription_entitlements` is the single source of truth for Pro across
  platforms; both the RevenueCat and Stripe webhooks upsert into it.

Next likely steps:
1. Run the Supabase + RevenueCat + Stripe dashboard setup in `docs/supabase-setup.md`
   (create project, run schema, set env vars, register webhooks), then verify sync
   and both purchase paths live.
2. Marketing site polish — the root `/` page still needs the design pass discussed
   with Casey (only `/finance-interview-prep` was revamped).
3. Optional: Sign in with Apple / Google (Apple requires Sign in with Apple if any
   third-party login is offered on iOS).

## Git Workflow

**Always work on `main`.** Commit and push directly to `main` — do not create feature branches unless explicitly asked. Before making changes, ensure you're on main and it's up to date.

A React Native / Expo app that helps students and young professionals practice high-stakes communication through AI-powered voice drills, mock interviews, and company-specific prep kits.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native + Expo (SDK 55) |
| Navigation | React Navigation — native stack |
| Audio Recording | `expo-av` (native) / browser `MediaRecorder` (web) via `recorder.js` split |
| Transcription | OpenAI Whisper API (`whisper-1`) — through the backend proxy |
| AI (feedback, questions, mock interview) | Anthropic Claude (`claude-sonnet-4-6`) — through the backend proxy |
| Monetization | RevenueCat (`react-native-purchases`) on iOS + Stripe Checkout on web; unified via `subscription_entitlements` |
| Accounts / cloud sync | Supabase (magic-link auth + Postgres + RLS) with AsyncStorage as offline cache |
| Fonts | Bebas Neue (wordmark), Space Grotesk (UI headings), DM Sans (body) via `@expo-google-fonts` |
| Env vars | `react-native-dotenv` → import from `@env` |

---

## Running the App

```bash
source ~/.nvm/nvm.sh   # Node is installed via NVM — required in Bash tool
npx expo start         # Start dev server
```

> Node v20.20.0 via NVM. Not in default PATH — always source NVM first.

---

## Remote Development (Claude Code on Web)

When running in a remote cloud container, the `.env` file does not exist — it's gitignored and never cloned. API calls will fail silently until it's created.

A session-start hook writes `.env` automatically from environment variables set in the Claude Code web session config. The required env vars are `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`.

If the hook isn't set up yet, create `.env` manually:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Project Structure

```
chrm/
├── App.js                          # Entry point: font loading, onboarding gate, nav setup
├── app.config.js                   # Expo config — injects env vars into `extra`
├── babel.config.js                 # Expo preset + react-native-dotenv plugin
├── .env                            # API keys (never commit — gitignored)
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.js         # First-launch walkthrough (3 steps: welcome → intent → role)
│   │   ├── HomeScreen.js               # Dashboard: mode cards, rep counter
│   │   ├── RoleSelectionScreen.js      # User enters role/job title before drilling
│   │   ├── PracticeScreen.js           # Single-question drill (record → Whisper → Feedback)
│   │   ├── QuickFireScreen.js          # Rapid-fire mode: 60s countdown per question
│   │   ├── FeedbackScreen.js           # AI score + bullets + stronger version
│   │   ├── HistoryScreen.js            # Past drills, expandable detail
│   │   ├── PrepKitInputScreen.js       # User enters company + role for Prep Kit
│   │   ├── PrepKitScreen.js            # Displays generated prep kit
│   │   ├── PrepKitHubScreen.js         # Saved prep kits list
│   │   ├── MockInterviewSetupScreen.js # Config before mock interview
│   │   ├── MockInterviewScreen.js      # Live multi-turn AI interview (gesture-locked)
│   │   ├── MockInterviewDebriefScreen.js # Post-interview scorecard (gesture-locked)
│   │   ├── MockInterviewTranscriptScreen.js # Full interview transcript view
│   │   ├── HireVueSetupScreen.js       # Config for HireVue sim (company, role, question mix, count)
│   │   ├── HireVueSimulationScreen.js  # One-way recorded interview: prep timer → record → 1 retake (gesture-locked)
│   │   ├── HireVueDebriefScreen.js     # Post-sim AI scorecard: per-question scores + aggregate (gesture-locked)
│   │   ├── PaywallScreen.js            # Subscription gate (slide from bottom, gesture-locked)
│   │   └── DevSettingsScreen.js        # Internal dev/debug tools
│   ├── utils/
│   │   ├── api.js         # All API calls (see section below)
│   │   ├── storage.js     # AsyncStorage helpers + cloud sync wiring (drills, prep kits, HireVue)
│   │   ├── cloudSync.js   # Supabase upsert/fetch for drills, prep kits, HireVue sessions
│   │   ├── supabase.js    # Supabase client + magic-link auth helpers (env-gated)
│   │   ├── entitlements.js# Reads subscription_entitlements → reconciles local Pro status
│   │   ├── recorder.js / recorder.web.js  # expo-av (native) / MediaRecorder (web) split
│   │   ├── questions.js   # Static question bank per category + CATEGORIES constants
│   │   ├── purchases.js / purchases.web.js # RevenueCat (native) / Stripe checkout (web)
│   │   └── analytics.js   # PII-free PostHog events
│   ├── screens/ (+ AccountScreen.js — sign in, sync, delete account)
│   └── constants/
│       └── theme.js       # Colors, fonts, spacing, radius tokens
```

---

## Navigation Flow

```
Onboarding → Home
Home → RoleSelection → Practice → Feedback
Home → QuickFire → Feedback
Home → PrepKitInput → PrepKit
Home → PrepKitHub → PrepKit
Home → MockInterviewSetup → MockInterview → MockInterviewDebrief → MockInterviewTranscript
Home → HireVueSetup → HireVueSimulation → HireVueDebrief   (premium)
Home → Behavioral drill → Practice → Feedback   (free; uses static STAR bank)
Any screen → Paywall (slide from bottom, gesture-locked)
Home → History
Home → DevSettings
```

- `initialRouteName` is determined at runtime: `Onboarding` if first launch, `Home` if returning user (checked via `getOnboardingCompleted()` from AsyncStorage).
- `Feedback`, `MockInterview`, `MockInterviewDebrief`, `HireVueSimulation`, `HireVueDebrief`, and `Paywall` have `gestureEnabled: false` to prevent accidental back swipes mid-session.

---

## API Layer (`src/utils/api.js`)

All calls use `fetch` directly (no SDK wrappers).

| Function | Purpose | Model / Endpoint |
|---|---|---|
| `transcribeAudio(uri)` | Sends m4a to Whisper, returns transcript string | `whisper-1` via OpenAI |
| `generateQuestions(role, category)` | Returns 10 questions as JSON array. Categories: Interview Prep, Behavioral (STAR), Persuade & Present, Quick Fire | `claude-sonnet-4-6` |
| `generatePrepKit(company, role)` | Returns structured JSON prep kit (company overview, likely questions, 5-day training plan) | `claude-sonnet-4-6`, up to 8192 tokens with retry |
| `getMockInterviewTurn(conversation, prepKit, company, role, exchangeCount)` | Returns next interviewer line + internal note + `is_closing` flag | `claude-sonnet-4-6` |
| `generateMockInterviewDebrief(conversation, company, role)` | Returns overall score, per-exchange scores, best/worst moment analysis | `claude-sonnet-4-6` |
| `getFeedback(transcript, question, category, role)` | Returns `{ score, strong[], improve[], stronger_version }`. For `category === 'Behavioral'`, scores against the STAR method | `claude-sonnet-4-6` |
| `generateHireVueQuestions(company, role, mix, count, prepKit)` | Returns `count` HireVue-style questions as `[{ question, category }]` (category ∈ Behavioral/Company/Technical). Uses the saved prep kit for firm-specific questions when present | `claude-sonnet-4-6` |
| `generateHireVueDebrief(company, role, items)` | Returns overall score, summary, per-question `{ score, strong, improve }`, strongest/weakest index, and `work_on[]` | `claude-sonnet-4-6` |

All Claude calls return JSON. Responses are parsed with a markdown code-fence stripper before `JSON.parse()`.

---

## Design System (`src/constants/theme.js`)

**Current direction: Direction A — Light / Editorial**

| Token | Value |
|---|---|
| `colors.background` | `#F2F1EE` (warm off-white) |
| `colors.surface` | `#FFFFFF` |
| `colors.surfaceElevated` | `#F8F7F5` |
| `colors.accent` | `#1747D4` (blue) |
| `colors.accentDim` | `rgba(23, 71, 212, 0.07)` |
| `colors.accentGlow` | `rgba(23, 71, 212, 0.2)` |
| `colors.text` | `#0F0F0E` (near-black) |
| `colors.textSecondary` | `#686866` |
| `colors.textMuted` | `#AEAEAE` |
| `colors.border` | `#E3E2DE` |
| `colors.success` | `#1A8047` (green) |
| `colors.error` | `#D62828` |

**Fonts:**

| Token | Font | Use |
|---|---|---|
| `fonts.header` | `BebasNeue_400Regular` | CHRM wordmark only |
| `fonts.display` | `SpaceGrotesk_700Bold` | Screen titles, scores, card headers, buttons |
| `fonts.displayMedium` | `SpaceGrotesk_600SemiBold` | Subheadings, feature titles |
| `fonts.body` | `DMSans_400Regular` | Body copy, labels, hints |
| `fonts.bodyMedium` | `DMSans_500Medium` | Slightly emphasized body |
| `fonts.bodyBold` | `DMSans_700Bold` | Bold body text |

Spacing scale: `xs=4, sm=8, md=16, lg=24, xl=32, xxl=48`
Border radius: `sm=8, md=14, lg=20, full=9999`

---

## Monetization

Pro is an **account-level entitlement**, unified across platforms via the
`subscription_entitlements` Supabase table (single source of truth):

- **iOS:** RevenueCat (`src/utils/purchases.js`). `initializePurchases()`,
  `syncSubscriptionStatus()`, `addSubscriptionListener()` as before, plus
  `linkUser(userId)`/`unlinkUser()` which call `Purchases.logIn/logOut` so RC's
  `app_user_id` == the Supabase user id. `POST /api/revenuecat/webhook` writes the
  entitlement row.
- **Web:** Stripe Checkout (`src/utils/purchases.web.js`). `presentPaywall(plan)`
  redirects to `POST /api/checkout/session`; `POST /api/stripe/webhook` writes the
  same entitlement row; `presentCustomerCenter()` opens the Stripe billing portal.
- **Reconcile:** `src/utils/entitlements.js` reads the account row and folds it
  into local Pro status — authoritative on web, upgrade-only on native (so a
  cross-platform purchase unlocks Pro without a stale row clobbering a fresh
  StoreKit purchase). Called on login (`App.js`) and manual sync (`AccountScreen`).

Gating: screens read local subscription status (AsyncStorage) and navigate to
`Paywall` if not Pro. **Pro:** Company Prep Kit, Mock Interview, HireVue Simulation.
**Free** (3/day limit): Interview Prep, Behavioral, Persuade & Present, Quick Fire.

Pricing: $7.99 / month or $59.99 / year (36% savings). Entitlement id: `CHRM Pro`.

---

## Data Shapes

**Drill (saved per practice/quick-fire rep):**
```js
{
  id: "1700000000000",       // Date.now().toString()
  category: "Interview Prep",
  question: "Tell me about yourself...",
  transcript: "So I graduated from...",
  feedback: {
    score: 7,
    strong: ["...", "..."],
    improve: ["...", "..."],
    stronger_version: "..."
  },
  duration: 45,              // seconds
  date: "2026-02-26T...",    // ISO string
  company: "Goldman Sachs"   // or null
}
```

**HireVue Session (saved via `saveHireVueSession`):**
```js
{
  id: "1700000000000",
  company: "JPMorgan",
  role: "Investment Banking Analyst",  // or null
  date: "2026-06-26T...",
  items: [
    {
      question: "Why JPMorgan?",
      category: "Company",        // Behavioral | Company | Technical
      transcript: "...",          // Whisper transcript of the recorded answer
      duration: 62                // seconds spoken
    }
  ]
}
```

**Prep Kit (saved and accessed via `PrepKitHubScreen`):**
```js
{
  company_overview: {
    what_they_do: "...",
    key_differentiators: [...],
    culture_signals: [...],
    interview_style: "..."
  },
  likely_questions: {
    technical: [{ question, why_they_ask, strong_answer_hits }, ...],
    behavioral: [...],
    fit_and_motivation: [...],
    market_awareness: [...]
  },
  talking_points: [...],
  red_flags: [...],
  training_plan: {
    day_1: { focus: "...", drill_questions: [...] },
    // ... through day_5
  }
}
```

---

## Interview Prep Verticals (`src/data/`)

Interview Prep is a curated, vertical → track → question-bank flow (separate from
the legacy free-text "Other role" AI generator). Config lives in
`src/data/interviewPrep.js` (`FINANCE_INDUSTRIES`, `INDUSTRY_TRACKS`); flip a
track/industry `status` to `'active'` to light it up.

- **Screens:** `InterviewPrepIndustryScreen` → `InterviewPrepTrackScreen` →
  `QuestionBankScreen` → `Practice` → `Feedback`. No per-vertical screens — adding
  a vertical is a data file + a `getBank()` case + a status flip.
- **Banks (242 curated Qs):** `ibTechnicalBank.js` (151, 12 topics),
  `ibBehavioralBank.js` (24), `ibFitBank.js` (19), `ibMarketsBank.js` (15),
  `peBank.js` (33 across LBO/Deal/Technical/Fit). Each item: `id, topic,
  difficulty (1 free / 2-3 Pro), question`, plus `reference_answer + key_points`
  (graded by `getTechnicalFeedback`) — except Behavioral, which has no reference
  and grades via the STAR path (`getFeedback`, category `'Behavioral'`).
- **Grading:** all modes share one calibrated `SCORING_RUBRIC` in `api.js`, so a
  "7" means the same thing everywhere. `api.js` also has an insufficient-answer
  guard, tolerant JSON parsing, score clamping, and a `callClaude` retry helper.
- **Progress:** best score per bank question is stored via `saveBankAttempt` /
  `getBankProgress` (`bankItemId` threads Practice → Feedback) and shown as
  "BEST n/10" pills in the bank list.

## Analytics (`src/utils/analytics.js`)

PII-free event tracking to PostHog over plain HTTPS — no native SDK, no
`app.config.js` change, and a no-op until `POSTHOG_API_KEY` is set in `.env`.
Use `track(EVENTS.X, props)` / `identify(props)`; events are defined in `EVENTS`.
Rule: events only, never transcripts/names/emails.

## Backend (`server/`)

Host-agnostic Hono app, **live on Vercel at `https://chrm-two.vercel.app`**
(auto-deploys from `main`). Keeps all OpenAI/Anthropic keys server-side; the
client points at it via `API_BASE_URL`. Also serves the marketing/legal pages
(`/`, `/finance-interview-prep`, `/privacy`, `/terms`, `/support`) from
`server/src/legal.js`.

Key endpoints:
- AI proxies: `/api/questions`, `/api/prep-kit`, `/api/feedback`, `/api/transcribe`,
  mock-interview / HireVue / resume endpoints (each builds its prompt in
  `server/src/prompts.js`).
- Accounts: `DELETE /api/account` (validates Supabase token, deletes via service role).
- Subscriptions: `POST /api/revenuecat/webhook`, `POST /api/checkout/session`,
  `POST /api/stripe/webhook`, `POST /api/billing/portal` — all upsert
  `subscription_entitlements`.

Server-only secrets live in `server/.env` / Vercel (see `server/.env.example`):
Supabase service role, `REVENUECAT_WEBHOOK_SECRET`, and Stripe keys. Never ship
these to the client. Setup + verification: `docs/supabase-setup.md`.

---

## Env Vars

AI keys now live on the **backend** (`server/.env` / Vercel), not the client —
see `server/.env.example` and `docs/supabase-setup.md`. The client `.env`
(gitignored, read via `@env`) holds only public/base values:

```
API_BASE_URL=https://chrm-two.vercel.app
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=ey...
```

Optional client:
```
POSTHOG_API_KEY=phc_...        # turns analytics on; omit to keep it a no-op
POSTHOG_HOST=https://us.i.posthog.com
REVENUECAT_API_KEY_IOS=...     # RevenueCat public SDK key (native only)
```

Server-only (never in the client `.env`): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`,
`STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_WEBHOOK_SECRET`.

> Note: the session-start hook still writes `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
> into the client `.env` for legacy/offline dev, but production AI runs through
> the backend.

---

## Key Conventions

- All styles are inline `StyleSheet.create()` objects — no styled-components or CSS-in-JS library.
- No global state manager — data flows via navigation params and AsyncStorage.
- Claude always returns JSON; code defensively strips markdown fences before parsing.
- `gestureEnabled: false` on any screen where back-swipe would corrupt flow (feedback, mock interview, paywall).
- Titles and headings use `fonts.display` (Space Grotesk Bold) in mixed case — not all-caps strings.
- The CHRM wordmark uses `fonts.header` (Bebas Neue) and is the only place that font appears.
