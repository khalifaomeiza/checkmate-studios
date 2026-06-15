-- Public bucket for case study editor media (images + video).
-- Upload via case-study-media-upload Edge Function (service role).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-study-media',
  'case-study-media',
  true,
  52428800, -- 50 MiB per object
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
