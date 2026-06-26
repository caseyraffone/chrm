// Thin server-side wrappers around the Anthropic and OpenAI HTTP APIs.
// API keys are read from the server environment and never leave this process.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

/**
 * Strips markdown code fences and surrounding prose, then JSON.parses.
 * Mirrors the defensive parsing the client used to do inline.
 */
export function parseJson(raw) {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  // Fall back to the outermost { ... } or [ ... ] span if extra text remains.
  if (!fence) {
    const objStart = text.indexOf('{');
    const arrStart = text.indexOf('[');
    const start =
      arrStart !== -1 && (objStart === -1 || arrStart < objStart) ? arrStart : objStart;
    if (start > 0) text = text.slice(start);
  }
  return JSON.parse(text);
}

/**
 * Calls Claude (Anthropic Messages API). Returns the full response JSON so
 * callers can inspect stop_reason (used by the prep-kit retry).
 */
export async function callClaudeRaw({ system, messages, prompt, maxTokens = 1024 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured on the server');

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: messages || [{ role: 'user', content: prompt }],
  };
  if (system) body.system = system;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic request failed (${res.status})`);
  }
  return res.json();
}

/** Convenience: call Claude and parse the text content as JSON. */
export async function callClaudeJson(opts) {
  const data = await callClaudeRaw(opts);
  return parseJson(data.content[0].text);
}

/** Forwards an uploaded audio file to OpenAI Whisper, returns the transcript. */
export async function transcribe(file) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server');

  const form = new FormData();
  form.append('file', file, file.name || 'recording.m4a');
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  const res = await fetch(OPENAI_TRANSCRIBE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Transcription failed (${res.status})`);
  }
  const data = await res.json();
  return data.text;
}

/**
 * Optional: OpenAI text-to-speech for speaking interview questions on web,
 * where on-device TTS quality varies. Returns an ArrayBuffer of mp3 audio.
 */
export async function textToSpeech(text, voice = 'alloy') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server');

  const res = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'tts-1', voice, input: text, response_format: 'mp3' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `TTS failed (${res.status})`);
  }
  return res.arrayBuffer();
}
