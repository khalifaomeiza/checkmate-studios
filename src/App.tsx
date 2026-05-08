import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Facebook, Twitter, Linkedin, Dribbble, ArrowRight, ShoppingCart, X, ChevronLeft, Search, MapPin, Clock } from 'lucide-react';
import { useState, useEffect, useRef, type ComponentType, type SVGProps } from 'react';
import { cn } from './lib/utils';
import { usePageSeo } from './lib/seo';
import { FOOTER_SOCIALS } from './lib/socials';
import { BehanceIcon } from './components/icons/BehanceIcon';
import { NewsletterForm } from './forms/NewsletterForm';
import { ContactForm as ContactFormFields } from './forms/ContactForm';
import { CareerApplicationForm } from './forms/CareerApplicationForm';

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

const Navbar = ({ onNavigate, currentPage }: { onNavigate: (page: string) => void, currentPage: string }) => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between px-8 py-2.5 w-[90%] bg-white/70 backdrop-blur-md border border-brand-black/10 rounded-full shadow-lg transition-all duration-300">
    <div 
      className="text-xl font-bold tracking-tighter cursor-pointer" 
      onClick={() => onNavigate('home')}
    >
      checkmate
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
        className="hover:opacity-60 transition-opacity"
      >
        Work
      </a>
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onNavigate('resources'); }}
        className={cn("hover:opacity-60 transition-opacity", currentPage === 'resources' && "text-brand-orange")}
      >
        Resources
      </a>
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onNavigate('playground'); }}
        className={cn("hover:opacity-60 transition-opacity", currentPage === 'playground' && "text-brand-orange")}
      >
        Playground
      </a>
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onNavigate('careers'); }}
        className={cn("hover:opacity-60 transition-opacity", currentPage === 'careers' && "text-brand-orange")}
      >
        Careers
      </a>
    </div>
    <button
      type="button"
      onClick={() => {
        onNavigate('home');
        requestAnimationFrame(() =>
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
        );
      }}
      className="bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-orange/20"
    >
      Get in touch
    </button>
  </nav>
);

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
        className="relative w-full h-[80vh] md:h-screen overflow-hidden flex items-center justify-center mb-20"
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

      <div className="px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="text-5xl md:text-8xl font-normal tracking-tight"
        >
          You are here by design.
        </motion.h1>
      </div>
    </section>
  );
};

const Offerings = () => {
  const categories = ['Branding', 'Website', 'Application', 'Illustration', 'Adverts and Media'];
  const [activeCategory, setActiveCategory] = useState('Branding');

  // Generate 6 works for each category
  const works = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    title: `${activeCategory} Project ${i + 1}`
  }));

  return (
    <section className="pt-4 pb-12 px-8 w-full">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider">Our Offerings</h2>
        <div className="h-px flex-1 bg-brand-black/10" />
      </div>

      <div className="flex flex-wrap gap-4 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 border",
              activeCategory === cat
                ? "bg-brand-black text-white border-brand-black"
                : "bg-transparent text-brand-black border-brand-black/10 hover:border-brand-black/30"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {works.map((work) => (
            <motion.div
              key={work.id}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const RecentWorks = () => {
  const projects = [
    { title: "Gigly", subtitle: "Freelance Service platform" },
    { title: "Gigly", subtitle: "Freelance Service platform" },
    { title: "Gigly", subtitle: "Freelance Service platform" },
    { title: "Gigly", subtitle: "Freelance Service platform" },
  ];

  return (
    <section className="py-12 px-8 w-full">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-sm font-medium uppercase tracking-wider">Recent Works</h2>
        <div className="h-px flex-1 bg-brand-black/10" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
        {projects.map((project, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="aspect-[4/3] bg-[#E5E5E5] rounded-lg mb-6 overflow-hidden relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"
              />
            </div>
            <h3 className="text-xl font-bold mb-1">{project.title}</h3>
            <p className="text-gray-500">{project.subtitle}</p>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 flex justify-center w-full px-8">
        <button className="w-full md:w-auto border border-brand-black px-8 md:px-20 py-4 rounded-xl text-base md:text-lg font-medium hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300">
          More works that makes you scream checkmate
        </button>
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
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/10 rounded flex items-center justify-center font-bold tracking-widest text-xs">
            LOGO {i + 1}
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
            <p className="text-2xl md:text-4xl font-medium leading-tight mb-12">
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
  const resources = [
    { title: "Workplace Illustrations", subtitle: "5 Scenes, $120" },
    { title: "Photoshop textures", subtitle: "120 textures, $70" },
    { title: "Proposal template", subtitle: "50 pages, $5" },
    { title: "Proposal template", subtitle: "50 pages, $5" },
  ];

  return (
    <section className="bg-brand-orange py-12 px-6">
      <div className="w-full">
        <div className="flex items-center gap-4 mb-12 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Resources <span className="w-2 h-2 bg-white rounded-full inline-block" />
          </h2>
          <div className="h-px flex-1 bg-white/30" />
        </div>
        <p className="text-white/80 text-xl mb-12 max-w-2xl">
          Checkmate Studio's resources that are designed to help you secure a flawless victory, with an unwavering focus on aesthetics and quality, just like a perfect checkmate in a game of chess.
        </p>
        <button className="border border-white text-white px-8 py-3 rounded-full text-sm font-medium mb-16 hover:bg-white hover:text-brand-orange transition-all">
          View full catalog
        </button>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {resources.map((res, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] bg-white/20 rounded-xl mb-6 backdrop-blur-sm overflow-hidden">
                <div className="w-full h-full bg-gray-200/50" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{res.title}</h3>
              <p className="text-white/60">{res.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactForm = () => (
  <section id="contact" className="py-12 px-8 w-full">
    <div className="bg-brand-black text-white rounded-3xl md:rounded-[40px] p-12 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div>
        <h2 className="text-5xl md:text-7xl lg:text-[100px] font-normal leading-[0.9] mb-12">
          Feeling stuck on a project?
        </h2>
        <p className="text-xl text-white/60">
          Let Checkmate Studio help you make the winning move.
        </p>
      </div>

      <ContactFormFields />
    </div>
  </section>
);

const ProductDetailPage = ({ product, onBack }: { product: any, onBack: () => void }) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = [
    "https://picsum.photos/seed/p1/1200/800",
    "https://picsum.photos/seed/p2/1200/800",
    "https://picsum.photos/seed/p3/1200/800",
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-7xl mx-auto px-8 py-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-12 hover:text-brand-orange transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Resources
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              <img 
                src={images[activeImage]} 
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square bg-gray-100 overflow-hidden border-2 transition-all",
                    activeImage === i ? "border-brand-orange" : "border-transparent"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold tracking-tighter mb-4">{product.title}</h1>
              <p className="text-2xl text-gray-400 mb-6">{product.subtitle}</p>
              <div className="text-4xl font-bold text-brand-orange mb-8">{product.price}</div>
              <p className="text-xl text-gray-600 leading-relaxed mb-12">
                {product.description || "A premium resource designed by Checkmate Studio to elevate your creative workflow. This package includes high-quality assets, templates, and documentation to ensure your next project is a flawless victory."}
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-brand-black text-white py-6 text-xl font-bold hover:bg-brand-orange transition-colors flex items-center justify-center gap-3">
                <ShoppingCart size={24} />
                Add to Cart
              </button>
              <button className="w-full border-2 border-brand-black py-6 text-xl font-bold hover:bg-brand-black hover:text-white transition-colors">
                Buy It Now
              </button>
            </div>

            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">What's Included</h3>
              <ul className="grid grid-cols-2 gap-4">
                {["High-res Assets", "Source Files", "Commercial License", "Lifetime Updates", "Documentation", "Support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-500">
                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const products = [
    { title: "Gigly", subtitle: "Freelance Service platform", price: "$10", description: "A comprehensive freelance service platform template designed for modern agencies." },
    { title: "Checkmate UI", subtitle: "Design System", price: "$49", description: "The ultimate design system for building high-performance web applications." },
    { title: "Victory Icons", subtitle: "Icon Set", price: "$15", description: "Over 500+ custom icons crafted for clarity and impact." },
    { title: "Studio Kit", subtitle: "Agency Portfolio", price: "$25", description: "Showcase your work with this brutalist-inspired portfolio template." },
    { title: "Master Bundle", subtitle: "All-in-one Pack", price: "$99", fullWidth: true, description: "Get every resource Checkmate Studio has ever released in one massive bundle." },
  ];

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-7xl md:text-9xl font-normal tracking-tighter mb-8">Resources.</h1>
        <div className="max-w-2xl">
          <p className="text-xl text-gray-600 leading-relaxed">
            Checkmate Studio's resources that are designed to help you secure a flawless victory, with an unwavering focus on aesthetics and quality, just like a perfect checkmate in a game of chess.
          </p>
        </div>
      </div>

      {/* View Toggle & Search */}
      <div className="mb-12 flex items-center gap-4">
        <button 
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className={cn(
            "border border-black px-8 py-3 rounded-full text-sm font-medium transition-all",
            viewMode === 'list' ? "bg-black text-white" : "hover:bg-black hover:text-white"
          )}
        >
          {viewMode === 'grid' ? 'Products List View' : 'Products Grid View'}
        </button>
        
        <div className="relative flex items-center">
          <motion.div
            initial={false}
            animate={{ 
              width: isSearchOpen ? "300px" : "48px",
              backgroundColor: isSearchOpen ? "#f3f4f6" : "transparent",
              borderColor: isSearchOpen ? "transparent" : "rgba(0,0,0,0.1)"
            }}
            className="h-12 rounded-full flex items-center overflow-hidden border transition-colors"
          >
            <button 
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
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProduct(product)}
                className={cn("group cursor-pointer", product.fullWidth && "md:col-span-2")}
              >
                <div className={cn("bg-[#E5E5E5] rounded-none mb-6 overflow-hidden relative", product.fullWidth ? "aspect-[21/9]" : "aspect-[4/3]")}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                    className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" 
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
                </div>
                <div className="flex justify-between items-start px-2">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 group-hover:text-brand-orange transition-colors">{product.title}</h3>
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
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedProduct(product)}
                className="group flex items-center justify-between py-8 border-b border-black/10 cursor-pointer hover:bg-gray-50 transition-colors px-4"
              >
                <div className="flex items-center gap-8">
                  <span className="text-xs font-mono text-gray-400">0{i + 1}</span>
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-brand-orange transition-colors">{product.title}</h3>
                    <p className="text-sm text-gray-500">{product.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <span className="hidden md:block text-sm text-gray-400 max-w-xs truncate">{product.description}</span>
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
            onClick={() => setSearchQuery("")}
            className="mt-4 text-brand-orange font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Featured Projects - Sliding Brick Grid */}
      <section className="mb-32 overflow-hidden -mx-8">
        <div className="flex items-center gap-4 mb-12 px-8">
          <h2 className="text-sm font-medium uppercase tracking-wider">Featured Projects</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Row 1 - Sliding Left */}
          <div className="flex whitespace-nowrap">
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ 
                duration: 40, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex gap-4"
            >
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedProduct(products[i % products.length])}
                  className="w-[450px] md:w-[600px] aspect-[21/9] bg-gray-100 rounded-none overflow-hidden flex-shrink-0 cursor-pointer group relative"
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Sliding Right & Staggered */}
          <div className="flex whitespace-nowrap">
            <motion.div 
              animate={{ x: [-1000, 0] }}
              transition={{ 
                duration: 45, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex gap-4 -ml-[300px]"
            >
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedProduct(products[(i + 2) % products.length])}
                  className="w-[450px] md:w-[600px] aspect-[21/9] bg-gray-100 rounded-none overflow-hidden flex-shrink-0 cursor-pointer group relative"
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Card */}
      <section className="bg-brand-black text-white rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 md:gap-20">
        {/* Illustration */}
        <div className="w-full md:w-1/4 aspect-square bg-white/5 rounded-3xl overflow-hidden relative">
          <img 
            src="https://picsum.photos/seed/checkmate/800/800" 
            alt="Checkmate Illustration" 
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent opacity-60" />
        </div>

        {/* Content (Title + Form) */}
        <div className="flex-1 flex flex-col gap-8">
          <h2 className="text-4xl md:text-5xl font-normal leading-tight max-w-xl">
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
          <h1 className="text-4xl md:text-6xl font-normal leading-[1.1] mb-8">
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
            className="text-7xl md:text-9xl font-normal tracking-tighter mb-8"
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
              <h1 className="text-5xl md:text-7xl font-normal tracking-tighter mb-8">
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
          <h1 className="text-7xl md:text-9xl font-normal tracking-tighter mb-8">
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
                  <h2 className="text-3xl md:text-5xl font-normal tracking-tighter mb-4">
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
        <h2 className="text-3xl md:text-6xl font-bold mb-6">Get our newsletter</h2>
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
  home: {
    title: 'Checkmate Studios — A Premium Design Agency for Branding, Web & Product Design',
    description:
      'Bold branding, beautiful websites, and seamless digital products — built to win. Explore the studio behind every flawless victory.',
    canonical: 'https://www.studiocheckmate.com/'
  },
  resources: {
    title: 'Resources — Templates, Icons & Design Kits',
    description:
      'Premium design resources from Checkmate Studios — curated templates, icon sets, illustrations and more, designed for a flawless victory.',
    canonical: 'https://www.studiocheckmate.com/resources'
  },
  playground: {
    title: 'Playground — Design Insights & Stories',
    description:
      'Articles, insights and behind-the-scenes stories from the Checkmate Studios design team.',
    canonical: 'https://www.studiocheckmate.com/playground'
  },
  careers: {
    title: 'Careers — Join the Studio',
    description:
      'Open roles at Checkmate Studios. Join a team of designers, technologists and storytellers building bold digital products.',
    canonical: 'https://www.studiocheckmate.com/careers'
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showNavbar, setShowNavbar] = useState(false);

  usePageSeo(PAGE_SEO[currentPage] ?? PAGE_SEO.home);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen selection:bg-brand-orange selection:text-white">
      <AnimatePresence>
        {showNavbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
          </motion.div>
        )}
      </AnimatePresence>
      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Hero />
              <Offerings />
              <RecentWorks />
              <Partners />
              <Testimonial />
              <Resources />
              <ContactForm />
            </motion.div>
          ) : currentPage === 'resources' ? (
            <motion.div
              key="resources"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResourcesPage />
            </motion.div>
          ) : currentPage === 'playground' ? (
            <motion.div
              key="playground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PlaygroundPage />
            </motion.div>
          ) : (
            <motion.div
              key="careers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CareersPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
