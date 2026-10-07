import { supabase } from './supabase';
import {
  PLAYGROUND_PAGE_FALLBACK,
  PLAYGROUND_POSTS_FALLBACK
} from '../data/playground-fallback';
import type {
  PlaygroundPageConfig,
  PlaygroundPost,
  PlaygroundPostInput
} from '../types/cms';

const postSelect =
  'id, slug, title, excerpt, category, author, author_role, image_url, body, status, sort_order, published_at, created_at, updated_at';

const parsePlaygroundConfig = (raw: unknown): PlaygroundPageConfig => {
  const cfg = (raw ?? {}) as Record<string, unknown>;
  const words = cfg.scrambleWords;
  const subtitle = cfg.heroSubtitle;
  return {
    scrambleWords: Array.isArray(words) && words.every((w) => typeof w === 'string')
      ? (words as string[])
      : PLAYGROUND_PAGE_FALLBACK.scrambleWords,
    heroSubtitle:
      typeof subtitle === 'string' ? subtitle : PLAYGROUND_PAGE_FALLBACK.heroSubtitle
  };
};

export const fetchPlaygroundPageConfig = async (): Promise<PlaygroundPageConfig> => {
  if (!supabase) return PLAYGROUND_PAGE_FALLBACK;

  const { data, error } = await supabase
    .from('site_pages')
    .select('config')
    .eq('page_key', 'playground')
    .maybeSingle();

  if (error || !data) return PLAYGROUND_PAGE_FALLBACK;
  return parsePlaygroundConfig(data.config);
};

export const savePlaygroundPageConfig = async (config: PlaygroundPageConfig): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('site_pages')
    .upsert({ page_key: 'playground', config }, { onConflict: 'page_key' });

  if (error) throw new Error(error.message);
};

export const fetchPublishedPlaygroundPosts = async (): Promise<PlaygroundPost[]> => {
  if (!supabase) return PLAYGROUND_POSTS_FALLBACK;

  const { data, error } = await supabase
    .from('playground_posts')
    .select(postSelect)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[playground-cms] published list', error.message);
    return PLAYGROUND_POSTS_FALLBACK;
  }
  if (!data?.length) return PLAYGROUND_POSTS_FALLBACK;
  return data as PlaygroundPost[];
};

export const fetchAllPlaygroundPostsAdmin = async (): Promise<PlaygroundPost[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('playground_posts')
    .select(postSelect)
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PlaygroundPost[];
};

export const fetchPlaygroundPostById = async (id: string): Promise<PlaygroundPost | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase.from('playground_posts').select(postSelect).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PlaygroundPost | null) ?? null;
};

export const createPlaygroundPost = async (input: PlaygroundPostInput): Promise<PlaygroundPost> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const row = {
    ...input,
    published_at:
      input.status === 'published'
        ? (input.published_at ?? new Date().toISOString())
        : (input.published_at ?? null)
  };

  const { data, error } = await supabase.from('playground_posts').insert(row).select(postSelect).single();
  if (error) throw new Error(error.message);
  return data as PlaygroundPost;
};

export const updatePlaygroundPost = async (
  id: string,
  input: PlaygroundPostInput
): Promise<PlaygroundPost> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const row = {
    ...input,
    published_at:
      input.status === 'published'
        ? (input.published_at ?? new Date().toISOString())
        : (input.published_at ?? null)
  };

  const { data, error } = await supabase
    .from('playground_posts')
    .update(row)
    .eq('id', id)
    .select(postSelect)
    .single();

  if (error) throw new Error(error.message);
  return data as PlaygroundPost;
};

export const deletePlaygroundPost = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('playground_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const formatPlaygroundDate = (iso: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
