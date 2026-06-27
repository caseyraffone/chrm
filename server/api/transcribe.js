// POST /api/transcribe — proxies an uploaded audio file to OpenAI Whisper.
//
// Accepts multipart/form-data with a single "file" field (matches the client's
// existing upload shape). Returns { text } — identical to the old direct call —
// so the client can be repointed here with no response-shape changes.
//
// The OpenAI key lives only in server env vars; it never reaches the client.

const fs = require('fs');
const { formidable } = require('formidable');
const { applyCors } = require('../lib/cors');
const { checkRateLimit } = require('../lib/rateLimit');
const { transcribeBuffer } = require('../lib/openai');

// Disable Vercel's automatic body parsing so formidable can read the raw stream.
const config = { api: { bodyParser: false } };

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // Whisper's per-file ceiling

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const limit = checkRateLimit(req);
  if (!limit.allowed) {
    return sendJson(res, 429, { error: 'Too many requests. Slow down and try again.' });
  }

  let file;
  try {
    const form = formidable({ maxFileSize: MAX_AUDIO_BYTES, keepExtensions: true });
    const [, files] = await form.parse(req);
    file = files.file?.[0];
  } catch (err) {
    return sendJson(res, 400, { error: 'Could not parse upload: ' + err.message });
  }

  if (!file) {
    return sendJson(res, 400, { error: 'No audio file provided (expected a "file" field).' });
  }

  try {
    const buffer = fs.readFileSync(file.filepath);
    const text = await transcribeBuffer(buffer, {
      filename: file.originalFilename || 'recording.m4a',
      mimetype: file.mimetype || 'audio/m4a',
    });
    return sendJson(res, 200, { text });
  } catch (err) {
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return sendJson(res, status, { error: err.message || 'Transcription failed' });
  } finally {
    if (file?.filepath) fs.promises.unlink(file.filepath).catch(() => {});
  }
}

module.exports = handler;
module.exports.config = config;
