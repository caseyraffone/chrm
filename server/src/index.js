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
import Stripe from 'stripe';

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

// Upserts a row into subscription_entitlements (primary key user_id) using the
// service role, so RevenueCat webhook events set the account-level entitlement
// that every platform reads — the basis for cross-platform Pro unlock.
async function upsertSubscriptionEntitlement(row) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin is not configured.');
  }

  const res = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscription_entitlements?on_conflict=user_id`,
    {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.msg || `Entitlement upsert failed (${res.status}).`);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// RevenueCat's app_user_id is the Supabase user id once the client calls
// Purchases.logIn(userId). Purchases made before sign-in carry an anonymous
// $RCAnonymousID; check aliases too, and only accept a real UUID we can attach.
function pickSupabaseUserId(event) {
  const candidates = [event.app_user_id, ...(event.aliases || []), event.original_app_user_id];
  return candidates.find((id) => typeof id === 'string' && UUID_RE.test(id)) || null;
}

// ─── Stripe (web checkout) ────────────────────────────────────────────────────

let stripeClient = null;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured.');
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

// Reads the account's entitlement row (service role) — used to find the Stripe
// customer id for the billing portal.
async function getEntitlementRow(userId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  const res = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscription_entitlements?user_id=eq.${userId}&select=*`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) ? rows[0] || null : null;
}

function stripeSubscriptionActive(sub) {
  if (!sub) return false;
  if (!['active', 'trialing', 'past_due'].includes(sub.status)) return false;
  if (sub.current_period_end && sub.current_period_end * 1000 < Date.now()) return false;
  return true;
}

function customerIdOf(objectCustomer) {
  if (!objectCustomer) return null;
  return typeof objectCustomer === 'string' ? objectCustomer : objectCustomer.id || null;
}

// Maps a verified Stripe event to an account entitlement upsert. Both the
// checkout completion and later subscription lifecycle events land here.
async function handleStripeEvent(event) {
  const stripe = getStripe();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.supabase_user_id;
    if (!userId) return;
    let status = 'active';
    let expiresAt = null;
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      status = stripeSubscriptionActive(sub) ? 'active' : 'free';
      expiresAt = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;
    }
    await upsertSubscriptionEntitlement({
      user_id: userId,
      status,
      stripe_customer_id: customerIdOf(session.customer),
      entitlement_id: 'CHRM Pro',
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    const userId = sub.metadata?.supabase_user_id;
    if (!userId) return;
    const active = event.type !== 'customer.subscription.deleted' && stripeSubscriptionActive(sub);
    await upsertSubscriptionEntitlement({
      user_id: userId,
      status: active ? 'active' : 'free',
      stripe_customer_id: customerIdOf(sub.customer),
      entitlement_id: 'CHRM Pro',
      expires_at: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    });
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

// ─── RevenueCat webhook ───────────────────────────────────────────────────────
// Single source of truth for entitlements across platforms. RevenueCat posts
// purchase/renewal/expiration events here (with an Authorization header equal to
// REVENUECAT_WEBHOOK_SECRET set in the dashboard). We map the event to an
// active/free status and store it on the account, so a purchase made on iOS
// (StoreKit) or on the web (Stripe / RC Web Billing) unlocks Pro everywhere the
// user signs in.
app.post(
  '/api/revenuecat/webhook',
  handle(async (c) => {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (!secret) return c.json({ error: 'Webhook not configured.' }, 500);
    const auth = c.req.header('authorization') || '';
    if (auth !== secret && auth !== `Bearer ${secret}`) {
      return c.json({ error: 'Unauthorized.' }, 401);
    }

    const body = await c.req.json().catch(() => ({}));
    const event = body.event || {};
    const userId = pickSupabaseUserId(event);
    if (!userId) {
      // Purchase not yet tied to a signed-in account (anonymous RC id).
      return c.json({ ok: true, skipped: 'no-uuid-app-user-id' });
    }

    const expiresAtMs = event.expiration_at_ms || null;
    const type = event.type || '';
    // CANCELLATION keeps access until expiry, so rely on the expiration
    // timestamp rather than the event type for everything except hard ends.
    const active =
      type !== 'EXPIRATION' &&
      type !== 'SUBSCRIPTION_PAUSED' &&
      (!expiresAtMs || expiresAtMs > Date.now());
    const entitlementId =
      (Array.isArray(event.entitlement_ids) && event.entitlement_ids[0]) ||
      event.entitlement_id ||
      null;

    await upsertSubscriptionEntitlement({
      user_id: userId,
      status: active ? 'active' : 'free',
      revenuecat_app_user_id: event.app_user_id || null,
      entitlement_id: entitlementId,
      expires_at: expiresAtMs ? new Date(expiresAtMs).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
    return c.json({ ok: true });
  })
);

// ─── Stripe web checkout ──────────────────────────────────────────────────────
// Browser subscriptions: create a Checkout Session tied to the signed-in user,
// then let Stripe's webhook record the entitlement. Same subscription_entitlements
// table the RevenueCat webhook writes, so Pro stays unified across platforms.
app.post(
  '/api/checkout/session',
  handle(async (c) => {
    const token = getBearerToken(c);
    if (!token) return c.json({ error: 'Missing authorization token.' }, 401);
    const user = await getSupabaseUserFromToken(token);
    const { plan = 'annual', origin } = await c.req.json().catch(() => ({}));
    const priceId =
      plan === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_ANNUAL;
    if (!priceId) return c.json({ error: 'Subscription price is not configured.' }, 500);

    const base = (origin || process.env.WEB_APP_URL || 'https://chrm-two.vercel.app').replace(/\/$/, '');
    const checkout = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
      allow_promotion_codes: true,
      success_url: `${base}/?checkout=success`,
      cancel_url: `${base}/?checkout=cancelled`,
    });
    return c.json({ url: checkout.url });
  })
);

// Stripe posts raw JSON that must be signature-verified against the raw body,
// so this route reads the text body itself rather than going through handle().
app.post('/api/stripe/webhook', async (c) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return c.json({ error: 'Webhook not configured.' }, 500);
  const signature = c.req.header('stripe-signature');
  const raw = await c.req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    return c.json({ error: `Signature verification failed: ${err.message}` }, 400);
  }
  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error('[stripe webhook]', err);
    return c.json({ error: err.message || 'Webhook handler failed' }, 500);
  }
  return c.json({ received: true });
});

// Stripe billing portal so web subscribers can manage/cancel their plan.
app.post(
  '/api/billing/portal',
  handle(async (c) => {
    const token = getBearerToken(c);
    if (!token) return c.json({ error: 'Missing authorization token.' }, 401);
    const user = await getSupabaseUserFromToken(token);
    const row = await getEntitlementRow(user.id);
    const customerId = row?.stripe_customer_id;
    if (!customerId) return c.json({ error: 'No web subscription found for this account.' }, 404);
    const { origin } = await c.req.json().catch(() => ({}));
    const base = (origin || process.env.WEB_APP_URL || 'https://chrm-two.vercel.app').replace(/\/$/, '');
    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/`,
    });
    return c.json({ url: portal.url });
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
