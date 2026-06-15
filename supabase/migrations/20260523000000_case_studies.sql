-- Case studies CMS — profiles, studies, blocks, RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (studio admin / editors)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Case studies
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Case study blocks (Behance-style sections)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.case_studies enable row level security;
alter table public.case_study_blocks enable row level security;

-- Profiles: users read/update own row; editors read all profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_studio_editor());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- Case studies: public read published; editors full access
drop policy if exists case_studies_public_read on public.case_studies;
create policy case_studies_public_read on public.case_studies
  for select using (status = 'published' or public.is_studio_editor());

drop policy if exists case_studies_editor_write on public.case_studies;
create policy case_studies_editor_write on public.case_studies
  for all using (public.is_studio_editor())
  with check (public.is_studio_editor());

-- Blocks: inherit study visibility
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
