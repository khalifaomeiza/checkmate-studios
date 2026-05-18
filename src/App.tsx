import { motion, AnimatePresence } from 'motion/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Facebook, Twitter, Linkedin, Dribbble, ArrowRight, Download, X, ChevronLeft, Search, MapPin, Clock } from 'lucide-react';
import { useState, useEffect, useRef, type ComponentType, type SVGProps } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from './lib/utils';
import { usePageSeo } from './lib/seo';
import { BottomNav } from './components/BottomNav';
import { FOOTER_SOCIALS } from './lib/socials';
import { BehanceIcon } from './components/icons/BehanceIcon';
import { NewsletterForm } from './forms/NewsletterForm';
import { ContactForm as ContactFormFields } from './forms/ContactForm';
import { CareerApplicationForm } from './forms/CareerApplicationForm';
import {
  WORK_CATEGORIES,
  WORKS,
  allWorksForGrid,
  type Work,
  type WorkCategory
} from './data/works';
import {
  showcaseForCategory,
  type ShowcaseItem
} from './data/showcase';
import {
  RESOURCE_PRODUCTS,
  resourcesFeaturedOnHome,
  resourceUrl,
  resourceDownloadUrl,
  RESOURCE_SHOWCASE_PATHS,
  type ResourceProduct
} from './data/resources';
import { PARTNER_LOGOS } from './data/partners';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const SOCIAL_ICONS: Record<string, IconComponent> = {
  Instagram,
  Facebook,
  Twitter,
  LinkedIn: Linkedin,
  Behance: BehanceIcon,
  Dribbble
};

// --- Components ---

const NAV_LINKS: { to: string; label: string }[] = [
  { to: '/works', label: 'Work' },
  { to: '/resources', label: 'Resources' },
  { to: '/playground', label: 'Playground' },
  { to: '/careers', label: 'Careers' }
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goContact = () => {
    const jump = () =>
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for the home route to mount before scrolling.
      requestAnimationFrame(() => requestAnimationFrame(jump));
    } else {
      jump();
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between px-8 py-2.5 w-[90%] bg-white/70 backdrop-blur-md border border-brand-black/10 rounded-full shadow-lg transition-all duration-300">
      <NavLink
        to="/"
        className="text-xl font-bold tracking-tighter cursor-pointer"
      >
        checkmate
      </NavLink>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('hover:opacity-60 transition-opacity', isActive && 'text-brand-orange')
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        onClick={goContact}
        className="bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-orange/20"
      >
        Get in touch
      </button>
    </nav>
  );
};

const HERO_VIDEO_SRC =
  'https://res.cloudinary.com/dliesrplu/video/upload/v1777382524/Checkmate_Hero_d0axoc.mp4';
const HERO_VIDEO_POSTER =
  'https://res.cloudinary.com/dliesrplu/video/upload/so_0/v1777382524/Checkmate_Hero_d0axoc.jpg';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // iOS Safari (and some Android browsers) block <video autoPlay> unless
  // `muted` is set on the DOM property AND .play() is invoked programmatically.
  // The declarative React `muted` prop sometimes doesn't propagate, so we
  // force it via the ref, fall back to first-touch playback if blocked,
  // and re-resume on any subsequent pause (battery saver, tab restore, etc.).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    const tryPlay = () => video.play().catch(() => undefined);

    void tryPlay();

    // Any unexpected pause → resume immediately, keeps it on infinite play.
    const onPause = () => {
      if (!video.ended) void tryPlay();
    };
    video.addEventListener('pause', onPause);

    // First-interaction fallback if the initial autoplay was rejected.
    const resume = () => {
      void tryPlay();
      window.removeEventListener('touchstart', resume);
      window.removeEventListener('click', resume);
      window.removeEventListener('scroll', resume);
    };
    window.addEventListener('touchstart', resume, { once: true, passive: true });
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('scroll', resume, { once: true, passive: true });

    return () => {
      video.removeEventListener('pause', onPause);
      window.removeEventListener('touchstart', resume);
      window.removeEventListener('click', resume);
      window.removeEventListener('scroll', resume);
    };
  }, []);

  return (
    <section className="pb-12 w-full text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        /* `100dvh` follows the dynamic viewport (excludes the iOS toolbar at rest,
            includes it on retract) — feels like a full screen on mobile without
            the jumpy resize you get from `100vh`. */
        className="relative w-full h-[100dvh] md:h-screen overflow-hidden flex items-center justify-center mb-20"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_VIDEO_POSTER}
            disableRemotePlayback
            disablePictureInPicture
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
            tabIndex={-1}
            aria-hidden="true"
            className="w-full h-full object-cover pointer-events-none"
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/5" />
      </motion.div>

      <div className="px-6 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          /* Fluid display: ramps smoothly from ~40px on small phones to ~96px
             on wide screens — no jarring step at the md breakpoint. */
          className="font-normal tracking-tight leading-[1.05] text-[clamp(2.5rem,7.2vw,6rem)]"
        >
          You are here by design.
        </motion.h1>
      </div>
    </section>
  );
};

// ----- Optimised <picture> primitive ---------------------------------------
// Emits an AVIF → WebP → PNG fallback chain. Each source comes from
// vite-imagetools and already carries a width-keyed srcset, so the browser
// only downloads the variant it actually needs.
interface OptimisedPictureProps {
  src: string;
  sources: Record<string, string>;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  className?: string;
}

const OptimisedPicture = ({
  src,
  sources,
  width,
  height,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
  loading = 'lazy',
  className
}: OptimisedPictureProps) => (
  <picture className="block h-full w-full min-h-0">
    {Object.entries(sources).map(([mime, srcset]) => (
      <source key={mime} type={mime} srcSet={srcset} sizes={sizes} />
    ))}
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      className={className}
    />
  </picture>
);

// ----- Shared 16:9 project card --------------------------------------------
// Used by RecentWorks. Pulls its image data from the imagetools picture object
// stored on the work itself.
interface WorkCardProps {
  work: Work;
  index: number;
  /** Hint to eagerly load above-the-fold cards. */
  priority?: boolean;
}

const WorkCard = ({ work, index, priority = false }: WorkCardProps) => (
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
        <h3 className="text-lg md:text-xl font-bold tracking-tight group-hover:text-brand-orange transition-colors">
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

// ----- Showcase card -------------------------------------------------------
// Renders a 16:9 visual sample for the Offerings filter — either an optimised
// <picture> (branding / illustration / adverts) or a silent looping <video>
// (websites). Captionless on purpose — the work is the story.
interface ShowcaseCardProps {
  item: ShowcaseItem;
  index: number;
}

const ShowcaseCard = ({ item, index }: ShowcaseCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay: Math.min(index, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    className="group relative aspect-video overflow-hidden rounded-2xl bg-[#ececec] cursor-default"
  >
    <div className="absolute inset-0 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]">
      {item.kind === 'image' ? (
        <OptimisedPicture
          src={item.src}
          sources={item.sources}
          width={item.width}
          height={item.height}
          alt={item.alt}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          src={item.src}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-label={item.alt}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
    </div>

    {/* Quiet hover overlay — orange wash for tactile feedback */}
    <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-500" />
  </motion.div>
);

// ----- Offerings — filtered showcase grid ----------------------------------
// Pulls visual samples from src/data/showcase.ts (driven by import.meta.glob
// over src/assets/showcase/<category>/, with Websites coming from
// /public/showcase/Websites/*.mp4).
const Offerings = () => {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('Branding');
  const items = showcaseForCategory(activeCategory);

  return (
    <section className="pt-4 pb-12 px-8 w-full">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider">Our Offerings</h2>
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


const INITIAL_RECENT_WORKS = 4;

const RecentWorks = () => {
  const navigate = useNavigate();
  const onOpenWorksPage = () => navigate('/works');
  const ordered = allWorksForGrid();
  const projects = ordered.slice(0, INITIAL_RECENT_WORKS);
  const hasMoreOnWorksPage = ordered.length > INITIAL_RECENT_WORKS;

  return (
    <section className="py-12 px-8 w-full">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider">Recent Works</h2>
        <div className="h-px flex-1 bg-brand-black/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
        <AnimatePresence initial={false}>
          {projects.map((project, i) => (
            <WorkCard
              key={project.slug}
              work={project}
              index={i}
              priority={i < 2}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex justify-center w-full px-4 sm:px-8">
        {hasMoreOnWorksPage ? (
          <button
            type="button"
            onClick={onOpenWorksPage}
            /* Fluid label scale prevents the long sentence from looking cramped
               on small phones or stretched on tablets where `text-base → text-lg`
               jumped abruptly at md. */
            className="w-full md:w-auto max-w-[36rem] md:max-w-none text-center border border-brand-black px-6 sm:px-10 md:px-20 py-4 rounded-xl font-medium leading-snug text-[clamp(0.95rem,2.4vw,1.125rem)] hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300"
          >
            More works that makes you scream checkmate
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

const Partners = () => (
  <section className="px-8 py-12 w-full">
    <div className="bg-brand-black text-white rounded-3xl md:rounded-[40px] p-12 md:p-20">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Partners <span className="w-2 h-2 bg-white rounded-full inline-block" />
        </h2>
        <div className="h-px flex-1 bg-white/20" />
      </div>
      <p className="text-xl text-white/60 mb-12">
        Here is a little hall of fame for every game that ended in checkmate!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 items-center">
        {PARTNER_LOGOS.map((partner) => (
          <div
            key={partner.src}
            className="flex h-16 md:h-20 items-center justify-center rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <img
              src={partner.src}
              alt={partner.alt}
              className="max-h-10 md:max-h-14 w-auto max-w-full object-contain opacity-90 transition-opacity hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonial = () => {
  const testimonials = [
    {
      quote: "The high level of professionalism and quality of work was impressive. We couldn't have been able to achieve this much without you.",
      author: "Damian, Product Lead",
      company: "Cloudify"
    },
    {
      quote: "Checkmate Studios transformed our vision into a stunning reality. Their attention to detail and creative flair are unmatched.",
      author: "Sarah Chen, CEO",
      company: "TechFlow"
    },
    {
      quote: "Working with this team was a game-changer for our brand. They delivered beyond our expectations and on a very tight schedule.",
      author: "Marcus Thorne, Founder",
      company: "Vanguard"
    },
    {
      quote: "The strategic thinking behind every design choice was evident. They don't just make things look good; they make them work.",
      author: "Elena Rodriguez, CMO",
      company: "Lumina"
    },
    {
      quote: "A truly collaborative partner. They listened, understood our needs, and provided solutions that were both innovative and practical.",
      author: "David Park, Head of Design",
      company: "Nexus"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-12 px-8 w-full text-center overflow-hidden">
      <div className="relative h-[300px] md:h-[250px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-tight mb-12">
              "{testimonials[currentIndex].quote}"
            </p>
            <div className="space-y-1">
              <p className="font-bold">{testimonials[currentIndex].author}</p>
              <a href="#" className="text-gray-500 underline underline-offset-4 hover:text-brand-orange transition-colors">
                {testimonials[currentIndex].company}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === currentIndex ? "bg-brand-orange w-6" : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </section>
  );
};

const Resources = () => {
  const featured = resourcesFeaturedOnHome();
  const navigate = useNavigate();
  const goCatalog = () => navigate('/resources');

  // Reveal pieces only when the section enters the viewport — used to be that
  // the whole grid mounted with the page and competed for paint with the rest
  // of the home feed, which felt sluggish by the time you scrolled down.
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
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
              <h3 className="text-white font-bold text-lg mb-1">{res.title}</h3>
              <p className="text-white/70">
                {res.subtitle} · {res.price}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactForm = () => (
  <section id="contact" className="py-12 px-4 sm:px-6 md:px-8 w-full">
    <div className="bg-brand-black text-white rounded-3xl md:rounded-[40px] p-8 sm:p-12 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      <div>
        {/* Continuous fluid ramp from ~36px (small phones) to ~100px (wide
            desktops). The old three-step ladder (text-5xl → 7xl → 100px) left
            tablets stuck at an awkward middle size. */}
        <h2 className="font-normal leading-[0.95] mb-10 sm:mb-12 text-[clamp(2.25rem,8vw,6.25rem)]">
          Feeling stuck on a project?
        </h2>
        <p className="text-white/60 text-[clamp(1rem,1.6vw,1.25rem)]">
          Let Checkmate Studio help you make the winning move.
        </p>
      </div>

      <ContactFormFields />
    </div>
  </section>
);

const ProductDetailPage = ({
  product,
  onBack
}: {
  product: ResourceProduct;
  onBack: () => void;
}) => {
  const galleryPaths = [
    product.coverPath,
    ...(product.galleryPaths ?? [])
  ].filter((path, idx, arr) => arr.indexOf(path) === idx);
  const images = galleryPaths.map(resourceUrl);
  const [activeImage, setActiveImage] = useState(0);
  const downloadHref = resourceDownloadUrl(product.downloadPath);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-7xl mx-auto px-8 py-12">
        <button
          type="button"
          onClick={onBack}
         className="flex items-center gap-2 text-sm font-medium mb-12 hover:text-brand-orange transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Resources
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden rounded-2xl ring-1 ring-black/5">
              <img
                src={images[activeImage] ?? images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'aspect-square bg-gray-100 overflow-hidden border-2 transition-all rounded-lg',
                      activeImage === i ? 'border-brand-orange' : 'border-transparent'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold tracking-tighter mb-4">{product.title}</h1>
              <p className="text-2xl text-gray-400 mb-6">{product.subtitle}</p>
              <div className="text-4xl font-bold text-brand-orange mb-8">{product.price}</div>
              <p className="text-xl text-gray-600 leading-relaxed mb-12">{product.description}</p>
            </div>

            <div className="space-y-4">
              <a
                href={downloadHref}
                download
                className="flex w-full items-center justify-center gap-3 bg-brand-black py-6 text-xl font-bold text-white transition-colors hover:bg-brand-orange"
              >
                <Download size={24} />
                Download .zip
              </a>
              <p className="text-center text-sm text-gray-400">
                Direct download — check your browser&apos;s downloads folder (some archives are large).
              </p>
            </div>

            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">What&apos;s included</h3>
              <ul className="grid grid-cols-2 gap-4">
                {product.included.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-500">
                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-orange" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ResourcesPage = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProduct(product)}
                className={cn('group cursor-pointer', product.fullWidth && 'md:col-span-2')}
              >
                <div
                  className={cn(
                    'rounded-2xl mb-6 overflow-hidden relative ring-1 ring-black/5 bg-gray-100',
                    product.fullWidth ? 'aspect-[21/9]' : 'aspect-[4/3]'
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                    className="h-full w-full"
                  >
                    <img
                      src={resourceUrl(product.coverPath)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
                </div>
                <div className="flex justify-between items-start px-2">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 group-hover:text-brand-orange transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-500">{product.subtitle}</p>
                  </div>
                  <span className="text-xl font-bold">{product.price}</span>
                </div>
              </motion.div>
            ))}
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

const PlaygroundDetail = ({ post, onBack }: { post: any, onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-4xl mx-auto px-8 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-12 hover:underline decoration-1 underline-offset-4 transition-all"
        >
          <ChevronLeft size={20} />
          Back to Playground
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-sm text-gray-400">{post.date}</span>
          </div>
          <h1 className="text-[clamp(2rem,5.5vw,3.75rem)] font-normal leading-[1.1] mb-8">
            {post.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <img src={`https://picsum.photos/seed/${post.author}/100/100`} alt={post.author} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold">{post.author}</p>
              <p className="text-sm text-gray-400">{post.role}</p>
            </div>
          </div>
        </div>

        <div className="aspect-video bg-gray-100 overflow-hidden mb-12">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-xl max-w-none">
          <p className="text-xl leading-relaxed text-gray-600 mb-8">
            {post.excerpt}
          </p>
          <div className="space-y-6 text-lg leading-relaxed text-gray-800">
            <p>
              Design is more than just how something looks. It's about how it works, how it feels, and how it impacts the lives of the people who use it. In today's fast-paced world, we often overlook the subtle ways that design shapes our daily experiences.
            </p>
            <p>
              From the way we interact with our smartphones to the layout of our cities, design is everywhere. It influences our decisions, our emotions, and our productivity. At Checkmate Studio, we believe that good design is a fundamental right, not a luxury.
            </p>
            <h2 className="text-3xl font-bold mt-12 mb-6">The Human Element</h2>
            <p>
              When we approach a new project, we start by asking ourselves: how will this improve the user's life? We focus on empathy, understanding the needs and frustrations of the people we're designing for. This human-centric approach is what sets great design apart from mediocre design.
            </p>
            <p>
              We're not just creating interfaces; we're creating experiences. We're building tools that help people achieve their goals, connect with others, and express themselves. That's the power of design.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ScrambleText = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+";

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let frame: number;
    let iteration = 0;

    const scramble = () => {
      const targetWord = words[currentWordIndex];
      const scrambled = targetWord
        .split("")
        .map((_, index) => {
          if (index < iteration) {
            return targetWord[index];
          }
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("");

      setDisplayText(scrambled);

      if (iteration < targetWord.length) {
        iteration += 1 / 10;
        frame = requestAnimationFrame(scramble);
      } else {
        timeout = setTimeout(() => {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 1500);
      }
    };

    frame = requestAnimationFrame(scramble);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [currentWordIndex, words]);

  return <span>{displayText}.</span>;
};

const PlaygroundPage = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Insights", "Press", "Featured", "At Checkmate"];

  const posts = [
    {
      id: 1,
      title: "The Silent Influence of Minimalist Design",
      excerpt: "How stripping away the unnecessary can lead to a more focused and fulfilling life.",
      category: "Insights",
      date: "March 24, 2026",
      author: "Alex Rivers",
      role: "Design Lead",
      image: "https://picsum.photos/seed/minimal/1200/800"
    },
    {
      id: 2,
      title: "Checkmate Studio Wins Agency of the Year",
      excerpt: "We are thrilled to announce that Checkmate Studio has been recognized for its commitment to design excellence.",
      category: "Press",
      date: "March 18, 2026",
      author: "Sarah Chen",
      role: "Visual Strategist",
      image: "https://picsum.photos/seed/award/1200/800"
    },
    {
      id: 3,
      title: "Design for Longevity: Moving Beyond Trends",
      excerpt: "In a world of fast design, how do we create products that stand the test of time?",
      category: "Featured",
      date: "March 12, 2026",
      author: "Marcus Thorne",
      role: "Creative Director",
      image: "https://picsum.photos/seed/time/1200/800"
    },
    {
      id: 4,
      title: "Behind the Scenes: Our New Studio Space",
      excerpt: "A look inside the environment where our best ideas come to life.",
      category: "At Checkmate",
      date: "March 05, 2026",
      author: "Elena Vance",
      role: "Product Designer",
      image: "https://picsum.photos/seed/studio/1200/800"
    },
    {
      id: 5,
      title: "The Future of Interface Design",
      excerpt: "Predicting the next decade of digital interaction and human-computer relationships.",
      category: "Insights",
      date: "February 28, 2026",
      author: "Alex Rivers",
      role: "Design Lead",
      image: "https://picsum.photos/seed/future/1200/800"
    }
  ];

  const filteredPosts = activeFilter === "All" 
    ? posts 
    : posts.filter(post => post.category === activeFilter);

  if (selectedPost) {
    return <PlaygroundDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Playground Hero */}
      <div className="pt-12 pb-4 px-8 mb-20 relative">
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(3.25rem,11vw,8rem)] font-normal tracking-tighter mb-8"
          >
            <ScrambleText words={["Playground", "Ideas", "Thoughts", "Design", "Tomorrow"]} />
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl"
          >
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              Exploring how intentional design decisions shape our daily habits, emotions, and the future of our society.
            </p>
          </motion.div>

          {/* Filter Tags */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all border",
                  activeFilter === filter 
                    ? "bg-brand-black text-white border-brand-black" 
                    : "bg-transparent text-gray-500 border-gray-200 hover:border-brand-black hover:text-brand-black"
                )}
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>

      {/* Playground List */}
      <section className="pb-6 px-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-medium uppercase tracking-wider">Latest Thoughts</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>

        <div className="flex flex-col">
          {filteredPosts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer py-8 border-b border-brand-black/10 last:border-0"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-center">
                <div className="flex-1 order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{post.author}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-normal leading-tight mb-4 group-hover:underline decoration-1 underline-offset-8 transition-all">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 text-base">
                    {post.excerpt}
                  </p>
                </div>
                <div className="w-full md:w-48 aspect-video md:aspect-square bg-gray-100 overflow-hidden relative shrink-0 order-1 md:order-2">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

const WorksGsapStack = ({ works }: { works: Work[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const cards = cardRefs.current.filter((el): el is HTMLAnchorElement => Boolean(el));
      const n = cards.length;
      if (n === 0) return;

      // First card lives at the front; everyone else parked off-screen below.
      // Setting yPercent on every card up-front prevents a one-frame flash of
      // the back cards before the timeline takes over.
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
      {/* The pin target. `h-[100dvh]` makes the stack feel like a full screen
          on mobile, so cards never sit as a tiny letterbox in the middle of
          dead space. `overflow-hidden` is the safety net that guarantees a card
          parked at yPercent: 100 can never peek into the layout below. */}
      <div className="works-sticky-cards relative flex h-[100dvh] w-full items-center justify-center overflow-hidden px-3 sm:px-5 md:px-8">
        {/* Aspect-driven stage instead of a fixed dvh height. The work
            thumbnails are landscape (~16:9); making the card extremely
            portrait on mobile (the previous attempt) cropped the image to
            a thin centred strip. 4/5 on phones leaves the artwork readable
            while still feeling substantial; the stage broadens to 16:10
            and then video as the viewport widens. */}
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
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-md ring-1 ring-white/25 md:text-xs">
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
          <ScrambleText words={['Work', 'Craft', 'Brands', 'Products', 'Victory']} />
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

      <section className="relative w-full bg-gradient-to-b from-white via-neutral-50/80 to-white pb-5">
        <WorksGsapStack works={works} />
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-medium uppercase tracking-wider">All projects</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>
        <div className="flex flex-col">
          {works.map((work, i) => (
            <motion.a
              key={work.slug}
              href={work.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group block py-8 border-b border-brand-black/10 last:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-4 rounded-sm"
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-center">
                <div className="flex-1 order-2 md:order-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-400">
                    <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {work.category}
                    </span>
                    <span>{work.year}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:inline" />
                    <span>{work.client}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-normal leading-tight mb-4 group-hover:underline decoration-1 underline-offset-8 transition-all text-brand-black">
                    {work.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">{work.subtitle}</p>
                </div>
                <div className="w-full md:w-48 aspect-video md:aspect-[4/3] bg-gray-100 overflow-hidden relative shrink-0 order-1 md:order-2 rounded-xl ring-1 ring-black/5">
                  <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
                    <OptimisedPicture
                      src={work.thumbnail.src}
                      sources={work.thumbnail.sources}
                      width={work.thumbnail.width}
                      height={work.thumbnail.height}
                      alt={`${work.title} thumbnail`}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 192px"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
};

const WorksPage = () => <WorksPageInner />;

const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  const jobs = [
    {
      id: 1,
      title: "Senior Visual Designer",
      category: "Design",
      location: "Remote / Lagos",
      type: "Full-time",
      description: "We're looking for a visionary designer to lead our branding projects and push the boundaries of visual storytelling.",
      responsibilities: [
        "Lead the visual direction for high-impact branding projects.",
        "Collaborate with cross-functional teams to deliver cohesive design systems.",
        "Mentor junior designers and provide constructive feedback.",
        "Stay ahead of design trends and implement innovative visual solutions."
      ],
      requirements: [
        "5+ years of experience in visual or brand design.",
        "Expertise in Adobe Creative Suite and Figma.",
        "Strong portfolio demonstrating high-end visual storytelling.",
        "Excellent communication and leadership skills."
      ]
    },
    {
      id: 2,
      title: "Product Designer (UI/UX)",
      category: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Join our product team to build seamless digital experiences for our global clients.",
      responsibilities: [
        "Design intuitive user interfaces and user experiences.",
        "Conduct user research and translate findings into design solutions.",
        "Create wireframes, prototypes, and high-fidelity mockups.",
        "Work closely with developers to ensure design feasibility."
      ],
      requirements: [
        "3+ years of experience in UI/UX design.",
        "Proficiency in Figma and prototyping tools.",
        "Deep understanding of user-centered design principles.",
        "Experience working in an agile environment."
      ]
    },
    {
      id: 3,
      title: "Creative Technologist",
      category: "Engineering",
      location: "Hybrid / Lagos",
      type: "Full-time",
      description: "Bridge the gap between design and code. We need someone who can bring complex interactions to life.",
      responsibilities: [
        "Develop high-performance, interactive web experiences.",
        "Prototype experimental design concepts using code.",
        "Collaborate with designers to implement complex animations.",
        "Optimize web applications for maximum speed and scalability."
      ],
      requirements: [
        "Strong proficiency in React, TypeScript, and Framer Motion.",
        "Experience with WebGL or Three.js is a plus.",
        "A keen eye for design and attention to detail.",
        "Problem-solving mindset and passion for creative coding."
      ]
    },
    {
      id: 4,
      title: "Motion Graphics Artist",
      category: "Design",
      location: "Remote",
      type: "Contract",
      description: "Help us add life to our projects through high-end motion design and animation.",
      responsibilities: [
        "Create compelling motion graphics for digital and social media.",
        "Animate brand identities and UI interactions.",
        "Collaborate with the creative team on video production.",
        "Manage multiple projects from concept to final delivery."
      ],
      requirements: [
        "Expertise in After Effects, Cinema 4D, or similar tools.",
        "Strong sense of timing, rhythm, and motion principles.",
        "Ability to work independently and meet tight deadlines.",
        "Portfolio showcasing diverse motion design work."
      ]
    },
    {
      id: 5,
      title: "Studio Manager",
      category: "Operations",
      location: "Lagos",
      type: "Full-time",
      description: "Keep the studio running smoothly. You'll be the backbone of our creative operations.",
      responsibilities: [
        "Oversee day-to-day studio operations and logistics.",
        "Manage project timelines and resource allocation.",
        "Coordinate with clients and external partners.",
        "Foster a positive and productive studio culture."
      ],
      requirements: [
        "Experience in operations or project management within a creative agency.",
        "Exceptional organizational and multitasking abilities.",
        "Strong interpersonal and communication skills.",
        "Proficiency in project management tools."
      ]
    }
  ];

  const handleApplicationSuccess = () => {
    setIsApplying(false);
    setSelectedJob(null);
  };

  if (selectedJob && !isApplying) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="px-8 py-12 max-w-5xl mx-auto">
          <button 
            onClick={() => setSelectedJob(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-black mb-12 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium uppercase tracking-widest">Back to Careers</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-3 py-1 rounded">
                  {selectedJob.category}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                  {selectedJob.type}
                </span>
              </div>
              <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-normal tracking-tighter mb-8">
                {selectedJob.title}
              </h1>
              <div className="flex flex-wrap gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  Posted 2d ago
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsApplying(true)}
              className="bg-brand-black text-white px-10 py-5 rounded-full font-medium hover:bg-brand-orange transition-all duration-300 shadow-xl hover:shadow-brand-orange/20"
            >
              Apply for this position
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="md:col-span-2 space-y-16">
              <section>
                <h2 className="text-2xl font-normal mb-6">About the Role</h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {selectedJob.description}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-normal mb-6">Responsibilities</h2>
                <ul className="space-y-4">
                  {selectedJob.responsibilities.map((item: string, i: number) => (
                    <li key={i} className="flex gap-4 text-gray-600 leading-relaxed">
                      <span className="text-brand-orange font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-normal mb-6">Requirements</h2>
                <ul className="space-y-4">
                  {selectedJob.requirements.map((item: string, i: number) => (
                    <li key={i} className="flex gap-4 text-gray-600 leading-relaxed">
                      <span className="text-brand-orange font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="space-y-12">
              <div className="bg-gray-50 p-10 rounded-[40px]">
                <h3 className="text-xl font-normal mb-6">Why Checkmate?</h3>
                <ul className="space-y-6">
                  {[
                    "Remote-first culture",
                    "Health & Wellness stipend",
                    "Annual studio retreats",
                    "Learning & Development budget",
                    "Cutting-edge equipment"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero */}
      <section className="pt-12 pb-20 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <h1 className="text-[clamp(3.25rem,11vw,8rem)] font-normal tracking-tighter mb-8">
            Join the <span className="text-brand-orange">Studio.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            We're always looking for brilliant minds who believe that design can change the world. At Checkmate, we don't just fill roles; we build teams of visionaries.
          </p>
        </motion.div>
      </section>

      {/* Job List */}
      <section className="px-8 pb-32">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-sm font-medium uppercase tracking-wider">Open Positions</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedJob(job)}
              className="group cursor-pointer bg-gray-50 hover:bg-brand-black hover:text-white p-8 rounded-3xl transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                    {job.category}
                  </span>
                  <span className="text-xs opacity-40 uppercase tracking-widest font-bold">
                    {job.type}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-normal tracking-tight">
                  {job.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-8 text-sm opacity-60">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {job.location}
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Clock size={16} />
                  Posted 2d ago
                </div>
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange transition-colors">
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedJob && isApplying && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplying(false)}
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 md:p-12 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                      {selectedJob.category}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                      {selectedJob.type}
                    </span>
                  </div>
                  <h2 className="text-[clamp(1.75rem,4.2vw,3rem)] font-normal tracking-tighter mb-4">
                    Apply for {selectedJob.title}
                  </h2>
                  <p className="text-gray-500 max-w-xl">
                    {selectedJob.description}
                  </p>
                </div>
                <button 
                  onClick={() => setIsApplying(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content / Form */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <CareerApplicationForm
                  job={{
                    id: selectedJob.id,
                    title: selectedJob.title,
                    description: selectedJob.description
                  }}
                  onSuccess={handleApplicationSuccess}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full overflow-hidden">
    <div className="w-full h-px bg-brand-black/10" />
    <div className="pt-12 pb-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 md:mb-24">
      <div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400">STAY UP TO DATE</p>
          <div className="flex gap-2 md:hidden">
            {FOOTER_SOCIALS.map((social) => {
              const Icon = SOCIAL_ICONS[social.name];
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="p-2 bg-gray-100 rounded-full hover:bg-brand-orange hover:text-white transition-all"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
        <h2 className="text-[clamp(1.875rem,5.5vw,3.75rem)] font-bold mb-6">Get our newsletter</h2>
        <NewsletterForm variant="footer" source="footer" />
      </div>

      <div className="hidden md:flex flex-col items-end justify-end">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-12">SOCIAL MEDIA</p>
        <div className="flex gap-3">
          {FOOTER_SOCIALS.map((social) => {
            const Icon = SOCIAL_ICONS[social.name];
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                className="p-3 bg-gray-100 rounded-full hover:bg-brand-orange hover:text-white transition-all"
              >
                <Icon size={24} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  
  <div className="w-full">
      <img 
        src="https://res.cloudinary.com/dliesrplu/image/upload/v1776887718/Group_4_2_wnxerp.png" 
        alt="CHECKMATE" 
        className="w-full h-auto block"
        referrerPolicy="no-referrer"
      />
    </div>
  </footer>
);

const PAGE_SEO: Record<string, { title: string; description: string; canonical: string }> = {
  '/': {
    title: 'Checkmate Studios — A Premium Design Agency for Branding, Web & Product Design',
    description:
      'Bold branding, beautiful websites, and seamless digital products — built to win. Explore the studio behind every flawless victory.',
    canonical: 'https://www.studiocheckmate.com/'
  },
  '/resources': {
    title: 'Resources — Templates, Icons & Design Kits',
    description:
      'Premium design resources from Checkmate Studios — curated templates, icon sets, illustrations and more, designed for a flawless victory.',
    canonical: 'https://www.studiocheckmate.com/resources'
  },
  '/playground': {
    title: 'Playground — Design Insights & Stories',
    description:
      'Articles, insights and behind-the-scenes stories from the Checkmate Studios design team.',
    canonical: 'https://www.studiocheckmate.com/playground'
  },
  '/works': {
    title: 'Work — Selected Projects & Case Studies',
    description:
      'Explore branding, digital products, and campaigns from Checkmate Studios — a scroll-through portfolio of recent client work.',
    canonical: 'https://www.studiocheckmate.com/works'
  },
  '/careers': {
    title: 'Careers — Join the Studio',
    description:
      'Open roles at Checkmate Studios. Join a team of designers, technologists and storytellers building bold digital products.',
    canonical: 'https://www.studiocheckmate.com/careers'
  }
};

/** Wraps a routed page in the shared fade transition. The Works route opts out
 *  because its GSAP ScrollTrigger pin conflicts with the opacity tween. */
const PageFade = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const HomePage = () => (
  <>
    <Hero />
    <Offerings />
    <RecentWorks />
    <Partners />
    <Testimonial />
    <Resources />
    <ContactForm />
  </>
);

export default function App() {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(false);

  usePageSeo(PAGE_SEO[location.pathname] ?? PAGE_SEO['/']);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen selection:bg-brand-orange selection:text-white">
      <AnimatePresence>
        {showNavbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>
      {showNavbar && <BottomNav />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageFade><HomePage /></PageFade>} />
            <Route path="/resources" element={<PageFade><ResourcesPage /></PageFade>} />
            <Route path="/playground" element={<PageFade><PlaygroundPage /></PageFade>} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/careers" element={<PageFade><CareersPage /></PageFade>} />
            {/* Fallback: any unknown path renders home rather than a 404 wall. */}
            <Route path="*" element={<PageFade><HomePage /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>
      {/* Bottom padding on mobile so the floating dock never sits on top of
          the footer's final copy. */}
      <div className="pb-24 md:pb-0">
        <Footer />
      </div>
    </div>
  );
}
