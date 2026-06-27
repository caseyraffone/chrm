// OpenAI helpers. Factored out of the HTTP handler so the request construction
// is unit-testable with a mocked global fetch.

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

// Sends an audio buffer to Whisper and returns the transcript text.
// Mirrors the client's previous direct call (model whisper-1, language en) so
// response shapes stay identical when the client is later pointed here.
async function transcribeBuffer(buffer, { filename = 'recording.m4a', mimetype = 'audio/m4a' } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server');

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }), filename);
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  const response = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    let message = 'Transcription failed';
    try {
      const err = await response.json();
      message = err.error?.message || message;
    } catch (_) {
      /* non-JSON error body */
    }
    const e = new Error(message);
    e.status = response.status;
    throw e;
  }

  const data = await response.json();
  return data.text;
}

module.exports = { transcribeBuffer, WHISPER_URL };
