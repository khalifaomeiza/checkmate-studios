import { cn } from '../../lib/utils';

export interface CaseStudyMediaImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Avoid lazy-loading above-the-fold media in the editor or hero. */
  priority?: boolean;
  className?: string;
}

/**
 * Renders CMS media at native resolution — scales down when the container is
 * smaller, but never upscales beyond the uploaded pixel dimensions (prevents blur).
 */
export const CaseStudyMediaImage = ({
  src,
  alt = '',
  width,
  height,
  priority = false,
  className
}: CaseStudyMediaImageProps) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    loading={priority ? 'eager' : 'lazy'}
    decoding={priority ? 'sync' : 'async'}
    fetchPriority={priority ? 'high' : 'auto'}
    className={cn('mx-auto block h-auto w-full max-w-full', className)}
    style={width ? { maxWidth: `min(100%, ${width}px)` } : undefined}
  />
);
