# CHRM Backend

Host-agnostic [Hono](https://hono.dev) API that proxies OpenAI and Anthropic so
API keys stay server-side. Both the native app and the web app call this service
instead of hitting OpenAI/Anthropic directly.

## Why this exists

The app used to embed `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` in the client and
call the providers directly. That leaks keys in a web bundle (plain JS) and in
the native binary. This backend holds the keys; clients call named endpoints.

## Run locally

```bash
cd server
cp .env.example .env   # fill in OPENAI_API_KEY and ANTHROPIC_API_KEY
npm install
npm run dev            # http://localhost:8787
```

Point the app at it by setting `API_BASE_URL` in the app's root `.env`
(e.g. `API_BASE_URL=http://localhost:8787`). On a physical device use your
machine's LAN IP, not `localhost`.

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/health` | — | `{ ok: true }` |
| POST | `/api/questions` | `{ role, category }` | `{ questions: [...] }` |
| POST | `/api/prep-kit` | `{ company, role }` | prep kit object |
| POST | `/api/feedback` | `{ transcript, question, category, role }` | feedback object |
| POST | `/api/mock-turn` | `{ conversation, prepKit, company, role, exchangeCount }` | turn object |
| POST | `/api/mock-debrief` | `{ conversation, company, role }` | debrief object |
| POST | `/api/hirevue-questions` | `{ company, role, mix, count, prepKit }` | `{ questions: [...] }` |
| POST | `/api/hirevue-debrief` | `{ company, role, items }` | debrief object |
| POST | `/api/transcribe` | multipart `file` | `{ text }` |
| POST | `/api/tts` | `{ text, voice }` | `audio/mpeg` |

## Deploy

The Hono app is portable. It runs on Node (`npm start`) and adapts to Vercel,
Netlify, Cloudflare Workers, Fly, Render, etc. Set the same env vars on the host
and lock `ALLOWED_ORIGIN` to your web domain.
