import { motion } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORKS, type Work } from '../data/works';
import { OptimisedPicture } from '../components/media/OptimisedPicture';

const WorksGsapStack = ({ works }: { works: Work[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const cards = cardRefs.current.filter((el): el is HTMLAnchorElement => Boolean(el));
      const n = cards.length;
      if (n === 0) return;

      gsap.set(cards, { transformOrigin: '50% 50%', yPercent: 100, scale: 1, rotation: 0, force3D: true });
      gsap.set(cards[0], { yPercent: 0 });

      if (n === 1) return;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.works-sticky-cards',
          start: 'top top',
          end: () => `+=${window.innerHeight * (n - 1)}`,
          pin: true,
          scrub: 0.5,
          pinSpacing: true,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      for (let i = 0; i < n - 1; i++) {
        tl.to(cards[i], { scale: 0.7, rotation: 5, duration: 1 }, i);
        tl.to(cards[i + 1], { yPercent: 0, duration: 1 }, i);
      }

      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      if (containerRef.current) ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [works.length], revertOnUpdate: true }
  );

  return (
    <div ref={containerRef} className="relative w-full overflow-x-clip">
      <div className="works-sticky-cards relative flex h-[100dvh] w-full items-center justify-center overflow-hidden px-3 sm:px-5 md:px-8">
        <div
          data-works-stack-stage
          className="relative w-[min(92vw,28rem)] aspect-[4/5] overflow-hidden rounded-2xl sm:w-[min(92vw,40rem)] sm:aspect-[16/11] md:w-[min(92vw,56rem)] md:aspect-video md:rounded-3xl lg:w-[min(90vw,72rem)] xl:w-[min(88vw,80rem)] 2xl:w-[min(86vw,88rem)]"
        >
          {works.map((work, i) => (
            <a
              key={work.slug}
              href={work.href}
              target="_blank"
              rel="noopener noreferrer"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="group absolute inset-0 block overflow-hidden rounded-2xl bg-neutral-200 shadow-[0_36px_120px_-32px_rgba(0,0,0,0.42)] ring-1 ring-black/[0.06] will-change-transform [backface-visibility:hidden] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange [-webkit-tap-highlight-color:transparent] md:rounded-3xl"
              aria-label={`${work.title} — ${work.subtitle} (opens in a new tab)`}
            >
              <OptimisedPicture
                src={work.thumbnail.src}
                sources={work.thumbnail.sources}
                width={work.thumbnail.width}
                height={work.thumbnail.height}
                alt={`${work.title} — ${work.subtitle}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                sizes="(max-width:640px) 92vw, (max-width:1024px) 88vw, min(88rem,88vw)"
                className="block h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="max-w-[18ch] font-medium leading-[1.05] text-white sm:max-w-[22ch] text-[clamp(1.5rem,4.5vw,3rem)]">
                    {work.title}
                  </h2>
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-md ring-1 ring-white/25 md:text-xs">
                    {work.year}
                  </span>
                </div>
                <p className="mt-3 max-w-xl leading-relaxed text-white/85 md:mt-4 text-[clamp(0.85rem,1.4vw,1rem)]">
                  {work.subtitle}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-orange md:mt-5 md:text-sm">
                  View case study
                  <ArrowRight size={14} className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 md:h-4 md:w-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorksPageInner = () => {
  const works = [...WORKS];

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="relative px-4 pb-8 pt-12 mb-6 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(3rem,11vw,8rem)] font-normal tracking-tighter mb-8"
        >
          Works.
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="max-w-2xl"
        >
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Every project in the stack below is a move toward clarity — identity, interfaces, and
            campaigns engineered to end the game on our terms.
          </p>
        </motion.div>
      </div>

      <section className="relative w-full bg-gradient-to-b from-white via-neutral-50/80 to-white pb-24">
        <WorksGsapStack works={works} />
      </section>
    </div>
  );
};

export const WorksPage = () => <WorksPageInner />;
