-- CHRM cloud sync schema.
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drill_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  question text not null,
  transcript text,
  feedback jsonb,
  duration integer,
  score integer,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prep_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text,
  kit jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company, role)
);

create table if not exists public.hirevue_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  company text,
  role text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'free',
  revenuecat_app_user_id text,
  stripe_customer_id text,
  entitlement_id text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.drill_sessions enable row level security;
alter table public.prep_kits enable row level security;
alter table public.hirevue_sessions enable row level security;
alter table public.subscription_entitlements enable row level security;

drop policy if exists "profiles are self-owned" on public.profiles;
create policy "profiles are self-owned"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "drills are self-owned" on public.drill_sessions;
create policy "drills are self-owned"
  on public.drill_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "prep kits are self-owned" on public.prep_kits;
create policy "prep kits are self-owned"
  on public.prep_kits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "hirevue sessions are self-owned" on public.hirevue_sessions;
create policy "hirevue sessions are self-owned"
  on public.hirevue_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "entitlements are self-owned" on public.subscription_entitlements;
create policy "entitlements are self-owned"
  on public.subscription_entitlements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
