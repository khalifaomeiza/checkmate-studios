import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../lib/utils';
import { BackButton } from '../components/ui/BackButton';
import { ScrambleText } from '../components/playground/ScrambleText';
import {
  PLAYGROUND_FILTERS,
  PLAYGROUND_PAGE_FALLBACK,
  PLAYGROUND_POSTS_FALLBACK
} from '../data/playground-fallback';
import {
  fetchPlaygroundPageConfig,
  fetchPublishedPlaygroundPosts,
  formatPlaygroundDate
} from '../lib/playground-cms';
import type { PlaygroundPageConfig, PlaygroundPost } from '../types/cms';

const PlaygroundDetail = ({ post, onBack }: { post: PlaygroundPost; onBack: () => void }) => {
  const paragraphs = post.body.split(/\n\n+/).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-4xl mx-auto px-8 py-12">
        <BackButton label="Back to Playground" onClick={onBack} className="mb-12" />

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-sm text-gray-400">{formatPlaygroundDate(post.published_at)}</span>
          </div>
          <h1 className="text-[clamp(2rem,5.5vw,3.75rem)] font-normal leading-[1.1] mb-8">{post.title}</h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(post.author)}/100/100`}
                alt={post.author}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-sm text-gray-400">{post.author_role}</p>
            </div>
          </div>
        </div>

        <div className="aspect-video bg-gray-100 overflow-hidden mb-12">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-xl max-w-none">
          <p className="text-xl leading-relaxed text-gray-600 mb-8">{post.excerpt}</p>
          <div className="space-y-6 text-lg leading-relaxed text-gray-800">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PlaygroundPage = () => {
  const [selectedPost, setSelectedPost] = useState<PlaygroundPost | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof PLAYGROUND_FILTERS)[number]>('All');
  const [posts, setPosts] = useState<PlaygroundPost[]>(PLAYGROUND_POSTS_FALLBACK);
  const [pageConfig, setPageConfig] = useState<PlaygroundPageConfig>(PLAYGROUND_PAGE_FALLBACK);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSyncing(true);
    void Promise.all([fetchPublishedPlaygroundPosts(), fetchPlaygroundPageConfig()])
      .then(([published, cfg]) => {
        if (cancelled) return;
        setPosts(published);
        setPageConfig(cfg);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts = useMemo(
    () => (activeFilter === 'All' ? posts : posts.filter((post) => post.category === activeFilter)),
    [activeFilter, posts]
  );

  if (selectedPost) {
    return <PlaygroundDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  const scrambleWords = pageConfig.scrambleWords;
  const heroSubtitle = pageConfig.heroSubtitle;

  return (
    <div className="min-h-screen bg-white pt-24" data-testid="playground-page">
      {syncing ? (
        <div
          className="fixed top-24 right-6 z-50 rounded-full bg-brand-black/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white"
          aria-live="polite"
        >
          Syncing…
        </div>
      ) : null}
      <div className="pt-12 pb-4 px-8 mb-20 relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(3.25rem,11vw,8rem)] font-normal tracking-tighter mb-8"
          data-testid="playground-hero-title"
        >
          <ScrambleText words={scrambleWords} />
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <p className="text-xl text-gray-600 leading-relaxed mb-12" data-testid="playground-hero-subtitle">
            {heroSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4"
        >
          {PLAYGROUND_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all border',
                activeFilter === filter
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'bg-transparent text-gray-500 border-gray-200 hover:border-brand-black hover:text-brand-black'
              )}
            >
              {filter}
            </button>
          ))}
        </motion.div>
      </div>

      <section className="pb-6 px-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-medium uppercase tracking-wider">Latest Thoughts</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>

        <div className="flex flex-col" data-testid="playground-post-list">
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer py-8 border-b border-brand-black/10 last:border-0"
              onClick={() => setSelectedPost(post)}
              data-testid="playground-post-item"
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-center">
                <div className="flex-1 order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span>{formatPlaygroundDate(post.published_at)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{post.author}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-normal leading-tight mb-4 group-hover:underline decoration-1 underline-offset-8 transition-all">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 text-base">{post.excerpt}</p>
                </div>
                <div className="w-full md:w-48 aspect-video md:aspect-square bg-gray-100 overflow-hidden relative shrink-0 order-1 md:order-2">
                  <img
                    src={post.image_url}
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
