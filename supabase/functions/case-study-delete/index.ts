// Delete a case study and all associated media (Cloudflare R2 + Supabase Storage).

import { handlePreflight } from '../_shared/cors.ts';
import { fail, ok } from '../_shared/respond.ts';
import { requireEditor } from '../_shared/auth.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import {
  collectR2KeysFromBlocks,
  collectSupabasePathsFromBlocks,
  deleteR2CaseStudyMedia,
  deleteSupabaseCaseStudyMedia,
  deleteSupabasePaths,
  sanitizeCaseStudyId
} from '../_shared/case-study-storage.ts';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return fail(405, 'Method not allowed', origin);

  try {
    await requireEditor(req);
  } catch (e) {
    return fail(401, e instanceof Error ? e.message : 'Unauthorized', origin);
  }

  let body: { caseStudyId?: string };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Expected JSON body.', origin);
  }

  const caseStudyId = sanitizeCaseStudyId(String(body.caseStudyId ?? ''));
  if (!caseStudyId) return fail(400, 'Missing or invalid caseStudyId.', origin);

  const supabase = createServiceClient();

  const { data: study, error: studyError } = await supabase
    .from('case_studies')
    .select('id, cover_url')
    .eq('id', caseStudyId)
    .maybeSingle();

  if (studyError) return fail(500, studyError.message, origin);
  if (!study) return fail(404, 'Case study not found.', origin);

  const { data: blocks, error: blocksError } = await supabase
    .from('case_study_blocks')
    .select('payload')
    .eq('case_study_id', caseStudyId);

  if (blocksError) return fail(500, blocksError.message, origin);

  const blockRows = blocks ?? [];
  const extraR2Keys = collectR2KeysFromBlocks(blockRows, study.cover_url);
  const supabasePaths = collectSupabasePathsFromBlocks(blockRows, study.cover_url);

  try {
    const [r2Result, supabaseFolder, supabaseLoose] = await Promise.all([
      deleteR2CaseStudyMedia(caseStudyId, extraR2Keys),
      deleteSupabaseCaseStudyMedia(caseStudyId),
      deleteSupabasePaths(supabasePaths)
    ]);

    const { error: deleteError } = await supabase.from('case_studies').delete().eq('id', caseStudyId);
    if (deleteError) return fail(500, deleteError.message, origin);

    return ok(
      'Case study deleted',
      {
        caseStudyId,
        media: {
          r2: r2Result,
          supabaseFolder,
          supabasePaths: supabaseLoose
        }
      },
      origin
    );
  } catch (e) {
    return fail(500, e instanceof Error ? e.message : 'Delete failed.', origin);
  }
});
