-- ============================================================
-- Course Platform Database Schema
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ============================================================

-- Table: tracks whether a user has paid for the course
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending', -- 'pending' | 'success' | 'failed'
  amount integer not null, -- amount in the smallest currency unit (kobo/cents)
  currency text not null default 'NGN', -- 'NGN' or 'USD'
  paystack_reference text unique not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- One successful purchase per user (prevents duplicate charges being needed)
create unique index if not exists purchases_user_success_idx
  on public.purchases (user_id)
  where status = 'success';

-- Table: the list of course videos (so it's editable without redeploying code)
create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  order_index integer not null default 0,
  r2_object_key text not null, -- the file path/key inside your R2 bucket
  duration_minutes integer,
  created_at timestamptz default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.purchases enable row level security;
alter table public.videos enable row level security;

-- Users can see only their own purchase records
create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Only the server (service role key) can insert/update purchases —
-- this happens via the Paystack webhook, never directly from the browser.
-- No insert/update policy is created for regular users on purpose.

-- Any authenticated user can view the video list (titles/descriptions),
-- but the actual video FILE is only reachable via a signed URL your
-- server generates after checking they've paid (see /api/video-url).
create policy "Authenticated users can view video metadata"
  on public.videos for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Helper function: has this user paid?
-- ============================================================
create or replace function public.has_active_purchase(check_user_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.purchases
    where user_id = check_user_id and status = 'success'
  );
$$;

-- ============================================================
-- Seed placeholder videos — EDIT these titles/keys to match
-- the actual files you upload to your R2 bucket.
-- ============================================================
insert into public.videos (title, description, order_index, r2_object_key, duration_minutes) values
  ('Module 1: Introduction', 'Placeholder description', 1, 'videos/module-1.mp4', 35),
  ('Module 2: Getting Started', 'Placeholder description', 2, 'videos/module-2.mp4', 35),
  ('Module 3: Core Concepts', 'Placeholder description', 3, 'videos/module-3.mp4', 35),
  ('Module 4: Deep Dive', 'Placeholder description', 4, 'videos/module-4.mp4', 35),
  ('Module 5: Practical Example', 'Placeholder description', 5, 'videos/module-5.mp4', 35),
  ('Module 6: Advanced Topics', 'Placeholder description', 6, 'videos/module-6.mp4', 35),
  ('Module 7: Case Study', 'Placeholder description', 7, 'videos/module-7.mp4', 35),
  ('Module 8: Common Mistakes', 'Placeholder description', 8, 'videos/module-8.mp4', 35),
  ('Module 9: Putting It Together', 'Placeholder description', 9, 'videos/module-9.mp4', 35),
  ('Module 10: Conclusion & Next Steps', 'Placeholder description', 10, 'videos/module-10.mp4', 35)
on conflict do nothing;
