// CHRM backend — host-agnostic Hono API.
//
// Purpose: keep the OpenAI / Anthropic API keys server-side so neither the web
// bundle nor the native binary ships secrets. Each endpoint constructs its own
// prompt (ported from the app) so the keys can't be abused as an open relay.
//
// Runs on Node locally via `npm run dev`. The same Hono app can be deployed to
// Vercel, Netlify, Cloudflare Workers, Fly, etc. with a thin adapter — so the
// hosting choice stays open.

import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
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
import { FEEDBACK_MODEL, callClaudeJson, callClaudeRaw, parseJson, transcribe, textToSpeech } from './llm.js';
import { financeInterviewPrepHtml, homeHtml, privacyHtml, supportHtml, termsHtml } from './legal.js';

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
    return c.json({ error: err.message || 'Internal error' }, err.status || 500);
  }
};

function getBearerToken(c) {
  const authorization = c.req.header('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

async function getSupabaseUserFromToken(accessToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase auth is not configured.');
  }

  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await res.json().catch(() => null);
  if (!res.ok || !user?.id) {
    const message = user?.msg || user?.message || 'Invalid or expired session.';
    const error = new Error(message);
    error.status = 401;
    throw error;
  }
  return user;
}

async function deleteSupabaseUser(userId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin deletion is not configured.');
  }

  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.msg || data.message || 'Could not delete account.');
  }
}

function buildFallbackTechnicalFeedback(transcript = '', referenceAnswer = '', keyPoints = []) {
  const answer = transcript.toLowerCase();
  const hits = (keyPoints || []).filter((point) =>
    String(point)
      .toLowerCase()
      .split(/\W+/)
      .some((word) => word.length > 5 && answer.includes(word))
  );
  const missing = (keyPoints || []).filter((point) => !hits.includes(point));
  const score = Math.max(3, Math.min(8, 3 + hits.length + (transcript.length > 180 ? 1 : 0)));
  return {
    score,
    strong: [
      hits.length
        ? `You covered ${hits.slice(0, 2).join(' and ')}.`
        : 'You gave a substantive answer that CHRM can coach from.',
      transcript.length > 180
        ? 'The answer had enough detail to evaluate structure and content.'
        : 'You kept the answer concise.',
    ],
    improve: [
      missing.length
        ? `Add the missing point explicitly: ${missing[0]}.`
        : 'Tighten the structure so each statement follows in order.',
      missing[1]
        ? `Also include: ${missing[1]}.`
        : 'End with a clean summary sentence an interviewer can follow.',
    ],
    stronger_version: referenceAnswer || 'Use a clear beginning, middle, and end, then tie each point back to the question.',
  };
}

app.get('/health', (c) => c.json({ ok: true }));

// Public marketing root. The App Store needs the legal pages, but a polished
// root URL keeps the public web presence from looking like a bare API.
app.get('/', (c) => c.html(homeHtml));
app.get('/finance-interview-prep', (c) => c.html(financeInterviewPrepHtml));

// ─── Legal pages (Apple Guideline 3.1.2c) ──────────────────────────────────────
// Public static HTML: Privacy Policy + Terms of Use (EULA). Linked from the
// paywall and the App Store listing. No auth, not rate-limited.
app.get('/privacy', (c) => c.html(privacyHtml));
app.get('/terms', (c) => c.html(termsHtml));
app.get('/support', (c) => c.html(supportHtml));

// ─── Account management ──────────────────────────────────────────────────────
// Apple requires in-app account deletion when the app supports account creation.
// The client sends the user's Supabase access token; the backend validates it
// with Supabase Auth, then uses the server-only service role key to delete the
// authenticated user. RLS cascades remove profile/cloud data.
app.delete(
  '/api/account',
  handle(async (c) => {
    const token = getBearerToken(c);
    if (!token) return c.json({ error: 'Missing authorization token.' }, 401);
    const user = await getSupabaseUserFromToken(token);
    await deleteSupabaseUser(user.id);
    return c.json({ ok: true });
  })
);

app.get('/favicon.png', async (c) => {
  try {
    const bytes = await readFile(new URL('../public/favicon.png', import.meta.url));
    return c.body(bytes, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  } catch {
    return c.text('Not found', 404);
  }
});

app.get('/screenshots/:device/:file', async (c) => {
  const device = c.req.param('device');
  const file = c.req.param('file');
  const allowedDevices = new Set(['6.9-inch', '6.5-inch', 'ipad-13']);
  if (!allowedDevices.has(device) || !/^[a-z0-9-]+\.png$/i.test(file)) {
    return c.text('Not found', 404);
  }
  try {
    const bytes = await readFile(new URL(`../public/screenshots/${device}/${file}`, import.meta.url));
    return c.body(bytes, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  } catch {
    return c.text('Not found', 404);
  }
});

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
      model: FEEDBACK_MODEL,
    });
    return c.json(feedback);
  })
);

// ─── Technical / bank grading ─────────────────────────────────────────────────
app.post(
  '/api/technical-feedback',
  handle(async (c) => {
    const { transcript, question, referenceAnswer, keyPoints, role } = await c.req.json();
    try {
      const feedback = await callClaudeJson({
        prompt: buildTechnicalFeedbackPrompt(transcript, question, referenceAnswer, keyPoints, role),
        maxTokens: 1024,
        model: FEEDBACK_MODEL,
      });
      return c.json(feedback);
    } catch (err) {
      console.warn('[technical-feedback:fallback]', err.message);
      return c.json(buildFallbackTechnicalFeedback(transcript, referenceAnswer, keyPoints));
    }
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
      model: FEEDBACK_MODEL,
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
