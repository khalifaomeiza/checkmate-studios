import { WORKS, type Work, type WorkCategory, type WorkThumbnail } from '../data/works';
import type { CaseStudy } from '../types/case-study';
import { fetchPublishedCaseStudiesListing } from './case-studies';

const mimeFromUrl = (url: string): string => {
  const path = url.split('?')[0].toLowerCase();
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.avif')) return 'image/avif';
  return 'image/jpeg';
};

export const rasterThumb = (url: string, width: number, height: number): WorkThumbnail => {
  const mime = mimeFromUrl(url);
  return {
    src: url,
    sources: { [mime]: `${url} ${width}w` },
    width,
    height
  };
};

const asCategory = (value: string | null | undefined, fallback: WorkCategory): WorkCategory => {
  const categories: WorkCategory[] = [
    'Branding',
    'Website',
    'Application',
    'Illustration',
    'Adverts and Media'
  ];
  return categories.includes(value as WorkCategory) ? (value as WorkCategory) : fallback;
};

/** Map a published CMS row onto the Work card shape (static work fills gaps). */
export const caseStudyToWork = (study: CaseStudy, base?: Work): Work => {
  const slug = study.slug!;
  const width = study.cover_width ?? base?.thumbnail.width ?? 1600;
  const height = study.cover_height ?? base?.thumbnail.height ?? 900;
  const coverUrl = study.cover_url ?? base?.thumbnail.src ?? '';

  return {
    slug,
    title: study.title,
    subtitle: study.subtitle ?? base?.subtitle ?? '',
    client: study.client ?? base?.client ?? '',
    year: study.year ?? base?.year ?? '',
    category: asCategory(study.category, base?.category ?? 'Branding'),
    tags: (study.tags?.length ? study.tags : base?.tags) as WorkCategory[] | undefined,
    featured: study.featured,
    thumbnail: coverUrl
      ? rasterThumb(coverUrl, width, height)
      : (base?.thumbnail ?? rasterThumb('', width, height)),
    href: `/works/${slug}`
  };
};

/** Static portfolio + published CMS overrides + CMS-only published projects. */
export const mergeWorksCatalog = (published: CaseStudy[]): Work[] => {
  const cmsBySlug = new Map(
    published.filter((s) => s.slug).map((s) => [s.slug as string, s])
  );
  const mergedSlugs = new Set<string>();
  const merged: Work[] = [];

  for (const staticWork of WORKS) {
    const cms = cmsBySlug.get(staticWork.slug);
    merged.push(cms ? caseStudyToWork(cms, staticWork) : staticWork);
    mergedSlugs.add(staticWork.slug);
  }

  const cmsOnly = published
    .filter((s) => s.slug && !mergedSlugs.has(s.slug))
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        (b.published_at ?? '').localeCompare(a.published_at ?? '')
    );

  for (const study of cmsOnly) {
    merged.push(caseStudyToWork(study));
  }

  return merged;
};

export const featuredFirst = (works: readonly Work[]): Work[] => {
  const featured = works.filter((w) => w.featured);
  const rest = works.filter((w) => !w.featured);
  return [...featured, ...rest];
};

export const loadWorksCatalog = async (): Promise<Work[]> => {
  const published = await fetchPublishedCaseStudiesListing();
  return published.length > 0 ? mergeWorksCatalog(published) : [...WORKS];
};
