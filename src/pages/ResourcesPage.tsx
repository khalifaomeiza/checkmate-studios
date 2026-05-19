import { motion } from 'motion/react';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  RESOURCE_PRODUCTS,
  RESOURCE_SHOWCASE_PATHS,
  resourceUrl
} from '../data/resources';
import type { ResourceProduct } from '../data/resources';
import { NewsletterForm } from '../forms/NewsletterForm';
import { ProductDetailPage } from './resources/ProductDetailPage';
import { ResourceCatalogCard } from '../components/resources/ResourceCatalogCard';
import { MasterBundleGridCard } from '../components/resources/MasterBundleGridCard';

export const ResourcesPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<ResourceProduct | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const products = RESOURCE_PRODUCTS;

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      product.title.toLowerCase().includes(q) ||
      product.subtitle.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.id.toLowerCase().includes(q)
    );
  });

  const catalogProducts = filteredProducts.filter((p) => !p.isMasterBundle);
  const masterProduct = filteredProducts.find((p) => p.isMasterBundle);

  if (selectedProduct) {
    return <ProductDetailPage product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 py-12 pt-32"
    >
      {/* Header */}
      <div className="mb-20 relative">
        <h1 className="text-[clamp(3.25rem,11vw,8rem)] font-normal tracking-tighter mb-8">Resources.</h1>
        <div className="max-w-2xl">
          <p className="text-xl text-gray-600 leading-relaxed">
            Checkmate Studio's resources that are designed to help you secure a flawless victory, with an unwavering focus on aesthetics and quality, just like a perfect checkmate in a game of chess.
          </p>
        </div>
      </div>

      {/* View Toggle & Search */}
      <div className="mb-12 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className={cn(
            'border border-black px-8 py-3 rounded-full text-sm font-medium transition-all',
            viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          )}
        >
          {viewMode === 'grid' ? 'Products List View' : 'Products Grid View'}
        </button>

        <div className="relative flex items-center">
          <motion.div
            initial={false}
            animate={{
              width: isSearchOpen ? '300px' : '48px',
              backgroundColor: isSearchOpen ? '#f3f4f6' : 'transparent',
              borderColor: isSearchOpen ? 'transparent' : 'rgba(0,0,0,0.1)'
            }}
            className="h-12 rounded-full flex items-center overflow-hidden border transition-colors"
          >
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-12 h-12 flex items-center justify-center flex-shrink-0 hover:bg-black/5 transition-colors"
            >
              <Search size={20} />
            </button>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full pr-4 text-sm"
              autoFocus={isSearchOpen}
            />
          </motion.div>
        </div>
      </div>

      {/* Product Display */}
      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {catalogProducts.map((product, i) => (
              <ResourceCatalogCard
                key={product.id}
                product={product}
                index={i}
                onSelect={setSelectedProduct}
              />
            ))}
            {masterProduct ? (
              <MasterBundleGridCard product={masterProduct} onSelect={setSelectedProduct} />
            ) : null}
          </div>
        ) : (
          <div className="mb-16 border-t border-black/10">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedProduct(product)}
                className="group flex items-center justify-between gap-6 py-8 border-b border-black/10 cursor-pointer hover:bg-gray-50 transition-colors px-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-8">
                  <span className="text-xs font-mono text-gray-400 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block md:h-16 md:w-24">
                    <img
                      src={resourceUrl(product.coverPath)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold group-hover:text-brand-orange transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500">{product.subtitle}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-12">
                  <span className="hidden md:block text-sm text-gray-400 max-w-xs truncate">
                    {product.description}
                  </span>
                  <span className="text-xl font-bold">{product.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-32 mb-16 border border-dashed border-black/10 rounded-3xl">
          <p className="text-gray-400 text-lg">No resources found matching "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 text-brand-orange font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      <section className="mb-32 overflow-hidden -mx-8">
        <div className="flex items-center gap-4 mb-12 px-8">
          <h2 className="text-sm font-medium uppercase tracking-wider">Preview strip</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex whitespace-nowrap">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="flex gap-4"
            >
              {[...Array(12)].map((_, i) => {
                const path = RESOURCE_SHOWCASE_PATHS[i % RESOURCE_SHOWCASE_PATHS.length];
                const product = products[i % products.length];
                return (
                  <button
                    key={`r1-${i}-${path}`}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="w-[450px] md:w-[600px] aspect-[21/9] overflow-hidden flex-shrink-0 cursor-pointer group relative rounded-xl ring-1 ring-black/10"
                  >
                    <img
                      src={resourceUrl(path)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
                  </button>
                );
              })}
            </motion.div>
          </div>

          <div className="flex whitespace-nowrap">
            <motion.div
              animate={{ x: [-1000, 0] }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="flex gap-4 -ml-[300px]"
            >
              {[...Array(12)].map((_, i) => {
                const path =
                  RESOURCE_SHOWCASE_PATHS[(i + 3) % RESOURCE_SHOWCASE_PATHS.length];
                const product = products[(i + 2) % products.length];
                return (
                  <button
                    key={`r2-${i}-${path}`}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="w-[450px] md:w-[600px] aspect-[21/9] overflow-hidden flex-shrink-0 cursor-pointer group relative rounded-xl ring-1 ring-black/10"
                  >
                    <img
                      src={resourceUrl(path)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-brand-black text-white rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="w-full md:w-1/4 aspect-square bg-white/5 rounded-3xl overflow-hidden relative ring-1 ring-white/10">
          <img
            src={resourceUrl('Master Resources.png')}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent opacity-60" />
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-normal leading-tight max-w-xl">
            Be the first to get new Checkmate resources.
          </h2>

          <NewsletterForm variant="resources_card" source="newsletter_card" />
        </div>
      </section>
    </motion.div>
  );
};
