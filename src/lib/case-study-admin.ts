import { supabase } from './supabase';
import { draftStudyFromWork, fetchCaseStudyForEditor } from './case-studies';
import type {
  CaseStudy,
  CaseStudyBlock,
  CaseStudyBlockType,
  CaseStudyBlockPayload
} from '../types/case-study';

const assertClient = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isCaseStudyId = (value: string) => UUID_RE.test(value);

const normalizeSlug = (slug: string | null | undefined): string | null => {
  if (!slug?.trim()) return null;
  const normalized = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return normalized || null;
};

const validateSlug = (slug: string | null) => {
  if (!slug) return;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Slug must use lowercase letters, numbers, and hyphens only.');
  }
};

const mapStudyError = (error: { message?: string; code?: string } | null) => {
  const msg = error?.message ?? 'Could not save case study.';
  if (error?.code === '23505' || msg.includes('duplicate key')) {
    throw new Error('A case study with this slug already exists — choose a different slug.');
  }
  if (msg.includes('case_studies_published_requires_slug')) {
    throw new Error('Set a slug before publishing — it becomes the public URL.');
  }
  if (msg.includes('permission denied') || msg.includes('row-level security')) {
    throw new Error('You do not have editor access — sign up with an invite code or ask an admin.');
  }
  throw new Error(msg);
};

/** Create an empty draft row — slug can be added later before publish. */
export const createDraftCaseStudy = async (
  seed?: Partial<CaseStudy>
): Promise<CaseStudy> => {
  const client = assertClient();
  const suggestedSlug = normalizeSlug(seed?.slug);

  const row = {
    title: seed?.title?.trim() || 'Untitled project',
    slug: suggestedSlug,
    subtitle: seed?.subtitle ?? null,
    client: seed?.client ?? null,
    year: seed?.year ?? null,
    category: seed?.category ?? null,
    tags: seed?.tags ?? [],
    featured: seed?.featured ?? false,
    status: 'draft' as const,
    cover_url: seed?.cover_url ?? null,
    cover_width: seed?.cover_width ?? null,
    cover_height: seed?.cover_height ?? null,
    external_url: seed?.external_url ?? null,
    sort_order: seed?.sort_order ?? 0,
    published_at: null
  };

  if (row.slug) validateSlug(row.slug);

  const { data, error } = await client.from('case_studies').insert(row).select().single();
  if (error || !data) mapStudyError(error);
  return data as CaseStudy;
};

/** Open existing CMS row for a portfolio work, or seed a new draft from static metadata. */
export const openOrCreateCaseStudyForWork = async (workSlug: string): Promise<CaseStudy> => {
  const existing = await fetchCaseStudyForEditor(workSlug);
  if (existing) return existing;

  const seed = draftStudyFromWork(workSlug);
  if (!seed) throw new Error(`Unknown work: ${workSlug}`);

  return createDraftCaseStudy(seed);
};

export const upsertCaseStudy = async (
  study: Partial<CaseStudy> & Pick<CaseStudy, 'title'>
): Promise<CaseStudy> => {
  const client = assertClient();
  const status = study.status ?? 'draft';
  const slug = normalizeSlug(study.slug);

  if (status === 'published' && !slug) {
    throw new Error('Set a slug before publishing — it becomes the public URL.');
  }
  if (slug) validateSlug(slug);

  const row = {
    title: study.title.trim(),
    slug,
    subtitle: study.subtitle ?? null,
    client: study.client ?? null,
    year: study.year ?? null,
    category: study.category ?? null,
    tags: study.tags ?? [],
    featured: study.featured ?? false,
    status,
    cover_url: study.cover_url ?? null,
    cover_width: study.cover_width ?? null,
    cover_height: study.cover_height ?? null,
    external_url: study.external_url ?? null,
    sort_order: study.sort_order ?? 0,
    published_at:
      status === 'published' ? study.published_at ?? new Date().toISOString() : null
  };

  const { data, error } = study.id
    ? await client.from('case_studies').update(row).eq('id', study.id).select().single()
    : await client.from('case_studies').insert({ ...row, slug: slug ?? null }).select().single();

  if (error || !data) mapStudyError(error);
  return data as CaseStudy;
};

export const replaceCaseStudyBlocks = async (
  caseStudyId: string,
  blocks: Array<{
    id?: string;
    block_type: CaseStudyBlockType;
    payload: CaseStudyBlockPayload;
    sort_order: number;
  }>
): Promise<CaseStudyBlock[]> => {
  const client = assertClient();

  const { error: deleteError } = await client
    .from('case_study_blocks')
    .delete()
    .eq('case_study_id', caseStudyId);

  if (deleteError) throw new Error(deleteError.message);

  if (blocks.length === 0) return [];

  const rows = blocks.map((b) => ({
    case_study_id: caseStudyId,
    block_type: b.block_type,
    payload: b.payload,
    sort_order: b.sort_order
  }));

  const { data, error } = await client.from('case_study_blocks').insert(rows).select();
  if (error || !data) throw new Error(error?.message ?? 'Could not save blocks.');
  return data as CaseStudyBlock[];
};

export const deleteCaseStudy = async (id: string): Promise<void> => {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  const client = assertClient();

  if (!url || !anon) {
    throw new Error('Supabase is not configured.');
  }

  if (!isCaseStudyId(id)) {
    throw new Error('Invalid case study id.');
  }

  const { data: refreshed, error: refreshError } = await client.auth.refreshSession();
  const session = refreshed.session ?? (await client.auth.getSession()).data.session;

  if (refreshError && !session?.access_token) {
    throw new Error('Your session expired — sign in again.');
  }

  if (!session?.access_token) {
    throw new Error('You must be signed in to delete case studies.');
  }

  const res = await fetch(`${url}/functions/v1/case-study-delete`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ caseStudyId: id })
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!res.ok || !json?.success) {
    const hint =
      res.status === 401
        ? 'Session invalid — try signing out and back in.'
        : res.status === 404
          ? 'Case study not found.'
          : res.status === 503
            ? 'Delete service not deployed — run npm run fn:deploy.'
            : null;
    throw new Error(json?.message ?? hint ?? `Delete failed (${res.status})`);
  }
};

export interface MediaUploadResult {
  url: string;
  r2Key: string;
  mime: string;
  width?: number;
  height?: number;
}

const readLocalImageSize = (
  file: File
): Promise<{ width: number; height: number } | null> => {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
};

export const uploadCaseStudyMedia = async (
  file: File,
  caseStudyId: string
): Promise<MediaUploadResult> => {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  const client = assertClient();

  if (!url || !anon) {
    throw new Error('Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  if (!isCaseStudyId(caseStudyId)) {
    throw new Error('Save the project first — uploads need a project id.');
  }

  const localSize = await readLocalImageSize(file);

  const { data: refreshed, error: refreshError } = await client.auth.refreshSession();
  const session = refreshed.session ?? (await client.auth.getSession()).data.session;

  if (refreshError && !session?.access_token) {
    throw new Error('Your session expired — sign in again.');
  }

  if (!session?.access_token) {
    throw new Error('You must be signed in to upload media.');
  }

  const form = new FormData();
  form.set('file', file);
  form.set('caseStudyId', caseStudyId);

  const res = await fetch(`${url}/functions/v1/case-study-media-upload`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${session.access_token}`
    },
    body: form
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: MediaUploadResult;
  } | null;

  if (!res.ok || !json?.success || !json.data) {
    const hint =
      res.status === 401
        ? 'Session invalid — try signing out and back in.'
        : res.status === 404
          ? 'Upload service not deployed — run npm run fn:deploy.'
          : res.status === 500 && json?.message?.includes('not configured')
            ? 'Storage not configured — run supabase db push and set R2 secrets (see README).'
            : null;
    throw new Error(json?.message ?? hint ?? `Upload failed (${res.status})`);
  }

  return {
    ...json.data,
    width: json.data.width ?? localSize?.width,
    height: json.data.height ?? localSize?.height
  };
};

export interface AdminSignupInput {
  email: string;
  password: string;
  fullName: string;
  inviteCode: string;
}

export const adminSignup = async (input: AdminSignupInput): Promise<void> => {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  const res = await fetch(`${url}/functions/v1/admin-signup`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? `Signup failed (${res.status})`);
  }
};
