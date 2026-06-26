# CHRM — AI Communication Coach

**Tagline:** Clear. Confident. Under Pressure.

## Git Workflow

**Always work on `main`.** Commit and push directly to `main` — do not create feature branches unless explicitly asked. Before making changes, ensure you're on main and it's up to date.

A React Native / Expo app that helps students and young professionals practice high-stakes communication through AI-powered voice drills, mock interviews, and company-specific prep kits.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native + Expo (SDK 55) |
| Navigation | React Navigation — native stack |
| Audio Recording | `expo-av` |
| Transcription | OpenAI Whisper API (`whisper-1`) |
| AI (feedback, questions, mock interview) | Anthropic Claude (`claude-sonnet-4-6`) |
| Monetization | RevenueCat (`react-native-purchases`) |
| Storage | `@react-native-async-storage/async-storage` |
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
│   │   ├── api.js       # All API calls (see section below)
│   │   ├── storage.js   # AsyncStorage helpers: drills, rep count, onboarding flag, prep kits
│   │   ├── questions.js # Static question bank per category + CATEGORIES constants
│   │   └── purchases.js # RevenueCat init, subscription sync, entitlement listener
│   └── constants/
│       └── theme.js     # Colors, fonts, spacing, radius tokens
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

RevenueCat handles all subscription logic. `src/utils/purchases.js` exports:
- `initializePurchases()` — called once in `App.js` `useEffect`
- `syncSubscriptionStatus()` — writes entitlement status to AsyncStorage on launch
- `addSubscriptionListener()` — keeps AsyncStorage in sync during the session; returns a cleanup function

Gating: screens check AsyncStorage for subscription status and navigate to `Paywall` if not subscribed. **Pro features:** Company Prep Kit, Mock Interview, and HireVue Simulation. **Free** (subject to the 3/day limit): Interview Prep, Behavioral, Persuade & Present, Quick Fire.

Pricing: $7.99 / month or $59.99 / year (36% savings).

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

## Env Vars

**The OpenAI/Anthropic keys live on the backend, not the client.** See `/server`.
All AI calls (`src/utils/api.js`) go through that backend so secrets never ship
in the web bundle or the native binary.

**App `.env`** (gitignored) — only needs to know where the backend is:

```
API_BASE_URL=http://localhost:8787   # deployed backend URL in production
```

Accessed in code via:
```js
import { API_BASE_URL } from '@env';
```

**Server `.env`** (`server/.env`, gitignored) — holds the actual secrets:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Backend (`/server`)

Host-agnostic [Hono](https://hono.dev) API that proxies OpenAI + Anthropic.
Named endpoints (questions, prep-kit, feedback, mock-turn, mock-debrief,
hirevue-questions, hirevue-debrief, transcribe, tts) construct prompts
server-side. Run with `cd server && npm run dev` (port 8787). Deploys to
Node/Vercel/Netlify/Cloudflare/Fly. See `server/README.md`.

---

## Web

The same Expo codebase builds for web via React Native Web (`npm run web`,
`npm run build:web` → static `dist/`). Native-only modules are platform-gated:
`purchases.web.js` stubs RevenueCat (web treats users as free until Web Billing
is added). The Mock Interview is turn-based (expo-speech + expo-av) so it runs
on web and native from one screen — no WebRTC.

---

## Key Conventions

- All styles are inline `StyleSheet.create()` objects — no styled-components or CSS-in-JS library.
- No global state manager — data flows via navigation params and AsyncStorage.
- Claude always returns JSON; code defensively strips markdown fences before parsing.
- `gestureEnabled: false` on any screen where back-swipe would corrupt flow (feedback, mock interview, paywall).
- Titles and headings use `fonts.display` (Space Grotesk Bold) in mixed case — not all-caps strings.
- The CHRM wordmark uses `fonts.header` (Bebas Neue) and is the only place that font appears.
