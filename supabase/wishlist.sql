-- Eat With Sam K — private "want to try" list (wishlist.html), for Sam's own
-- use plus a small number of invited read-only viewers. Run this once in
-- your Supabase project's SQL Editor (Dashboard → SQL Editor → New query →
-- paste → Run). Safe to re-run, and safe to re-run even if you already ran
-- an earlier version of this file — every new column uses ADD COLUMN IF NOT
-- EXISTS, and every policy uses DROP POLICY IF EXISTS before recreating it.

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

-- `slug` is a folder name under images/wishlist/<slug>/cover.jpg — set only
-- when Claude has researched an entry and found a real cover photo. Left
-- null for anything added manually through the on-site form; those just
-- show the placeholder card until enriched.
alter table public.wishlist add column if not exists slug text;
alter table public.wishlist add column if not exists city text;
alter table public.wishlist add column if not exists address text;
alter table public.wishlist add column if not exists phone text;
alter table public.wishlist add column if not exists website text;
alter table public.wishlist add column if not exists lat double precision;
alter table public.wishlist add column if not exists lng double precision;
alter table public.wishlist add column if not exists cuisine text;
alter table public.wishlist add column if not exists notes text;
alter table public.wishlist add column if not exists tried boolean default false not null;

alter table public.wishlist enable row level security;

-- Same model as favorites.sql — everyone can only ever see or touch their
-- own rows, so this table is safe even though the anon key is public.
drop policy if exists "select own wishlist" on public.wishlist;
create policy "select own wishlist"
  on public.wishlist for select
  using (auth.uid() = user_id);

drop policy if exists "insert own wishlist" on public.wishlist;
create policy "insert own wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own wishlist" on public.wishlist;
create policy "update own wishlist"
  on public.wishlist for update
  using (auth.uid() = user_id);

drop policy if exists "delete own wishlist" on public.wishlist;
create policy "delete own wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- Read-only access for invited viewers (see VIEWER_EMAILS in js/wishlist.js,
-- which must match this list — that file's check is UX only, this policy is
-- what actually grants the access). This is a second, additive SELECT
-- policy: Postgres OR's multiple permissive policies for the same command,
-- so it doesn't touch "select own wishlist" above. No insert/update/delete
-- policy is added for viewers, so they can never edit or remove Sam's rows.
drop policy if exists "select wishlist for invited viewers" on public.wishlist;
create policy "select wishlist for invited viewers"
  on public.wishlist for select
  using ((auth.jwt() ->> 'email') in ('melanie.davis044@gmail.com'));
