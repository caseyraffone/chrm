#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, 'server/.env'));

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  console.error('Add them to server/.env or export them in your shell, then rerun npm run check:supabase.');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiBase = (process.env.API_BASE_URL || 'https://chrm-two.vercel.app').replace(/\/$/, '');

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function checkTable(table) {
  const url = `${supabaseUrl}/rest/v1/${table}?select=*&limit=1`;
  const { response, body } = await requestJson(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`${table} check failed (${response.status}): ${body.message || body.error || 'unknown error'}`);
  }
  console.log(`OK ${table}`);
}

async function checkBackendDeleteRoute() {
  const { response, body } = await requestJson(`${apiBase}/api/account`, { method: 'DELETE' });
  if (response.status !== 401) {
    throw new Error(`DELETE /api/account should return 401 without a token; got ${response.status}: ${JSON.stringify(body)}`);
  }
  console.log(`OK ${apiBase}/api/account rejects missing auth`);
}

const tables = [
  'profiles',
  'drill_sessions',
  'prep_kits',
  'hirevue_sessions',
  'subscription_entitlements',
];

try {
  console.log(`Checking Supabase project ${supabaseUrl}`);
  for (const table of tables) {
    await checkTable(table);
  }
  await checkBackendDeleteRoute();
  console.log('Supabase schema and account-delete route checks passed.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
