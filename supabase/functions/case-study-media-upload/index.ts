// Upload case study media — multipart POST with `file` + `caseStudyId`
// Prefers Cloudflare R2 when secrets are set; otherwise Supabase Storage (case-study-media bucket).
// Requires authenticated studio editor (JWT in Authorization header).

import { handlePreflight } from '../_shared/cors.ts';
import { fail, ok } from '../_shared/respond.ts';
import { requireEditor } from '../_shared/auth.ts';
import { readImageDimensions } from '../_shared/image-dimensions.ts';
import {
  sanitizeCaseStudyId,
  uploadToR2,
  uploadToSupabaseStorage
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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'Expected multipart form data.', origin);
  }

  const file = form.get('file');
  const caseStudyId =
    sanitizeCaseStudyId(String(form.get('caseStudyId') ?? '')) ??
    sanitizeCaseStudyId(String(form.get('caseStudySlug') ?? ''));

  if (!(file instanceof File)) return fail(400, 'Missing file.', origin);
  if (!caseStudyId) return fail(400, 'Missing or invalid caseStudyId.', origin);

  const mime = file.type || 'application/octet-stream';
  if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
    return fail(400, 'Only image and video files are supported.', origin);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = readImageDimensions(bytes, mime);

  try {
    const r2Upload = await uploadToR2(bytes, mime, caseStudyId);
    if (r2Upload) {
      return ok(
        'Uploaded',
        {
          url: r2Upload.url,
          r2Key: r2Upload.storageKey,
          mime,
          width: dimensions.width,
          height: dimensions.height,
          size: bytes.byteLength,
          storage: r2Upload.storage
        },
        origin
      );
    }

    const storageUpload = await uploadToSupabaseStorage(bytes, mime, caseStudyId);
    if (storageUpload) {
      return ok(
        'Uploaded',
        {
          url: storageUpload.url,
          r2Key: storageUpload.storageKey,
          mime,
          width: dimensions.width,
          height: dimensions.height,
          size: bytes.byteLength,
          storage: storageUpload.storage
        },
        origin
      );
    }

    return fail(
      500,
      'Media storage is not configured — set R2 secrets on the Supabase project, or run supabase db push for Storage fallback.',
      origin
    );
  } catch (e) {
    return fail(500, e instanceof Error ? e.message : 'Upload failed.', origin);
  }
});
