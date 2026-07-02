# CHRM Supabase Setup

Use this when turning on accounts, cloud drill sync, and account deletion.

## Current Vercel Project

- Team: `casey's projects` / `team_VTDyDbA5p1o6z4eOTfqZImYd`
- Project: `chrm` / `prj_C2knWNZRzUWphY5nQyqs4VfBZItF`
- Production app/API: `https://chrm-two.vercel.app`

## 1. Create Supabase Project

1. Create a new Supabase project named `chrm`.
2. In Supabase SQL Editor, run the full contents of `supabase/schema.sql`.
3. In Authentication settings, keep Email provider enabled.
4. Add redirect URLs:
   - `https://chrm-two.vercel.app`
   - `http://localhost:4321`
   - `http://localhost:8081`
   - any Expo/native deep link added later for production mobile auth.

## 2. Copy Keys

From Supabase Project Settings > API:

- Project URL -> `SUPABASE_URL`
- Publishable/anon key -> `SUPABASE_ANON_KEY`
- Service role key -> `SUPABASE_SERVICE_ROLE_KEY`

Important: `SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not put it in the Expo client `.env`.

## 3. Set Local Env

Client `.env`:

```bash
API_BASE_URL=https://chrm-two.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ey...
```

Server `server/.env`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

## 4. Set Vercel Env Vars

In Vercel > `chrm` > Settings > Environment Variables, add for Production and Preview:

```bash
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`OPENAI_API_KEY` and `ANTHROPIC_API_KEY` should already exist. Keep them.

After adding env vars, redeploy the latest `main` deployment.

## 5. Verify

Run:

```bash
npm run check:supabase
```

Expected result:

```text
OK profiles
OK drill_sessions
OK prep_kits
OK hirevue_sessions
OK subscription_entitlements
OK https://chrm-two.vercel.app/api/account rejects missing auth
Supabase schema and account-delete route checks passed.
```

Then smoke-test in the browser:

1. `npm run build:web`
2. `npx serve dist -l 4321`
3. Open `http://localhost:4321`
4. Go to Account & Sync.
5. Send a magic link.
6. Complete sign-in.
7. Do one free drill.
8. Click Sync Progress.
9. Confirm a row appears in Supabase `drill_sessions`.
10. Test Delete account with a throwaway user.

## Next Commercial Step

After Supabase auth/data is verified, wire RevenueCat web billing so the Supabase user id maps to the same RevenueCat app user id across web and iOS.
