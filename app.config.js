require('dotenv').config();
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    name: 'CHRM',
    slug: 'pitchiq',
  },
  extra: {
    ...appJson.expo.extra,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
};
