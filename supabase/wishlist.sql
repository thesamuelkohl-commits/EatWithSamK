-- Eat With Sam K — private "want to try" list (wishlist.html), for Sam's own
-- use only. Run this once in your Supabase project's SQL Editor (Dashboard →
-- SQL Editor → New query → paste → Run). Safe to re-run, and safe to re-run
-- even if you already ran an earlier version of this file — every new
-- column uses ADD COLUMN IF NOT EXISTS.

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
