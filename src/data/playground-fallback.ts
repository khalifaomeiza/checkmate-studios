import type { PlaygroundPageConfig, PlaygroundPost } from '../types/cms';

export const PLAYGROUND_PAGE_FALLBACK: PlaygroundPageConfig = {
  scrambleWords: ['Playground', 'Ideas', 'Thoughts', 'Design', 'Tomorrow'],
  heroSubtitle:
    'Exploring how intentional design decisions shape our daily habits, emotions, and the future of our society.'
};

export const PLAYGROUND_FILTERS = ['All', 'Insights', 'Press', 'Featured', 'At Checkmate'] as const;

/** Static fallback when Supabase is unavailable or tables are empty. */
export const PLAYGROUND_POSTS_FALLBACK: PlaygroundPost[] = [
  {
    id: 'fallback-1',
    slug: 'silent-influence-minimalist-design',
    title: 'The Silent Influence of Minimalist Design',
    excerpt: 'How stripping away the unnecessary can lead to a more focused and fulfilling life.',
    category: 'Insights',
    author: 'Alex Rivers',
    author_role: 'Design Lead',
    image_url: 'https://picsum.photos/seed/minimal/1200/800',
    body:
      "Design is more than just how something looks. It's about how it works, how it feels, and how it impacts the lives of the people who use it.\n\nWhen we approach a new project, we start by asking ourselves: how will this improve the user's life?",
    status: 'published',
    sort_order: 0,
    published_at: '2026-03-24T00:00:00.000Z',
    created_at: '2026-03-24T00:00:00.000Z',
    updated_at: '2026-03-24T00:00:00.000Z'
  },
  {
    id: 'fallback-2',
    slug: 'agency-of-the-year',
    title: 'Checkmate Studio Wins Agency of the Year',
    excerpt:
      'We are thrilled to announce that Checkmate Studio has been recognized for its commitment to design excellence.',
    category: 'Press',
    author: 'Sarah Chen',
    author_role: 'Visual Strategist',
    image_url: 'https://picsum.photos/seed/award/1200/800',
    body: 'Recognition is never the goal — but it validates the craft we pour into every engagement.',
    status: 'published',
    sort_order: 1,
    published_at: '2026-03-18T00:00:00.000Z',
    created_at: '2026-03-18T00:00:00.000Z',
    updated_at: '2026-03-18T00:00:00.000Z'
  },
  {
    id: 'fallback-3',
    slug: 'design-for-longevity',
    title: 'Design for Longevity: Moving Beyond Trends',
    excerpt: 'In a world of fast design, how do we create products that stand the test of time?',
    category: 'Featured',
    author: 'Marcus Thorne',
    author_role: 'Creative Director',
    image_url: 'https://picsum.photos/seed/time/1200/800',
    body: 'Longevity means restraint, systems thinking, and empathy that outlasts a quarterly roadmap.',
    status: 'published',
    sort_order: 2,
    published_at: '2026-03-12T00:00:00.000Z',
    created_at: '2026-03-12T00:00:00.000Z',
    updated_at: '2026-03-12T00:00:00.000Z'
  },
  {
    id: 'fallback-4',
    slug: 'new-studio-space',
    title: 'Behind the Scenes: Our New Studio Space',
    excerpt: 'A look inside the environment where our best ideas come to life.',
    category: 'At Checkmate',
    author: 'Elena Vance',
    author_role: 'Product Designer',
    image_url: 'https://picsum.photos/seed/studio/1200/800',
    body: 'Light, material, and acoustics — the invisible infrastructure of creative focus.',
    status: 'published',
    sort_order: 3,
    published_at: '2026-03-05T00:00:00.000Z',
    created_at: '2026-03-05T00:00:00.000Z',
    updated_at: '2026-03-05T00:00:00.000Z'
  },
  {
    id: 'fallback-5',
    slug: 'future-of-interface-design',
    title: 'The Future of Interface Design',
    excerpt: 'Predicting the next decade of digital interaction and human-computer relationships.',
    category: 'Insights',
    author: 'Alex Rivers',
    author_role: 'Design Lead',
    image_url: 'https://picsum.photos/seed/future/1200/800',
    body: 'Interfaces will dissolve into context — ambient, respectful, and deeply personal.',
    status: 'published',
    sort_order: 4,
    published_at: '2026-02-28T00:00:00.000Z',
    created_at: '2026-02-28T00:00:00.000Z',
    updated_at: '2026-02-28T00:00:00.000Z'
  }
];
