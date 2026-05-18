export interface ResourceProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  /** Path under `public/resources/` */
  coverPath: string;
  galleryPaths?: string[];
  downloadPath: string;
  included: string[];
  homeFeatured: boolean;
  fullWidth?: boolean;
}

export const resourceUrl = (pathUnderResources: string): string =>
  encodeURI(`/resources/${pathUnderResources.replace(/^\//, '')}`);

const FILES = [
  'Files/Branding Guidelines.zip',
  'Files/Gradients.zip',
  'Files/Micrographics Templates.zip',
  'Files/Proposal Template.zip',
  'Files/Textures.zip',
  'Files/VHS Textures.zip'
] as const;

const slug = (file: string) =>
  file
    .replace(/^Files\//, '')
    .replace(/\.zip$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-');

const titleFromFile = (file: string) =>
  file.replace(/^Files\//, '').replace(/\.zip$/i, '');

const neutralDescription =
  'Checkmate Studios resource archive. Download and unzip locally — contents match the package name on disk.';

const buildProducts = (): readonly ResourceProduct[] =>
  FILES.map((downloadPath, i) => {
    const n = i + 1;
    const coverPath = `Resources ${n}.png`;
    const showcasePath = `Resources Showcase/a${n}.png`;
    return {
      id: slug(downloadPath),
      title: titleFromFile(downloadPath),
      subtitle: `${titleFromFile(downloadPath)} · .zip download`,
      description: neutralDescription,
      price: 'Digital download',
      coverPath,
      galleryPaths: [showcasePath, coverPath],
      downloadPath,
      included: [
        `Archive: ${titleFromFile(downloadPath)}.zip`,
        'Extract on your machine to view full contents',
        'Use in line with your project license / terms'
      ],
      homeFeatured: n <= 4
    };
  });

export const RESOURCE_PRODUCTS: readonly ResourceProduct[] = buildProducts();

/** Showcase strip + marquee (same art as `Resources Showcase/`). */
export const RESOURCE_SHOWCASE_PATHS: readonly string[] = FILES.map(
  (_, i) => `Resources Showcase/a${i + 1}.png`
);

export const resourcesFeaturedOnHome = (): readonly ResourceProduct[] =>
  RESOURCE_PRODUCTS.filter((p) => p.homeFeatured);

export const resourceById = (id: string): ResourceProduct | undefined =>
  RESOURCE_PRODUCTS.find((p) => p.id === id);
