import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import type { ResourceProduct } from '../../data/resources';
import { BackButton } from '../../components/ui/BackButton';
import {
  resourceUrl,
  resourceDownloadUrl,
  triggerResourceDownloads,
  RESOURCE_CATALOG_COVER_ASPECT
} from '../../data/resources';
import { cn } from '../../lib/utils';

export const ProductDetailPage = ({
  product,
  onBack
}: {
  product: ResourceProduct;
  onBack: () => void;
}) => {
  const coverSrc = resourceUrl(product.coverPath);
  const bundlePaths = product.downloadPaths;
  const isMasterBundle = Boolean(product.isMasterBundle && bundlePaths?.length);
  const downloadHref = resourceDownloadUrl(product.downloadPath);
  const archiveLabel = product.downloadPath.replace(/^Files\//, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-white font-sans"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 pb-20">
        <BackButton
          label="Back to Resources"
          onClick={onBack}
          className="relative z-[90] mb-10"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 lg:gap-14 xl:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[min(100%,28rem)] mx-auto lg:max-w-none lg:mx-0 lg:sticky lg:top-32"
          >
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-2xl bg-[#f3f3f0] ring-1 ring-black/5',
                `aspect-[${RESOURCE_CATALOG_COVER_ASPECT}]`
              )}
            >
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-contain object-center"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 flex-col lg:pt-2"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand-black/45 mb-5">
              Resources · Vol 1
            </p>
            <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-normal tracking-tighter leading-[0.95] mb-5">
              {product.title}
            </h1>
            <p className="text-base text-brand-black/50 mb-8">{product.subtitle}</p>
            <p className="text-[clamp(1rem,1.6vw,1.125rem)] leading-relaxed text-brand-black/70 max-w-xl mb-10">
              {product.description}
            </p>

            <div className="mb-10 max-w-md">
              {isMasterBundle && bundlePaths ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerResourceDownloads(bundlePaths)}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-black py-4 text-base font-medium text-white transition-colors hover:bg-brand-orange"
                  >
                    <Download size={20} strokeWidth={2} />
                    Download all {bundlePaths.length} archives
                  </button>
                  <p className="mt-3 text-center text-xs leading-relaxed text-brand-black/45">
                    Your browser may ask to allow multiple downloads. Large files may take a moment
                    each.
                  </p>
                </>
              ) : (
                <>
                  <a
                    href={downloadHref}
                    download
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-black py-4 text-base font-medium text-white transition-colors hover:bg-brand-orange"
                  >
                    <Download size={20} strokeWidth={2} />
                    Download {archiveLabel}
                  </a>
                  <p className="mt-3 text-center text-xs leading-relaxed text-brand-black/45">
                    Direct download — check your downloads folder. Some archives are large.
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-black/8 pt-8">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand-black/45 mb-5">
                {isMasterBundle ? 'Archives included' : "What's included"}
              </h2>
              <ul className="space-y-3">
                {product.included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-snug text-brand-black/65"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-orange" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {isMasterBundle && bundlePaths ? (
                <ul className="mt-8 space-y-2 border-t border-black/8 pt-8">
                  <li className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand-black/45 mb-3 list-none">
                    Download individually
                  </li>
                  {bundlePaths.map((path) => (
                    <li key={path}>
                      <a
                        href={resourceDownloadUrl(path)}
                        download
                        className="flex items-center justify-between gap-4 rounded-xl border border-black/8 px-4 py-3 text-sm font-medium transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/[0.04]"
                      >
                        <span className="truncate">{path.replace(/^Files\//, '')}</span>
                        <Download size={16} className="shrink-0 text-brand-black/40" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
