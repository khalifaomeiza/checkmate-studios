// ----- Optimised <picture> primitive ---------------------------------------
// Emits an AVIF → WebP → PNG fallback chain. Each source comes from
// vite-imagetools and already carries a width-keyed srcset, so the browser
// only downloads the variant it actually needs.
export interface OptimisedPictureProps {
  src: string;
  sources: Record<string, string>;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function OptimisedPicture({
  src,
  sources,
  width,
  height,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
  loading = 'lazy',
  className
}: OptimisedPictureProps) {
  return (
  <picture className="block h-full w-full min-h-0">
    {Object.entries(sources).map(([mime, srcset]) => (
      <source key={mime} type={mime} srcSet={srcset} sizes={sizes} />
    ))}
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      className={className}
    />
  </picture>

  );
}
