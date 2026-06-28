// CHRM backend — host-agnostic Hono API.
//
// Purpose: keep the OpenAI / Anthropic API keys server-side so neither the web
// bundle nor the native binary ships secrets. Each endpoint constructs its own
// prompt (ported from the app) so the keys can't be abused as an open relay.
//
// Runs on Node locally via `npm run dev`. The same Hono app can be deployed to
// Vercel, Netlify, Cloudflare Workers, Fly, etc. with a thin adapter — so the
// hosting choice stays open.

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import {
  buildQuestionsPrompt,
  buildPrepKitPrompt,
  buildFeedbackPrompt,
  buildMockTurn,
  buildMockDebriefPrompt,
  buildHireVueQuestionsPrompt,
  buildHireVueDebriefPrompt,
  buildTechnicalFeedbackPrompt,
  buildResumeFeedbackPrompt,
  buildResumeImprovePrompt,
  buildResumeExtractMessages,
} from './prompts.js';
import { callClaudeJson, callClaudeRaw, parseJson, transcribe, textToSpeech } from './llm.js';

const app = new Hono();

app.use('*', logger());
// CORS: in production set ALLOWED_ORIGIN to your web app's domain(s),
// comma-separated. Defaults to '*' for local dev only — lock this down in prod.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim());
app.use(
  '*',
  cors({
    origin: (origin) =>
      allowedOrigins.includes('*') || allowedOrigins.includes(origin)
        ? origin || '*'
        : allowedOrigins[0],
  })
);

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// Simple in-memory fixed-window limiter, keyed by client IP. Protects the AI
// endpoints from abuse running up the OpenAI/Anthropic bill. Render's free tier
// is a single instance, so in-memory state is sufficient; move to a shared store
// (e.g. Redis) if you scale to multiple instances.
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 30; // requests
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000; // per minute
const hits = new Map(); // ip -> { count, resetAt }

setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of hits) if (rec.resetAt <= now) hits.delete(ip);
}, RATE_LIMIT_WINDOW_MS).unref?.();

app.use('/api/*', async (c, next) => {
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || rec.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    rec.count += 1;
    if (rec.count > RATE_LIMIT_MAX) {
      const retry = Math.ceil((rec.resetAt - now) / 1000);
      return c.json({ error: 'Too many requests. Please slow down.' }, 429, {
        'Retry-After': String(retry),
      });
    }
  }
  await next();
});

// Wrap an async handler so thrown errors become clean JSON 500s.
const handle = (fn) => async (c) => {
  try {
    return await fn(c);
  } catch (err) {
    console.error('[error]', err);
    return c.json({ error: err.message || 'Internal error' }, 500);
  }
};

app.get('/health', (c) => c.json({ ok: true }));

// ─── Question generation ──────────────────────────────────────────────────────
app.post(
  '/api/questions',
  handle(async (c) => {
    const { role = '', category } = await c.req.json();
    const questions = await callClaudeJson({
      prompt: buildQuestionsPrompt(role, category),
      maxTokens: 1024,
    });
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format returned');
    }
    return c.json({ questions });
  })
);

// ─── Prep kit (with truncation retry) ─────────────────────────────────────────
app.post(
  '/api/prep-kit',
  handle(async (c) => {
    const { company, role } = await c.req.json();
    const prompt = buildPrepKitPrompt(company, role);

    let data = await callClaudeRaw({ prompt, maxTokens: 4096 });
    if (data.stop_reason === 'max_tokens') {
      console.warn('[prep-kit] truncated at 4096 — retrying at 8192');
      data = await callClaudeRaw({ prompt, maxTokens: 8192 });
      if (data.stop_reason === 'max_tokens') {
        throw new Error('Prep kit response was too large. Try a more specific role.');
      }
    }
    return c.json(parseJson(data.content[0].text));
  })
);

// ─── Single-answer feedback ───────────────────────────────────────────────────
app.post(
  '/api/feedback',
  handle(async (c) => {
    const { transcript, question, category, role } = await c.req.json();
    const feedback = await callClaudeJson({
      prompt: buildFeedbackPrompt(transcript, question, category, role),
      maxTokens: 800,
    });
    return c.json(feedback);
  })
);

// ─── Technical / bank grading ─────────────────────────────────────────────────
app.post(
  '/api/technical-feedback',
  handle(async (c) => {
    const { transcript, question, referenceAnswer, keyPoints, role } = await c.req.json();
    const feedback = await callClaudeJson({
      prompt: buildTechnicalFeedbackPrompt(transcript, question, referenceAnswer, keyPoints, role),
      maxTokens: 1024,
    });
    return c.json(feedback);
  })
);

// ─── Resume walkthrough feedback ──────────────────────────────────────────────
app.post(
  '/api/resume-feedback',
  handle(async (c) => {
    const { transcript, resumeText, role } = await c.req.json();
    const feedback = await callClaudeJson({
      prompt: buildResumeFeedbackPrompt(transcript, resumeText, role),
      maxTokens: 1024,
    });
    return c.json(feedback);
  })
);

// ─── Resume improver (premium) ────────────────────────────────────────────────
app.post(
  '/api/resume-improve',
  handle(async (c) => {
    const { resumeText, role } = await c.req.json();
    const result = await callClaudeJson({
      prompt: buildResumeImprovePrompt(resumeText, role),
      maxTokens: 2048,
    });
    return c.json(result);
  })
);

// ─── Resume PDF text extraction ───────────────────────────────────────────────
app.post(
  '/api/resume-extract',
  handle(async (c) => {
    const { base64Pdf } = await c.req.json();
    if (!base64Pdf) throw new Error('No PDF provided');
    const data = await callClaudeRaw({ messages: buildResumeExtractMessages(base64Pdf), maxTokens: 2048 });
    return c.json({ text: (data.content?.[0]?.text || '').trim() });
  })
);

// ─── Mock interview (turn-based) ──────────────────────────────────────────────
app.post(
  '/api/mock-turn',
  handle(async (c) => {
    const { conversation, prepKit, company, role, exchangeCount } = await c.req.json();
    const { system, messages } = buildMockTurn(conversation, prepKit, company, role, exchangeCount);
    const turn = await callClaudeJson({ system, messages, maxTokens: 1024 });
    return c.json(turn);
  })
);

app.post(
  '/api/mock-debrief',
  handle(async (c) => {
    const { conversation, company, role } = await c.req.json();
    const debrief = await callClaudeJson({
      prompt: buildMockDebriefPrompt(conversation, company, role),
      maxTokens: 1024,
    });
    return c.json(debrief);
  })
);

// ─── HireVue simulation ───────────────────────────────────────────────────────
app.post(
  '/api/hirevue-questions',
  handle(async (c) => {
    const { company, role, mix, count, prepKit } = await c.req.json();
    const questions = await callClaudeJson({
      prompt: buildHireVueQuestionsPrompt(company, role, mix, count, prepKit),
      maxTokens: 1500,
    });
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid HireVue questions format returned');
    }
    return c.json({ questions });
  })
);

app.post(
  '/api/hirevue-debrief',
  handle(async (c) => {
    const { company, role, items } = await c.req.json();
    const debrief = await callClaudeJson({
      prompt: buildHireVueDebriefPrompt(company, role, items),
      maxTokens: 2048,
    });
    return c.json(debrief);
  })
);

// ─── Transcription (Whisper) ──────────────────────────────────────────────────
app.post(
  '/api/transcribe',
  handle(async (c) => {
    const body = await c.req.formData();
    const file = body.get('file');
    if (!file) throw new Error('No audio file provided');
    const text = await transcribe(file);
    return c.json({ text });
  })
);

// ─── Text-to-speech (optional, for spoken interview questions) ─────────────────
app.post(
  '/api/tts',
  handle(async (c) => {
    const { text, voice } = await c.req.json();
    if (!text) throw new Error('No text provided');
    const audio = await textToSpeech(text, voice);
    return c.body(audio, 200, { 'Content-Type': 'audio/mpeg' });
  })
);

// Local dev only — Vercel uses export default app instead of serve()
if (process.env.NODE_ENV !== 'production') {
    const port = Number(process.env.PORT) || 8787;
    serve({ fetch: app.fetch, port }, (info) => {
          console.log(`CHRM backend listening on http://localhost:${info.port}`);
    });
}

export default app;
