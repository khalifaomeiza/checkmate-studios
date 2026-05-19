import { RESOURCE_ZIP_CLOUDINARY_URLS } from './resourceZipUrls.generated';

export interface ResourceProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  /** Path under `public/resources/` */
  coverPath: string;
  /** Primary archive path under `public/resources/` (single-product downloads). */
  downloadPath: string;
  /** When set (Master Bundle), user can download every archive at once. */
  downloadPaths?: readonly string[];
  included: string[];
  homeFeatured: boolean;
  fullWidth?: boolean;
  isMasterBundle?: boolean;
}

export const RESOURCE_FILE_PATHS = [
  'Files/Branding Guidelines.zip',
  'Files/Gradients.zip',
  'Files/Micrographics Templates.zip',
  'Files/Proposal Template.zip',
  'Files/Textures.zip',
  'Files/VHS Textures.zip'
] as const;

export type ResourceFilePath = (typeof RESOURCE_FILE_PATHS)[number];

export const resourceUrl = (pathUnderResources: string): string =>
  encodeURI(`/resources/${pathUnderResources.replace(/^\//, '')}`);

/** Native cover frame for catalog + Master Bundle on grid and download (see `Resources *.png`). */
export const RESOURCE_CATALOG_COVER_ASPECT = '1825/1906' as const;
/** Prefer hosted URL when present (see resourceZipUrls.generated.ts). */
export const resourceDownloadUrl = (pathUnderResources: string): string => {
  const normalized = pathUnderResources.replace(/^\//, '');
  const direct = RESOURCE_ZIP_CLOUDINARY_URLS[normalized];
  if (direct) return direct;
  return resourceUrl(normalized);
};

export const resourceDownloadUrls = (
  paths: readonly string[]
): readonly string[] => paths.map(resourceDownloadUrl);

const slug = (file: string) =>
  file
    .replace(/^Files\//, '')
    .replace(/\.zip$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-');

const archiveName = (file: string) => file.replace(/^Files\//, '');

type ProductCopy = {
  title: string;
  description: string;
};

/** Cover art filenames (grid order: textures → … → vhs). */
const COVER_BY_ID: Record<string, string> = {
  textures: 'Resources 1.png',
  gradients: 'Resources 2.png',
  'micrographics-templates': 'Resources 3.png',
  'branding-guidelines': 'Resources 4.png',
  'proposal-template': 'Resources 5.png',
  'vhs-textures': 'Resources 6.png',
  'master-bundle': 'Master Resources.png'
};

/** Marketing copy for each resource (download page + grid). */
const PRODUCT_COPY: Record<string, ProductCopy> = {
  textures: {
    title: 'Texture Pack',
    description:
      'A versatile texture pack featuring 40 high-quality textures crafted to add depth, character, and realism to your designs.'
  },
  gradients: {
    title: 'Gradients Pack',
    description:
      'Explore a curated set of 40 unique gradients designed to give your visuals a bold, polished, and contemporary feel.'
  },
  'micrographics-templates': {
    title: 'Micrographics',
    description:
      'This pack combines futuristic patterns, technical linework, symbols, and precision-based graphic assets that work seamlessly across branding, posters, UI layouts, packaging, and motion design projects.'
  },
  'branding-guidelines': {
    title: 'Branding Guidelines',
    description:
      'A professionally designed brand guidelines template created to help you present brand identities with clarity and consistency.'
  },
  'proposal-template': {
    title: 'Proposal Template',
    description:
      'A 12-page landscape proposal template with editorial typography, modular grids, and a monochrome palette; built for branding and creative agency pitches.'
  },
  'vhs-textures': {
    title: 'VHS Textures',
    description:
      'A nostalgic collection of VHS-inspired textures crafted to recreate the raw imperfections of vintage analog media.'
  },
  'master-bundle': {
    title: 'Master Bundle',
    description:
      'Unlock the complete creative library with the Master Bundle — an all-in-one collection featuring every premium resource available on the site.'
  }
};

const buildCatalogProducts = (): readonly ResourceProduct[] =>
  RESOURCE_FILE_PATHS.map((downloadPath, i) => {
    const n = i + 1;
    const id = slug(downloadPath);
    const copy = PRODUCT_COPY[id];
    const title = copy?.title ?? archiveName(downloadPath).replace(/\.zip$/i, '');
    const description =
      copy?.description ??
      'Checkmate Studios resource archive. Download and unzip locally.';

    return {
      id,
      title,
      subtitle: `${title} · .zip archive`,
      description,
      price: 'Digital download',
      coverPath: COVER_BY_ID[id] ?? `Resources ${n}.png`,
      downloadPath,
      included: [
        archiveName(downloadPath),
        'Extract locally after download',
        'Use in line with your project license'
      ],
      homeFeatured: n <= 4
    };
  });

const MASTER_BUNDLE: ResourceProduct = {
  id: 'master-bundle',
  title: PRODUCT_COPY['master-bundle'].title,
  subtitle: 'Complete library · all archives',
  description: PRODUCT_COPY['master-bundle'].description,
  price: 'Digital download',
  coverPath: 'Master Resources.png',
  downloadPath: RESOURCE_FILE_PATHS[0],
  downloadPaths: RESOURCE_FILE_PATHS,
  included: RESOURCE_FILE_PATHS.map(archiveName),
  homeFeatured: false,
  fullWidth: true,
  isMasterBundle: true
};

export const RESOURCE_CATALOG_PRODUCTS: readonly ResourceProduct[] =
  buildCatalogProducts();

export const RESOURCE_MASTER_BUNDLE: ResourceProduct = MASTER_BUNDLE;

/** Catalog products first, Master Bundle last (3-3-1 grid on /resources). */
export const RESOURCE_PRODUCTS: readonly ResourceProduct[] = [
  ...RESOURCE_CATALOG_PRODUCTS,
  MASTER_BUNDLE
];

/** Showcase strip + marquee (same art as `Resources Showcase/`). */
export const RESOURCE_SHOWCASE_PATHS: readonly string[] = RESOURCE_FILE_PATHS.map(
  (_, i) => `Resources Showcase/a${i + 1}.png`
);

export const resourcesFeaturedOnHome = (): readonly ResourceProduct[] =>
  RESOURCE_CATALOG_PRODUCTS.filter((p) => p.homeFeatured);

export const resourceById = (id: string): ResourceProduct | undefined =>
  RESOURCE_PRODUCTS.find((p) => p.id === id);

/** Staggered browser downloads for each archive (user may need to allow multiple downloads). */
export const triggerResourceDownloads = (
  paths: readonly string[],
  delayMs = 450
): void => {
  resourceDownloadUrls(paths).forEach((url, i) => {
    window.setTimeout(() => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.rel = 'noopener noreferrer';
      anchor.download = '';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }, i * delayMs);
  });
};
