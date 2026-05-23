import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { Work } from '../../data/works';
import { OptimisedPicture } from '../media/OptimisedPicture';

export interface WorkCardProps {
  work: Work;
  index: number;
  /** Hint to eagerly load above-the-fold cards. */
  priority?: boolean;
}

export const WorkCard = ({ work, index, priority = false }: WorkCardProps) => (
  <motion.a
    href={work.href}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay: Math.min(index, 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    className="group block focus:outline-none"
    aria-label={`${work.title} — ${work.subtitle} (opens in a new tab)`}
  >
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-[#ececec]">
      <div className="absolute inset-0 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]">
        <OptimisedPicture
          src={work.thumbnail.src}
          sources={work.thumbnail.sources}
          width={work.thumbnail.width}
          height={work.thumbnail.height}
          alt={`${work.title} — ${work.subtitle}`}
          loading={priority ? 'eager' : 'lazy'}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Bottom gradient veil — reveals on hover for legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Bottom-left reveal: title + arrow */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6 flex items-end justify-between gap-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <div className="text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-1">{work.client}</p>
          <h3 className="text-2xl md:text-3xl font-medium leading-tight">{work.title}</h3>
        </div>
        <div className="w-11 h-11 rounded-full bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/30 flex-shrink-0">
          <ArrowRight size={18} className="text-white" />
        </div>
      </div>
    </div>

    {/* Caption visible at rest — keeps the grid scannable when not hovered */}
    <div className="mt-5 flex items-baseline justify-between gap-4 px-1">
      <div>
        <h3 className="text-lg md:text-xl font-medium tracking-tight group-hover:text-brand-orange transition-colors">
          {work.title}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{work.subtitle}</p>
      </div>
      <span className="text-xs uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">
        {work.year}
      </span>
    </div>
  </motion.a>
);
