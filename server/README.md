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
| GET | `/privacy` | — | Privacy Policy (static HTML) |
| GET | `/terms` | — | Terms of Use / EULA (static HTML) |
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

### Vercel

`api/index.js` is the Vercel serverless entry (Hono's Vercel adapter), and
`vercel.json` rewrites every path to it, so `/health`, `/privacy`, `/terms`, and
`/api/*` are all served by the same app. `src/index.js` only binds a port when
run directly (`npm run dev`/`npm start`), so the import is safe in the function
runtime.

Deploy steps:
1. In Vercel, import the repo and set the **Root Directory** to `server`.
2. Add env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (and optionally
   `ALLOWED_ORIGIN`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`).
3. Deploy, then smoke-test `/health`, `/privacy`, and `/terms`.
4. Update `LEGAL_BASE_URL` in `src/constants/links.js` (app) to the deployed
   domain so the paywall links resolve, and use the same `/privacy` URL in the
   App Store listing.
