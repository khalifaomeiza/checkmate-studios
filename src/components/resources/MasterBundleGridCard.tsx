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
    className="md:col-span-3 group cursor-pointer"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden ring-1 ring-black/5 bg-[#f3f3f0] min-h-[min(420px,50vw)]">
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14 order-2 lg:order-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-6">
          Resources · Vol 1
        </p>
        <h3 className="text-[clamp(2.5rem,6vw,4.5rem)] font-normal tracking-tighter leading-[0.95] mb-6 group-hover:text-brand-orange transition-colors">
          {product.title}
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed max-w-md">
          {product.description}
        </p>
      </div>
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[280px] order-1 lg:order-2 bg-white">
        <motion.img
          src={resourceUrl(product.coverPath)}
          alt=""
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
      </div>
    </div>
  </motion.div>
);
