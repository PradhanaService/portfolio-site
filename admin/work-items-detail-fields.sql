-- Run once in the Supabase SQL Editor to enable the project detail fields
-- managed by admin/dashboard.html.
alter table public.work_items
  add column if not exists client_name text,
  add column if not exists overview text,
  add column if not exists challenge_text text,
  add column if not exists approach_text text,
  add column if not exists duration text,
  add column if not exists live_site_url text,
  add column if not exists review_url text,
  add column if not exists process_steps jsonb not null default '[]'::jsonb,
  add column if not exists outcomes jsonb not null default '[]'::jsonb;
