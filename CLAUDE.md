# CHRM — AI Communication Coach

**Tagline:** Clear. Confident. Under Pressure.

A React Native / Expo app that helps students and young professionals practice high-stakes communication through AI-powered voice drills with real-time feedback.

---

## Tech Stack

- **Framework:** React Native + Expo (SDK 52+)
- **Navigation:** React Navigation (native stack)
- **Audio Recording:** expo-av
- **Transcription:** OpenAI Whisper API (`whisper-1`)
- **AI Feedback:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Storage:** AsyncStorage (`@react-native-async-storage/async-storage`)
- **Fonts:** Bebas Neue (headers), DM Sans (body) via `@expo-google-fonts`
- **Env vars:** `react-native-dotenv` → `@env` module

---

## Project Structure

```
pitchiq/
├── App.js                    # Entry point, font loading, navigation setup
├── babel.config.js           # Expo preset + react-native-dotenv plugin
├── .env                      # API keys (not committed)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js     # Logo, tagline, category cards, rep counter
│   │   ├── PracticeScreen.js # Question display, record button, Whisper transcription
│   │   ├── FeedbackScreen.js # Score, bullet feedback, stronger version from Claude
│   │   └── HistoryScreen.js  # Past drills list, expandable detail
│   ├── utils/
│   │   ├── api.js            # transcribeAudio() + getFeedback()
│   │   ├── storage.js        # saveDrill(), getDrills(), getRepCount()
│   │   └── questions.js      # Question bank per category, CATEGORIES constants
│   └── constants/
│       └── theme.js          # Colors, fonts, spacing, radius
```

---

## Screens

### HomeScreen
- Shows CHRM logo (Bebas Neue, 88px) and tagline
- Rep counter (top-right): total drills completed from AsyncStorage
- Three drill category cards: Job Interview, Behavioral Interview, Presentation Prep
- "View History" button at the bottom

### PracticeScreen
- Receives `category` from navigation params
- Randomly selects a question from the question bank
- Large record button (120px circle, orange accent)
  - Idle: white circle border
  - Recording: orange glow animation + pulsing scale + red REC indicator
  - Inner shape changes: circle (idle) → rounded square (recording)
- Elapsed timer shown while recording
- On stop: calls `transcribeAudio(uri)` → navigates to Feedback

### FeedbackScreen
- Receives `category`, `question`, `transcript`, `duration`
- Calls `getFeedback(transcript, question, category)` on mount
- Displays: large score, "What Worked" bullets, "Improve" bullets, "Stronger Version" quote box
- Saves drill to AsyncStorage via `saveDrill()`
- "Go Again" → new drill in same category | "Home" → HomeScreen

### HistoryScreen
- Loads all drills from AsyncStorage on focus
- Each drill shows: category, date, score
- Tap to expand: question, all feedback bullets, stronger version, duration
- Empty state with CTA to start drilling

---

## Design System

| Token | Value |
|---|---|
| Background | `#0a0a0a` |
| Surface | `#141414` |
| Accent | `#ff4d00` |
| Text | `#ffffff` |
| Text Secondary | `#888888` |
| Header font | Bebas Neue |
| Body font | DM Sans |

---

## API Keys

Set in `.env` (never commit this file):

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Accessed in code via:
```js
import { OPENAI_API_KEY, ANTHROPIC_API_KEY } from '@env';
```

---

## Running the App

```bash
# Install dependencies (first time)
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android
npx expo run:android
```

> Requires Expo Go app on device, or iOS/Android simulator for development.

---

## Drill Data Shape

```js
{
  id: "1700000000000",         // Date.now().toString()
  category: "Job Interview",
  question: "Tell me about yourself...",
  transcript: "So I graduated from...",
  feedback: {
    score: 7,
    strong: ["...", "...", "..."],
    improve: ["...", "...", "..."],
    stronger_version: "..."
  },
  duration: 45,               // seconds
  date: "2026-02-26T..."      // ISO string
}
```
