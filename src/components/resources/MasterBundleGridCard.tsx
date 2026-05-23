import { motion } from 'motion/react';
import type { ResourceProduct } from '../../data/resources';
import { resourceUrl } from '../../data/resources';

export const MasterBundleGridCard = ({
  product,
  onSelect
}: {
  product: ResourceProduct;
  onSelect: (product: ResourceProduct) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    onClick={() => onSelect(product)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(product);
      }
    }}
    aria-label={`${product.title} — view download page`}
    className="md:col-span-3 group relative cursor-pointer overflow-hidden rounded-2xl ring-1 ring-black/5 bg-[#f3f3f0]"
  >
    <img
      src={resourceUrl(product.coverPath)}
      alt=""
      className="block w-full h-auto"
    />
    <div className="pointer-events-none absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
  </motion.div>
);
