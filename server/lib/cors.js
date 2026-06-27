// Minimal CORS + preflight handling for the Vercel functions.
//
// Native Expo requests don't send an Origin header, so they're always allowed.
// Browser requests are checked against ALLOWED_ORIGINS (comma-separated env var).
// Set ALLOWED_ORIGINS="*" for early testing.

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

// Applies CORS headers. Returns true if the request was a preflight (OPTIONS)
// and has already been answered — callers should return early in that case.
function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowed = parseAllowedOrigins();

  if (origin) {
    if (allowed.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

module.exports = { applyCors, parseAllowedOrigins };
