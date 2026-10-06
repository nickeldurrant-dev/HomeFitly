-- Prelaunch waitlist for the HomeFitly landing page
-- Apply via Supabase Dashboard > SQL Editor

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null,
  platform text not null default 'iphone' check (platform in ('iphone', 'android')),
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_unique on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

drop policy if exists "Allow anonymous waitlist signups" on public.waitlist;
create policy "Allow anonymous waitlist signups"
  on public.waitlist for insert
  to anon
  with check (true);
