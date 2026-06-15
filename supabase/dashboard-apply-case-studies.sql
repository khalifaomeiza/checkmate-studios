-- Paste into Supabase Dashboard → SQL Editor → Run
-- Project: studios.checkmate (vqsdynkbxvxdsshvrklo)
-- Applies case-study CMS migrations only (safe to re-run — uses IF NOT EXISTS / DROP IF EXISTS)

-- ========== 20260523000000_case_studies.sql ==========

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'editor'
              check (role in ('admin', 'editor')),
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_email_idx on public.profiles (email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_studio_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  );
$$;

create table if not exists public.case_studies (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  subtitle        text,
  client          text,
  year            text,
  category        text,
  tags            text[] not null default '{}',
  featured        boolean not null default false,
  status          text not null default 'draft'
                  check (status in ('draft', 'published')),
  cover_url       text,
  cover_width     integer,
  cover_height    integer,
  external_url    text,
  sort_order      integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists case_studies_slug_idx on public.case_studies (slug);
create index if not exists case_studies_status_idx on public.case_studies (status);
create index if not exists case_studies_featured_idx on public.case_studies (featured);

drop trigger if exists case_studies_set_updated_at on public.case_studies;
create trigger case_studies_set_updated_at
before update on public.case_studies
for each row execute function public.set_updated_at();

create table if not exists public.case_study_blocks (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid not null references public.case_studies (id) on delete cascade,
  sort_order      integer not null default 0,
  block_type      text not null
                  check (block_type in ('image', 'text', 'photo_grid', 'video', 'embed')),
  payload         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists case_study_blocks_study_idx
  on public.case_study_blocks (case_study_id, sort_order);

drop trigger if exists case_study_blocks_set_updated_at on public.case_study_blocks;
create trigger case_study_blocks_set_updated_at
before update on public.case_study_blocks
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.case_studies enable row level security;
alter table public.case_study_blocks enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_studio_editor());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

drop policy if exists case_studies_public_read on public.case_studies;
create policy case_studies_public_read on public.case_studies
  for select using (status = 'published' or public.is_studio_editor());

drop policy if exists case_studies_editor_write on public.case_studies;
create policy case_studies_editor_write on public.case_studies
  for all using (public.is_studio_editor())
  with check (public.is_studio_editor());

drop policy if exists case_study_blocks_public_read on public.case_study_blocks;
create policy case_study_blocks_public_read on public.case_study_blocks
  for select using (
    public.is_studio_editor()
    or exists (
      select 1 from public.case_studies cs
      where cs.id = case_study_id and cs.status = 'published'
    )
  );

drop policy if exists case_study_blocks_editor_write on public.case_study_blocks;
create policy case_study_blocks_editor_write on public.case_study_blocks
  for all using (public.is_studio_editor())
  with check (public.is_studio_editor());

-- ========== 20260523000001_case_study_media_storage.sql ==========

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-study-media',
  'case-study-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "case_study_media_public_read" on storage.objects;
create policy "case_study_media_public_read"
on storage.objects
for select
to public
using (bucket_id = 'case-study-media');

-- ========== 20260523000002_case_study_media_storage_insert.sql ==========

drop policy if exists "case_study_media_service_insert" on storage.objects;
create policy "case_study_media_service_insert"
on storage.objects
for insert
to service_role
with check (bucket_id = 'case-study-media');

drop policy if exists "case_study_media_service_update" on storage.objects;
create policy "case_study_media_service_update"
on storage.objects
for update
to service_role
using (bucket_id = 'case-study-media');

-- ========== 20260523000003_case_study_slug_optional.sql ==========

alter table public.case_studies alter column slug drop not null;

alter table public.case_studies drop constraint if exists case_studies_slug_key;
drop index if exists public.case_studies_slug_unique;
create unique index case_studies_slug_unique on public.case_studies (slug) where slug is not null;

alter table public.case_studies drop constraint if exists case_studies_published_requires_slug;
alter table public.case_studies add constraint case_studies_published_requires_slug
  check (status = 'draft' or slug is not null);
