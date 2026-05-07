-- ============================================================================
-- Checkmate Studios — Supabase schema
-- Copy & paste this into Supabase SQL Editor and run.
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper: trigger to auto-update updated_at columns
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ============================================================================
-- 1. Newsletter subscribers (footer + resources newsletter)
-- ============================================================================
create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  first_name      text,
  source          text not null default 'website'
                  check (source in (
                    'website', 'footer', 'popup', 'landing_page',
                    'resources_page', 'newsletter_card'
                  )),
  status          text not null default 'active'
                  check (status in ('active', 'unsubscribed', 'bounced')),
  ip_address      text,
  user_agent      text,
  subscribed_at   timestamptz not null default timezone('utc', now()),
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  unique (email)
);

create index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (email);
create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

drop trigger if exists newsletter_subscribers_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_set_updated_at
before update on public.newsletter_subscribers
for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. Contact form submissions (home page contact section)
-- ============================================================================
create table if not exists public.contact_submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  service         text,
  budget          text,
  project_details text,
  source          text not null default 'contact_form',
  status          text not null default 'new'
                  check (status in ('new', 'in_progress', 'closed', 'spam')),
  ip_address      text,
  user_agent      text,
  submitted_at    timestamptz not null default timezone('utc', now()),
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists contact_submissions_email_idx
  on public.contact_submissions (email);
create index if not exists contact_submissions_submitted_at_idx
  on public.contact_submissions (submitted_at desc);

drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. Career applications
-- ============================================================================
create table if not exists public.career_applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        text not null,
  job_title     text not null,
  full_name     text not null,
  email         text not null,
  portfolio_url text,
  resume_url    text,
  resume_name   text,
  cover_letter  text,
  status        text not null default 'received'
                check (status in ('received', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  ip_address    text,
  user_agent    text,
  submitted_at  timestamptz not null default timezone('utc', now()),
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

create index if not exists career_applications_job_id_idx
  on public.career_applications (job_id);
create index if not exists career_applications_email_idx
  on public.career_applications (email);

drop trigger if exists career_applications_set_updated_at on public.career_applications;
create trigger career_applications_set_updated_at
before update on public.career_applications
for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. Storage bucket for resume uploads (public-read for emailed links)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_submissions   enable row level security;
alter table public.career_applications   enable row level security;

-- The Express server uses the SERVICE ROLE KEY which bypasses RLS by design.
-- These policies block anon-key writes from the browser.

-- Newsletter: deny anon access by default
drop policy if exists "newsletter_no_anon_select" on public.newsletter_subscribers;
create policy "newsletter_no_anon_select"
on public.newsletter_subscribers for select
to anon using (false);

-- Contact submissions: deny anon access
drop policy if exists "contact_no_anon_select" on public.contact_submissions;
create policy "contact_no_anon_select"
on public.contact_submissions for select
to anon using (false);

-- Career applications: deny anon access
drop policy if exists "careers_no_anon_select" on public.career_applications;
create policy "careers_no_anon_select"
on public.career_applications for select
to anon using (false);

-- ============================================================================
-- Storage policy: allow authenticated server uploads to resumes/
-- (service-role key bypasses RLS automatically; this allows signed uploads.)
-- ============================================================================
drop policy if exists "resumes_public_read" on storage.objects;
create policy "resumes_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'resumes');
