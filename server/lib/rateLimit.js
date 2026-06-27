// Best-effort in-memory rate limiter.
//
// IMPORTANT: serverless functions are stateless and each instance has its own
// memory, so this only limits within a single warm instance — it is NOT a real
// distributed rate limit. It exists to catch obvious hammering during early
// testing. Phase 1e replaces this with Upstash Redis (UPSTASH_REDIS_REST_URL /
// _TOKEN are already stubbed in .env.example) for a true per-user/IP limit.

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // per window, per key

const hits = new Map(); // key -> array of timestamps

function clientKey(req) {
  // Vercel sets x-forwarded-for; fall back to socket address.
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Returns { allowed: boolean, remaining: number }.
function checkRateLimit(req, { max = MAX_REQUESTS, windowMs = WINDOW_MS } = {}) {
  const key = clientKey(req);
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    return { allowed: false, remaining: 0 };
  }
  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, remaining: max - recent.length };
}

module.exports = { checkRateLimit, clientKey };
