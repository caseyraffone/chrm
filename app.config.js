require('dotenv').config();
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    name: 'CHRM',
    slug: 'pitchiq',
    extra: {
      ...appJson.expo.extra,
      // AI keys now live on the backend (see /server) and are never shipped to
      // the client. The app only needs to know where that backend is.
      // Read in code via Constants.expoConfig.extra.API_BASE_URL.
      API_BASE_URL: process.env.API_BASE_URL,
    },
  },
};
