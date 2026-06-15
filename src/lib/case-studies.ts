import { supabase } from './supabase';
import type { CaseStudy, CaseStudyBlock } from '../types/case-study';
import { WORKS } from '../data/works';

const studySelect = `
  id, slug, title, subtitle, client, year, category, tags, featured, status,
  cover_url, cover_width, cover_height, external_url, sort_order, published_at,
  created_at, updated_at
`;

const blockSelect = 'id, case_study_id, sort_order, block_type, payload, created_at, updated_at';

const QUERY_TIMEOUT_MS = 12_000;

const withTimeout = async <T>(promise: PromiseLike<T>, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out — check your connection and Supabase project.`)),
      QUERY_TIMEOUT_MS
    );
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/** All published case studies for public works grids. */
export const fetchPublishedCaseStudiesListing = async (): Promise<CaseStudy[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('case_studies')
        .select(studySelect)
        .eq('status', 'published')
        .not('slug', 'is', null)
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false }),
      'Published case studies list'
    );

    if (error) {
      console.error('[case-studies] published list', error.message);
      return [];
    }
    return (data ?? []) as CaseStudy[];
  } catch (e) {
    console.error('[case-studies] published list failed', e);
    return [];
  }
};

/** Published case study for public `/works/:slug` page. */
export const fetchPublishedCaseStudy = async (slug: string): Promise<CaseStudy | null> => {
  if (!supabase) return null;

  try {
    const { data: study, error } = await withTimeout(
      supabase.from('case_studies').select(studySelect).eq('slug', slug).eq('status', 'published').maybeSingle(),
      'Case study lookup'
    );

    if (error) {
      console.error('[case-studies] published fetch', error.message);
      return null;
    }
    if (!study) return null;

    const { data: blocks, error: blocksError } = await withTimeout(
      supabase
        .from('case_study_blocks')
        .select(blockSelect)
        .eq('case_study_id', study.id)
        .order('sort_order', { ascending: true }),
      'Case study blocks lookup'
    );

    if (blocksError) console.error('[case-studies] blocks fetch', blocksError.message);

    return { ...(study as CaseStudy), blocks: (blocks ?? []) as CaseStudyBlock[] };
  } catch (e) {
    console.error('[case-studies]', e);
    return null;
  }
};

/** Editor/admin fetch by primary key. */
export const fetchCaseStudyByIdForEditor = async (id: string): Promise<CaseStudy | null> => {
  if (!supabase) return null;

  try {
    const { data: study, error } = await withTimeout(
      supabase.from('case_studies').select(studySelect).eq('id', id).maybeSingle(),
      'Editor case study lookup'
    );

    if (error) {
      console.error('[case-studies] editor fetch by id', error.message);
      throw new Error(error.message);
    }
    if (!study) return null;

    const { data: blocks, error: blocksError } = await withTimeout(
      supabase
        .from('case_study_blocks')
        .select(blockSelect)
        .eq('case_study_id', study.id)
        .order('sort_order', { ascending: true }),
      'Editor blocks lookup'
    );

    if (blocksError) {
      console.error('[case-studies] editor blocks', blocksError.message);
      throw new Error(blocksError.message);
    }

    return { ...(study as CaseStudy), blocks: (blocks ?? []) as CaseStudyBlock[] };
  } catch (e) {
    console.error('[case-studies] editor load failed', e);
    throw e instanceof Error ? e : new Error('Could not load case study.');
  }
};

/** Editor/admin fetch — includes drafts when authenticated. */
export const fetchCaseStudyForEditor = async (slug: string): Promise<CaseStudy | null> => {
  if (!supabase) return null;

  try {
    const { data: study, error } = await withTimeout(
      supabase.from('case_studies').select(studySelect).eq('slug', slug).maybeSingle(),
      'Editor case study lookup'
    );

    if (error) {
      console.error('[case-studies] editor fetch', error.message);
      throw new Error(error.message);
    }
    if (!study) return null;

    const { data: blocks, error: blocksError } = await withTimeout(
      supabase
        .from('case_study_blocks')
        .select(blockSelect)
        .eq('case_study_id', study.id)
        .order('sort_order', { ascending: true }),
      'Editor blocks lookup'
    );

    if (blocksError) {
      console.error('[case-studies] editor blocks', blocksError.message);
      throw new Error(blocksError.message);
    }

    return { ...(study as CaseStudy), blocks: (blocks ?? []) as CaseStudyBlock[] };
  } catch (e) {
    console.error('[case-studies] editor load failed', e);
    throw e instanceof Error ? e : new Error('Could not load case study.');
  }
};

export const fetchAllCaseStudiesAdmin = async (
  opts: { limit?: number; offset?: number } = {}
): Promise<{ rows: CaseStudy[]; total: number }> => {
  if (!supabase) return { rows: [], total: 0 };

  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;

  try {
    const { data, error, count } = await withTimeout(
      supabase
        .from('case_studies')
        .select(studySelect, { count: 'exact' })
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1),
      'Case studies list'
    );

    if (error) {
      console.error('[case-studies] list fetch', error.message);
      return { rows: [], total: 0 };
    }
    return { rows: (data ?? []) as CaseStudy[], total: count ?? 0 };
  } catch (e) {
    console.error('[case-studies] list failed', e);
    return { rows: [], total: 0 };
  }
};

/** Fallback metadata from static works when CMS entry missing. */
export const staticWorkFallback = (slug: string) => WORKS.find((w) => w.slug === slug) ?? null;

export const draftStudyFromWork = (slug: string): Partial<CaseStudy> | null => {
  const work = staticWorkFallback(slug);
  if (!work) return null;
  return {
    slug: work.slug,
    title: work.title,
    subtitle: work.subtitle,
    client: work.client,
    year: work.year,
    category: work.category,
    tags: work.tags ?? [],
    featured: Boolean(work.featured),
    status: 'draft',
    cover_url: work.thumbnail.src,
    cover_width: work.thumbnail.width,
    cover_height: work.thumbnail.height,
    external_url: work.href
  };
};

export const publishedSlugs = async (): Promise<Set<string>> => {
  if (!supabase) return new Set();
  const { data } = await supabase.from('case_studies').select('slug').eq('status', 'published');
  return new Set((data ?? []).map((r) => r.slug as string).filter(Boolean));
};
