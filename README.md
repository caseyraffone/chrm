# CHRM — AI Communication Coach

> Clear. Confident. Under Pressure.

CHRM is a mobile app that helps finance students and young professionals practice high-stakes communication through AI-powered voice drills and real-time feedback. Record your answer, get scored instantly, and see exactly how to improve.

---

## Features

- **Voice drills** — Record answers to job interview, behavioral, and presentation questions
- **AI feedback** — Scored by Claude with specific strengths, improvements, and a rewritten stronger version
- **Mock interviews** — Full-session AI interviewer with debrief and transcript
- **Prep Kit** — Role-specific question banks and study materials
- **Quick Fire mode** — Rapid-fire drill sessions to build fluency
- **History** — Review all past drills with scores and full feedback

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Navigation | React Navigation (native stack) |
| Audio | expo-av |
| Transcription | OpenAI Whisper (`whisper-1`) |
| AI Feedback | Anthropic Claude (`claude-sonnet-4-6`) |
| Live Interview | OpenAI Realtime API |
| Monetization | RevenueCat |
| Storage | AsyncStorage |
| Fonts | Bebas Neue + DM Sans |

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
OPENAI_API_KEY=sk-...          # openai.com/api-keys
ANTHROPIC_API_KEY=sk-ant-...   # console.anthropic.com/keys
REVENUECAT_API_KEY_IOS=appl_... # app.revenuecat.com
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
│   │   ├── HomeScreen.js         # Category cards, rep counter
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
│   │   └── purchases.js          # RevenueCat setup
│   └── constants/
│       └── theme.js              # Colors, fonts, spacing
├── assets/                       # Icons, splash screen
└── .env.example                  # Required environment variables
```

---

## Design System

| Token | Value |
|---|---|
| Background | `#0a0a0a` |
| Surface | `#141414` |
| Accent | `#ff4d00` |
| Text | `#ffffff` |
| Subtext | `#888888` |
| Header font | Bebas Neue |
| Body font | DM Sans |

---

## License

MIT
