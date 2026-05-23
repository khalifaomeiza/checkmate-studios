import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

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
            <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
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
              <p className="font-medium">{post.author}</p>
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
            <h2 className="text-3xl font-medium mt-12 mb-6">The Human Element</h2>
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

export const PlaygroundPage = () => {
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
                    <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
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
