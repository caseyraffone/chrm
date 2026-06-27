# CHRM Backend

Serverless API that proxies CHRM's AI calls so the OpenAI/Anthropic keys never
ship inside the client app. Deploys as **Vercel** functions.

> Part of the commercial-build initiative (see `../GOAL.md`). This is **standalone**
> — the iOS/web client is not pointed at it yet. Wiring the client + removing keys
> from the client bundle is a later Phase 1 unit (1d) that needs explicit sign-off
> because it touches `app.config.js`.

## Endpoints

| Method | Path | Purpose | Returns |
|---|---|---|---|
| GET | `/api/health` | Liveness + which keys are configured (booleans only) | `{ ok, service, time, config }` |
| POST | `/api/transcribe` | Proxy an audio upload to OpenAI Whisper | `{ text }` |

`/api/transcribe` accepts `multipart/form-data` with a single `file` field — the
same shape the client already used — and returns `{ text }`, identical to the old
direct Whisper call, so the client can be repointed with no response changes.

## Local development

```bash
cd server
npm install
npm test          # runs the proxy tests (OpenAI call is mocked — no key needed)
```

To run the functions locally you need the Vercel CLI (`npm i -g vercel`), then
`vercel dev` with `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` set in `.env.local`.

## Deploy (Vercel)

1. Create a Vercel project with **root directory = `server`**.
2. Set env vars in Vercel project settings (see `.env.example`):
   - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
   - `ALLOWED_ORIGINS` (web app origins; native Expo requests need no Origin)
3. Deploy. Smoke-test:
   ```bash
   curl https://<your-project>.vercel.app/api/health
   ```

## Notes / TODO

- **Rate limiting** is currently a best-effort in-memory limiter (per warm
  instance only — not a true distributed limit). Phase 1e swaps in Upstash Redis
  (`UPSTASH_REDIS_REST_URL` / `_TOKEN` already stubbed in `.env.example`).
- Next endpoints to port behind the backend (Phase 1c): the Claude calls
  (feedback, questions, prep kit, mock interview, HireVue, technical grading),
  keeping request/response shapes identical to `src/utils/api.js`.
