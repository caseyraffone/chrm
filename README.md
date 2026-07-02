# CHRM — AI Communication Coach

> Clear. Confident. Under Pressure.

CHRM is a mobile and web prep product for finance candidates. Students practice realistic interview answers out loud, get scored instantly, review stronger versions, and can sync progress across browser and iPhone once Supabase is configured.

---

## Features

- **Voice drills** — Record answers to finance technical, behavioral, resume, HireVue, and presentation questions
- **AI feedback** — Scored by Claude with specific strengths, improvements, and a rewritten stronger version
- **Mock interviews** — Full-session AI interviewer with debrief and transcript
- **Finance interview banks** — Curated IB/PE technical, fit, behavioral, and markets questions
- **Prep Kit** — Company-specific prep plans and likely questions
- **Quick Fire mode** — Rapid-fire drill sessions to build fluency
- **History and account sync** — Local-first drill history with Supabase cloud sync scaffolding
- **Marketing site** — Vercel-hosted finance landing page at `https://chrm-two.vercel.app/finance-interview-prep`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Navigation | React Navigation (native stack) |
| Audio | expo-av |
| Backend | Hono server in `server/`, deployed on Vercel |
| Transcription | OpenAI Whisper (`whisper-1`) through backend proxy |
| AI Feedback | Anthropic Claude (`claude-sonnet-4-6`) through backend proxy |
| Monetization | RevenueCat |
| Auth / Cloud Data | Supabase Auth + Postgres schema in `supabase/schema.sql` |
| Local Storage | AsyncStorage |
| Fonts | Bebas Neue + Space Grotesk + DM Sans |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device, or an iOS/Android simulator

### Install

```bash
git clone https://github.com/YOUR_USERNAME/chrm.git
cd chrm
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```
OPENAI_API_KEY=sk-...              # legacy/local only; AI calls now go through backend
ANTHROPIC_API_KEY=sk-ant-...       # legacy/local only; AI calls now go through backend
REVENUECAT_API_KEY_IOS=appl_...    # app.revenuecat.com
API_BASE_URL=https://chrm-two.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ey...
```

Server-only env vars live in `server/.env` or Vercel, never in the client:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android.

---

## Project Structure

```
chrm/
├── App.js                        # Entry point, font loading, navigation
├── app.config.js                 # Expo config
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js         # Category cards, rep counter, account entry
│   │   ├── AccountScreen.js      # Supabase magic-link auth, sync, account deletion
│   │   ├── PracticeScreen.js     # Record button, Whisper transcription
│   │   ├── FeedbackScreen.js     # Score, bullets, stronger version
│   │   ├── HistoryScreen.js      # Past drills
│   │   ├── MockInterviewScreen.js        # Live AI interviewer (Realtime API)
│   │   ├── MockInterviewSetupScreen.js
│   │   ├── MockInterviewDebriefScreen.js
│   │   ├── MockInterviewTranscriptScreen.js
│   │   ├── PrepKitHubScreen.js   # Role-specific prep materials
│   │   ├── PrepKitScreen.js
│   │   ├── PrepKitInputScreen.js
│   │   ├── QuickFireScreen.js    # Rapid-fire drill mode
│   │   ├── OnboardingScreen.js
│   │   ├── RoleSelectionScreen.js
│   │   ├── PaywallScreen.js
│   │   └── DevSettingsScreen.js
│   ├── components/
│   │   └── ProcessingOverlay.js
│   ├── utils/
│   │   ├── api.js                # transcribeAudio(), getFeedback(), Realtime API
│   │   ├── storage.js            # saveDrill(), getDrills(), getRepCount()
│   │   ├── questions.js          # Question banks per category
│   │   ├── purchases.js          # RevenueCat setup
│   │   ├── recorder.js           # Native recorder wrapper
│   │   ├── recorder.web.js       # Browser MediaRecorder implementation
│   │   ├── supabase.js           # Supabase client/auth helpers
│   │   └── cloudSync.js          # Local drill history <-> Supabase sync
│   └── constants/
│       └── theme.js              # Colors, fonts, spacing
├── server/                       # Vercel/Hono backend + marketing/legal pages
├── supabase/schema.sql           # Auth/cloud-sync database schema + RLS
├── assets/                       # Icons, splash screen
└── .env.example                  # Required environment variables
```

---

## Current Progress

- Marketing site revamp is live and pushed.
- Browser prep works through React Native Web with `MediaRecorder` recording.
- AI calls route through the Vercel backend by default via `API_BASE_URL`.
- Supabase account/sync scaffolding is implemented but needs a real Supabase project and env vars before users can sign in.
- Account deletion endpoint exists at `DELETE /api/account`; it requires `SUPABASE_SERVICE_ROLE_KEY` on the backend.
- RevenueCat is still the mobile entitlement source; web purchase/entitlement wiring is the next commercial layer.

For Supabase setup, use `docs/supabase-setup.md`. For agent/session handoff details, read `GOAL.md` and `CLAUDE.md` before starting new work.

---

## Design System

| Token | Value |
|---|---|
| Background | `#F2F1EE` |
| Surface | `#FFFFFF` |
| Accent | `#1747D4` |
| Text | `#0F0F0E` |
| Secondary text | `#686866` |
| Header font | Bebas Neue |
| Display font | Space Grotesk |
| Body font | DM Sans |

---

## License

MIT
