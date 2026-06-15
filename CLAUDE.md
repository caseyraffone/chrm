# CHRM — AI Communication Coach

**Tagline:** Clear. Confident. Under Pressure.

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
| Fonts | Bebas Neue (headers), DM Sans (body) via `@expo-google-fonts` |
| Env vars | `react-native-dotenv` → import from `@env` |

---

## Running the App

```bash
source ~/.nvm/nvm.sh   # Node is installed via NVM — required in Bash tool
npx expo start         # Start dev server
```

> Node v20.20.0 via NVM. Not in default PATH — always source NVM first.

---

## Project Structure

```
pitchiq/
├── App.js                          # Entry point: font loading, onboarding gate, nav setup
├── app.config.js                   # Expo config — injects env vars into `extra`
├── babel.config.js                 # Expo preset + react-native-dotenv plugin
├── .env                            # API keys (never commit)
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.js         # First-launch walkthrough
│   │   ├── HomeScreen.js               # Dashboard: mode cards, rep counter
│   │   ├── RoleSelectionScreen.js      # User enters role/job title before drilling
│   │   ├── PracticeScreen.js           # Single-question drill (record → Whisper → Feedback)
│   │   ├── QuickFireScreen.js          # Rapid-fire mode: back-to-back questions
│   │   ├── FeedbackScreen.js           # AI score + bullets + stronger version
│   │   ├── HistoryScreen.js            # Past drills, expandable detail
│   │   ├── PrepKitInputScreen.js       # User enters company + role for Prep Kit
│   │   ├── PrepKitScreen.js            # Displays generated prep kit
│   │   ├── PrepKitHubScreen.js         # Saved prep kits list
│   │   ├── MockInterviewSetupScreen.js # Config before mock interview
│   │   ├── MockInterviewScreen.js      # Live multi-turn AI interview (gesture-locked)
│   │   ├── MockInterviewDebriefScreen.js # Post-interview scorecard (gesture-locked)
│   │   ├── MockInterviewTranscriptScreen.js # Full interview transcript view
│   │   ├── PaywallScreen.js            # RevenueCat subscription gate (slide from bottom)
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
Home → RoleSelection → QuickFire → Feedback
Home → PrepKitInput → PrepKit
Home → PrepKitHub → PrepKit
Home → MockInterviewSetup → MockInterview → MockInterviewDebrief → MockInterviewTranscript
Any screen → Paywall (slide from bottom, gesture-locked)
Home → History
Home → DevSettings
```

- `initialRouteName` is determined at runtime: `Onboarding` if first launch, `Home` if returning user (checked via `getOnboardingCompleted()` from AsyncStorage).
- `Feedback`, `MockInterview`, `MockInterviewDebrief`, and `Paywall` have `gestureEnabled: false` to prevent accidental back swipes mid-session.

---

## API Layer (`src/utils/api.js`)

All calls use `fetch` directly (no SDK wrappers).

| Function | Purpose | Model / Endpoint |
|---|---|---|
| `transcribeAudio(uri)` | Sends m4a to Whisper, returns transcript string | `whisper-1` via OpenAI |
| `generateQuestions(role, category)` | Returns 10 questions as JSON array | `claude-sonnet-4-6` |
| `generatePrepKit(company, role)` | Returns structured JSON prep kit (company overview, likely questions, 5-day training plan) | `claude-sonnet-4-6`, up to 8192 tokens with retry |
| `getMockInterviewTurn(conversation, prepKit, company, role, exchangeCount)` | Returns next interviewer line + internal note + `is_closing` flag | `claude-sonnet-4-6` |
| `generateMockInterviewDebrief(conversation, company, role)` | Returns overall score, per-exchange scores, best/worst moment analysis | `claude-sonnet-4-6` |
| `getFeedback(transcript, question, category, role)` | Returns `{ score, strong[], improve[], stronger_version }` | `claude-sonnet-4-6` |

All Claude calls return JSON. Responses are parsed with a markdown code-fence stripper before `JSON.parse()`.

---

## Design System (`src/constants/theme.js`)

| Token | Value |
|---|---|
| `colors.background` | `#0a0a0a` |
| `colors.surface` | `#141414` |
| `colors.surfaceElevated` | `#1c1c1c` |
| `colors.accent` | `#3B82F6` (blue) |
| `colors.accentDim` | `rgba(59,130,246,0.15)` |
| `colors.accentGlow` | `rgba(59,130,246,0.4)` |
| `colors.text` | `#ffffff` |
| `colors.textSecondary` | `#888888` |
| `colors.textMuted` | `#444444` |
| `colors.border` | `#222222` |
| `colors.success` | `#00c851` |
| `colors.error` | `#ff3b30` |
| Header font | `BebasNeue_400Regular` |
| Body font | `DMSans_400Regular / 500Medium / 700Bold` |

Spacing scale: `xs=4, sm=8, md=16, lg=24, xl=32, xxl=48`
Border radius: `sm=8, md=12, lg=20, full=9999`

---

## Monetization

RevenueCat handles all subscription logic. `src/utils/purchases.js` exports:
- `initializePurchases()` — called once in `App.js` `useEffect`
- `syncSubscriptionStatus()` — writes entitlement status to AsyncStorage on launch
- `addSubscriptionListener()` — keeps AsyncStorage in sync during the session; returns a cleanup function

Gating: screens check AsyncStorage for subscription status and navigate to `Paywall` if not subscribed.

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
  date: "2026-02-26T..."     // ISO string
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

Set in `.env` (gitignored). Required:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Accessed in code via:
```js
import { OPENAI_API_KEY, ANTHROPIC_API_KEY } from '@env';
```

---

## Key Conventions

- All styles are inline `StyleSheet.create()` objects — no styled-components or CSS-in-JS library.
- No global state manager — data flows via navigation params and AsyncStorage.
- Claude always returns JSON; code defensively strips markdown fences before parsing.
- `gestureEnabled: false` on any screen where back-swipe would corrupt flow (feedback, mock interview, paywall).
