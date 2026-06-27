// Local tests for the /transcribe proxy. Run with: npm test
//
// global fetch is mocked so no real OpenAI call is made — these verify the
// outbound request is built correctly and the handler wires multipart input
// through to a { text } response.

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const { transcribeBuffer, WHISPER_URL } = require('../lib/openai');
const transcribeHandler = require('../api/transcribe');

function withMockedFetch(impl, fn) {
  const original = global.fetch;
  global.fetch = impl;
  return (async () => {
    try {
      return await fn();
    } finally {
      global.fetch = original;
    }
  })();
}

test('transcribeBuffer posts file + model to Whisper and returns text', async () => {
  process.env.OPENAI_API_KEY = 'sk-test-key';
  let captured;

  await withMockedFetch(
    async (url, opts) => {
      captured = { url, opts };
      return { ok: true, json: async () => ({ text: 'hello world' }) };
    },
    async () => {
      const text = await transcribeBuffer(Buffer.from('fake-audio'), {
        filename: 'r.m4a',
        mimetype: 'audio/m4a',
      });
      assert.strictEqual(text, 'hello world');
    }
  );

  assert.strictEqual(captured.url, WHISPER_URL);
  assert.strictEqual(captured.opts.method, 'POST');
  assert.strictEqual(captured.opts.headers.Authorization, 'Bearer sk-test-key');
  assert.ok(captured.opts.body instanceof FormData);
  assert.strictEqual(captured.opts.body.get('model'), 'whisper-1');
  assert.ok(captured.opts.body.get('file'));
});

test('transcribeBuffer throws when key is missing', async () => {
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(() => transcribeBuffer(Buffer.from('x')), /OPENAI_API_KEY/);
});

test('POST /api/transcribe parses multipart and returns { text }', async () => {
  process.env.OPENAI_API_KEY = 'sk-test-key';

  await withMockedFetch(
    async () => ({ ok: true, json: async () => ({ text: 'transcribed answer' }) }),
    async () => {
      const server = http.createServer(transcribeHandler);
      await new Promise((r) => server.listen(0, r));
      const port = server.address().port;

      try {
        // Build a minimal multipart/form-data body with one "file" field.
        const boundary = '----chrmtest' + Date.now();
        const head =
          `--${boundary}\r\n` +
          'Content-Disposition: form-data; name="file"; filename="recording.m4a"\r\n' +
          'Content-Type: audio/m4a\r\n\r\n';
        const tail = `\r\n--${boundary}--\r\n`;
        const body = Buffer.concat([
          Buffer.from(head),
          Buffer.from('pretend-audio-bytes'),
          Buffer.from(tail),
        ]);

        const res = await fetchReal(`http://127.0.0.1:${port}/api/transcribe`, {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': String(body.length),
          },
          body,
        });

        assert.strictEqual(res.status, 200);
        const json = JSON.parse(res.text);
        assert.strictEqual(json.text, 'transcribed answer');
      } finally {
        server.close();
      }
    }
  );
});

test('non-POST methods are rejected with 405', async () => {
  const server = http.createServer(transcribeHandler);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  try {
    const res = await fetchReal(`http://127.0.0.1:${port}/api/transcribe`, { method: 'GET' });
    assert.strictEqual(res.status, 405);
  } finally {
    server.close();
  }
});

// Tiny raw HTTP client so the test isn't affected by the mocked global.fetch.
function fetchReal(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      { hostname: u.hostname, port: u.port, path: u.pathname, method, headers },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, text: data }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
