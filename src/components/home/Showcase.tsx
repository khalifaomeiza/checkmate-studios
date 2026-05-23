import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { WORK_CATEGORIES, type WorkCategory } from '../../data/works';
import { showcaseForCategory } from '../../data/showcase';
import { ShowcaseCard } from '../showcase/ShowcaseCard';

export const Showcase = () => {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('Branding');
  const items = showcaseForCategory(activeCategory);

  return (
    <section className="pt-4 pb-12 px-8 w-full">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider">Showcase</h2>
        <div className="h-px flex-1 bg-brand-black/10" />
      </div>

      <div className="flex flex-wrap gap-3 md:gap-4 mb-12 md:mb-16">
        {WORK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={cn(
              'px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-medium transition-all duration-300 border',
              activeCategory === cat
                ? 'bg-brand-black text-white border-brand-black'
                : 'bg-transparent text-brand-black border-brand-black/10 hover:border-brand-black/30'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {items.length > 0 ? (
            items.map((item, i) => (
              <ShowcaseCard key={`${activeCategory}-${i}`} item={item} index={i} />
            ))
          ) : (
            <div className="col-span-full text-center py-16 border border-dashed border-black/10 rounded-3xl">
              <p className="text-gray-400 text-lg">
                Fresh {activeCategory.toLowerCase()} work is in the pipeline — check back soon.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
