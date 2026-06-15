-- Allow service-role uploads to case-study-media (edge function fallback when R2 is unset).
-- Service role bypasses RLS by default; this policy supports setups that enforce storage RLS.

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
