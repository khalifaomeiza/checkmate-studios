/**
 * Canonical project catalogue for Checkmate Studios.
 *
 * Thumbnails live in src/assets/works/<slug>.png and are imported through
 * vite-imagetools (`?as=picture`), so every project ships AVIF + WebP +
 * PNG variants at 4 responsive widths automatically.
 *
 * The home page (RecentWorks) renders `featured: true` projects.
 */

// The `?as=picture` query routes the import through vite-imagetools so
// TypeScript resolves these to { img, sources } (see vite-env.d.ts).
// vite.config.ts's `defaultDirectives` adds the AVIF/WebP/PNG + responsive
// widths on top.
import delliooThumb from '../assets/works/dellioo.png?as=picture';
import giglyThumb from '../assets/works/gigly.png?as=picture';
import finAiThumb from '../assets/works/fin-ai.png?as=picture';
import picavacaThumb from '../assets/works/picavaca.png?as=picture';
import speedforgeThumb from '../assets/works/speedforge.png?as=picture';
import pixelPurseThumb from '../assets/works/pixel-purse.png?as=picture';
import julieJudeThumb from '../assets/works/julie-and-jude.png?as=picture';

export type WorkCategory =
  | 'Branding'
  | 'Website'
  | 'Application'
  | 'Illustration'
  | 'Adverts and Media';

export interface WorkThumbnail {
  src: string;
  sources: Record<string, string>; // MIME → srcset (avif/webp/png)
  width: number;
  height: number;
}

export interface Work {
  slug: string;
  title: string;
  subtitle: string;
  /** Primary category — used for the Offerings filter. */
  category: WorkCategory;
  /** Secondary categories — surfaced in detail copy, not the filter. */
  tags?: WorkCategory[];
  /** Project year for the small ribbon stamp. */
  year: string;
  /** Short label shown under the project title. */
  client: string;
  /** Optimised 16:9 thumbnail emitted by vite-imagetools. */
  thumbnail: WorkThumbnail;
  /** External case-study URL — points at Behance for now. */
  href: string;
  /** When true, surface on the home page Recent Works grid. */
  featured?: boolean;
}

type ImagetoolsPicture = {
  img: { src: string; w: number; h: number };
  sources: Record<string, string>;
};

const asThumb = (p: ImagetoolsPicture): WorkThumbnail => ({
  src: p.img.src,
  sources: p.sources,
  width: p.img.w,
  height: p.img.h
});

export const WORK_CATEGORIES: readonly WorkCategory[] = [
  'Branding',
  'Website',
  'Application',
  'Illustration',
  'Adverts and Media'
];

export const WORKS: readonly Work[] = [
  {
    slug: 'dellioo',
    title: 'Dellioo',
    subtitle: 'Brand identity, website & pitch deck design',
    category: 'Branding',
    tags: ['Website'],
    year: '2025',
    client: 'Dellioo',
    thumbnail: asThumb(delliooThumb),
    href: 'https://www.behance.net/checkmatestudios/',
    featured: true
  },
  {
    slug: 'gigly',
    title: 'Gigly',
    subtitle: 'Freelance service platform — brand identity',
    category: 'Application',
    tags: ['Branding'],
    year: '2025',
    client: 'Gigly',
    thumbnail: asThumb(giglyThumb),
    href: 'https://www.behance.net/checkmatestudios/',
    featured: true
  },
  {
    slug: 'fin-ai',
    title: 'Fin.Ai',
    subtitle: 'AI-native finance brand identity',
    category: 'Application',
    tags: ['Branding'],
    year: '2025',
    client: 'Fin.Ai',
    thumbnail: asThumb(finAiThumb),
    href: 'https://www.behance.net/checkmatestudios/',
    featured: true
  },
  {
    slug: 'picavaca',
    title: 'Picavaca',
    subtitle: 'A vacation company — full brand system',
    category: 'Branding',
    tags: ['Website'],
    year: '2024',
    client: 'Picavaca',
    thumbnail: asThumb(picavacaThumb),
    href: 'https://www.behance.net/checkmatestudios/',
    featured: true
  },
  {
    slug: 'speedforge',
    title: 'SpeedForge',
    subtitle: 'Motorsport-inspired brand identity',
    category: 'Branding',
    year: '2024',
    client: 'SpeedForge',
    thumbnail: asThumb(speedforgeThumb),
    href: 'https://www.behance.net/checkmatestudios/'
  },
  {
    slug: 'pixel-purse',
    title: 'Pixel Purse',
    subtitle: 'Playful illustration system',
    category: 'Illustration',
    year: '2024',
    client: 'Pixel Purse',
    thumbnail: asThumb(pixelPurseThumb),
    href: 'https://www.behance.net/checkmatestudios/'
  },
  {
    slug: 'julie-and-jude',
    title: 'Julie & Jude',
    subtitle: 'Campaign art-direction & visual storytelling',
    category: 'Adverts and Media',
    tags: ['Illustration'],
    year: '2024',
    client: 'Julie & Jude',
    thumbnail: asThumb(julieJudeThumb),
    href: 'https://www.behance.net/checkmatestudios/'
  }
];

export const featuredWorks = (): readonly Work[] =>
  WORKS.filter((w) => w.featured);

export const worksByCategory = (category: WorkCategory): readonly Work[] =>
  WORKS.filter((w) => w.category === category || w.tags?.includes(category));

/**
 * All works ordered the way the home page reveals them:
 * featured ones first (load order matches editorial weight), then the rest
 * in their declared sequence. Used by the "load more" pagination.
 */
export const allWorksForGrid = (): readonly Work[] => {
  const featured = WORKS.filter((w) => w.featured);
  const rest = WORKS.filter((w) => !w.featured);
  return [...featured, ...rest];
};
