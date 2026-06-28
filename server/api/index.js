// Vercel serverless entry point.
//
// The whole CHRM backend is one Hono app (see ../src/index.js). On Vercel we
// don't bind a port — we hand the app to Vercel's Node runtime via Hono's
// Vercel adapter. vercel.json rewrites every path to this function, so routes
// like /health, /privacy, /terms, and /api/* are all served by the same app.
import { handle } from 'hono/vercel';
import app from '../src/index.js';

export const config = { runtime: 'nodejs' };

export default handle(app);
