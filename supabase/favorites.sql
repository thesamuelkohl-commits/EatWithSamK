-- Eat With Sam K — "Saved places" table for real accounts.
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS throughout.

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  place_id text not null,
  created_at timestamptz default now() not null,
  primary key (user_id, place_id)
);

alter table public.favorites enable row level security;

-- Each signed-in visitor can only ever read, add, or remove their OWN rows —
-- this is what actually keeps everyone's saved list private, not the anon key.
drop policy if exists "select own favorites" on public.favorites;
create policy "select own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "insert own favorites" on public.favorites;
create policy "insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete own favorites" on public.favorites;
create policy "delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
