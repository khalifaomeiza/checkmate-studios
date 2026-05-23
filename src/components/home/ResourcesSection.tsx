import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { resourcesFeaturedOnHome, resourceUrl } from '../../data/resources';

export const ResourcesSection = () => {
  const featured = resourcesFeaturedOnHome();
  const navigate = useNavigate();
  const goCatalog = () => navigate('/resources');

  const reveal = {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-15% 0px' },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  };

  return (
    <section className="bg-brand-orange py-12 px-6">
      <div className="w-full">
        <motion.div {...reveal} className="flex items-center gap-4 mb-12 text-white">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            Resources <span className="w-2 h-2 bg-white rounded-full inline-block" />
          </h2>
          <div className="h-px flex-1 bg-white/30" />
        </motion.div>
        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.08 }}
          className="text-white/80 mb-12 max-w-2xl text-[clamp(1rem,1.8vw,1.25rem)]"
        >
          Checkmate Studio's resources that are designed to help you secure a flawless victory, with an unwavering focus on aesthetics and quality, just like a perfect checkmate in a game of chess.
        </motion.p>
        <motion.button
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.14 }}
          type="button"
          onClick={goCatalog}
          className="border border-white text-white px-8 py-3 rounded-full text-sm font-medium mb-16 hover:bg-white hover:text-brand-orange transition-all"
        >
          View full catalog
        </motion.button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((res, i) => (
            <motion.button
              key={res.id}
              type="button"
              onClick={goCatalog}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 * i }}
              whileHover={{ y: -10 }}
              className="group w-full text-left cursor-pointer"
            >
              <div className="aspect-[3/4] rounded-xl mb-6 overflow-hidden bg-black/10 ring-1 ring-white/25 shadow-lg shadow-black/10">
                <img
                  src={resourceUrl(res.coverPath)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
              </div>
              {/* <h3 className="text-white font-medium text-lg mb-1">{res.title}</h3>
              <p className="text-white/70">
                {res.subtitle} · {res.price}
              </p> */}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
