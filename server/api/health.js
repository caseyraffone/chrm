// Health check — confirms the backend is up and which keys are configured
// (booleans only; never returns the key values).

const { applyCors } = require('../lib/cors');

module.exports = function handler(req, res) {
  if (applyCors(req, res)) return;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      ok: true,
      service: 'chrm-backend',
      time: new Date().toISOString(),
      config: {
        openai: Boolean(process.env.OPENAI_API_KEY),
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      },
    })
  );
};
