-- Public bucket for large marketing resource .zips (upload via service role locally).
-- Max object size: raise if your zips exceed Supabase project default (check Dashboard → Storage).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-zips',
  'resource-zips',
  true,
  262144000, -- 250 MiB per object (adjust in dashboard if needed)
  null
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- World-readable downloads (public URLs).
drop policy if exists "resource_zips_public_read" on storage.objects;
create policy "resource_zips_public_read"
on storage.objects
for select
to public
using (bucket_id = 'resource-zips');
