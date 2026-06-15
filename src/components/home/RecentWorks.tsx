import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorksCatalog } from '../../hooks/useWorksCatalog';
import { WorkCard } from '../works/WorkCard';

const INITIAL_RECENT_WORKS = 4;

export const RecentWorks = () => {
  const navigate = useNavigate();
  const { featuredWorks } = useWorksCatalog();
  const onOpenWorksPage = () => navigate('/works');
  const projects = featuredWorks.slice(0, INITIAL_RECENT_WORKS);
  const hasMoreOnWorksPage = featuredWorks.length > INITIAL_RECENT_WORKS;

  return (
    <section className="py-12 px-8 w-full">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider">Recent Works</h2>
        <div className="h-px flex-1 bg-brand-black/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
        <AnimatePresence initial={false}>
          {projects.map((project, i) => (
            <WorkCard key={project.slug} work={project} index={i} priority={i < 2} />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex justify-center w-full px-4 sm:px-8">
        {hasMoreOnWorksPage ? (
          <button
            type="button"
            onClick={onOpenWorksPage}
            className="w-full md:w-auto max-w-[36rem] md:max-w-none text-center border border-brand-black px-6 sm:px-10 md:px-20 py-4 rounded-xl font-medium leading-snug text-[clamp(0.95rem,2.4vw,1.125rem)] hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300"
          >
            <span className="md:hidden">More Works</span>
            <span className="hidden md:inline">
              More works that makes you scream checkmate
            </span>
          </button>
        ) : (
          <a
            href="https://www.behance.net/checkmatestudios/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto max-w-[36rem] md:max-w-none text-center border border-brand-black px-6 sm:px-10 md:px-20 py-4 rounded-xl font-medium leading-snug text-[clamp(0.95rem,2.4vw,1.125rem)] hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300 inline-flex items-center justify-center gap-3 group"
          >
            View the full portfolio on Behance
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        )}
      </div>
    </section>
  );
};
