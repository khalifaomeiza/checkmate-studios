import { motion } from 'motion/react';
import type { ResourceProduct } from '../../data/resources';
import { resourceUrl } from '../../data/resources';

export const ResourceCatalogCard = ({
  product,
  index,
  onSelect
}: {
  product: ResourceProduct;
  index: number;
  onSelect: (product: ResourceProduct) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    onClick={() => onSelect(product)}
    className="group cursor-pointer"
  >
    <div className="aspect-[1825/1906] rounded-2xl mb-6 overflow-hidden relative ring-1 ring-black/5 bg-[#f3f3f0]">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        className="h-full w-full"
      >
        <img
          src={resourceUrl(product.coverPath)}
          alt=""
          className="h-full w-full object-contain object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
    </div>
    <div className="flex justify-between items-start px-2 gap-4">
      <div className="min-w-0">
        <h3 className="text-xl font-medium mb-1 group-hover:text-brand-orange transition-colors truncate tracking-tight">
          {product.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2">{product.subtitle}</p>
      </div>
    </div>
  </motion.div>
);
