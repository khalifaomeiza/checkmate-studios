-- Slug is optional on drafts; required when published. Media uploads use case study id, not slug.

alter table public.case_studies alter column slug drop not null;

alter table public.case_studies drop constraint if exists case_studies_slug_key;
drop index if exists public.case_studies_slug_unique;
create unique index case_studies_slug_unique on public.case_studies (slug) where slug is not null;

alter table public.case_studies drop constraint if exists case_studies_published_requires_slug;
alter table public.case_studies add constraint case_studies_published_requires_slug
  check (status = 'draft' or slug is not null);
