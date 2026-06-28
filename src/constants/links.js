// Hosted legal pages. Served as static HTML by the CHRM backend (see
// /server — routes `/privacy` and `/terms`). Apple requires functional
// Privacy Policy + Terms of Use (EULA) links on the paywall and in the
// App Store listing (Guideline 3.1.2c).
//
// IMPORTANT: update LEGAL_BASE_URL to the production backend domain after the
// Vercel deploy, and confirm both links resolve before submitting to Apple.
export const LEGAL_BASE_URL = 'https://chrm-two.vercel.app';

export const PRIVACY_URL = `${LEGAL_BASE_URL}/privacy`;
export const TERMS_URL = `${LEGAL_BASE_URL}/terms`;
