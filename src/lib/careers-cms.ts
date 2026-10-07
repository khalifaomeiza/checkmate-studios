import { supabase } from './supabase';
import { CAREERS_PAGE_FALLBACK, CAREER_JOBS_FALLBACK } from '../data/careers-fallback';
import type { CareerJob, CareerJobInput, CareersPageConfig } from '../types/cms';

const jobSelect =
  'id, slug, title, category, location, employment_type, description, responsibilities, requirements, status, sort_order, posted_at, created_at, updated_at';

const parseCareersConfig = (raw: unknown): CareersPageConfig => {
  const cfg = (raw ?? {}) as Record<string, unknown>;
  const benefits = cfg.benefits;
  return {
    heroTitleHtml:
      typeof cfg.heroTitleHtml === 'string' ? cfg.heroTitleHtml : CAREERS_PAGE_FALLBACK.heroTitleHtml,
    heroSubtitle:
      typeof cfg.heroSubtitle === 'string' ? cfg.heroSubtitle : CAREERS_PAGE_FALLBACK.heroSubtitle,
    benefits:
      Array.isArray(benefits) && benefits.every((b) => typeof b === 'string')
        ? (benefits as string[])
        : CAREERS_PAGE_FALLBACK.benefits
  };
};

export const fetchCareersPageConfig = async (): Promise<CareersPageConfig> => {
  if (!supabase) return CAREERS_PAGE_FALLBACK;

  const { data, error } = await supabase
    .from('site_pages')
    .select('config')
    .eq('page_key', 'careers')
    .maybeSingle();

  if (error || !data) return CAREERS_PAGE_FALLBACK;
  return parseCareersConfig(data.config);
};

export const saveCareersPageConfig = async (config: CareersPageConfig): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('site_pages')
    .upsert({ page_key: 'careers', config }, { onConflict: 'page_key' });

  if (error) throw new Error(error.message);
};

export const fetchPublishedCareerJobs = async (): Promise<CareerJob[]> => {
  if (!supabase) return CAREER_JOBS_FALLBACK;

  const { data, error } = await supabase
    .from('career_jobs')
    .select(jobSelect)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('[careers-cms] published list', error.message);
    return CAREER_JOBS_FALLBACK;
  }
  if (!data?.length) return CAREER_JOBS_FALLBACK;
  return data as CareerJob[];
};

export const fetchAllCareerJobsAdmin = async (): Promise<CareerJob[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('career_jobs')
    .select(jobSelect)
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CareerJob[];
};

export const fetchCareerJobById = async (id: string): Promise<CareerJob | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase.from('career_jobs').select(jobSelect).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CareerJob | null) ?? null;
};

export const createCareerJob = async (input: CareerJobInput): Promise<CareerJob> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('career_jobs')
    .insert({ ...input, posted_at: input.posted_at ?? new Date().toISOString() })
    .select(jobSelect)
    .single();

  if (error) throw new Error(error.message);
  return data as CareerJob;
};

export const updateCareerJob = async (id: string, input: CareerJobInput): Promise<CareerJob> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('career_jobs')
    .update(input)
    .eq('id', id)
    .select(jobSelect)
    .single();

  if (error) throw new Error(error.message);
  return data as CareerJob;
};

export const deleteCareerJob = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('career_jobs').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const formatPostedAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted 1d ago';
  return `Posted ${days}d ago`;
};
