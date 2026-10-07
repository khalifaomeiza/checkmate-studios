-- Playground + Careers CMS, editor access to applications

-- ---------------------------------------------------------------------------
-- Site page settings (hero copy per page)
-- ---------------------------------------------------------------------------
create table if not exists public.site_pages (
  page_key    text primary key check (page_key in ('playground', 'careers')),
  config      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default timezone('utc', now())
);

drop trigger if exists site_pages_set_updated_at on public.site_pages;
create trigger site_pages_set_updated_at
before update on public.site_pages
for each row execute function public.set_updated_at();

insert into public.site_pages (page_key, config)
values
  (
    'playground',
    '{
      "scrambleWords": ["Playground", "Ideas", "Thoughts", "Design", "Tomorrow"],
      "heroSubtitle": "Exploring how intentional design decisions shape our daily habits, emotions, and the future of our society."
    }'::jsonb
  ),
  (
    'careers',
    '{
      "heroTitleHtml": "Join the <span class=\"text-brand-orange\">Studio.</span>",
      "heroSubtitle": "We''re always looking for brilliant minds who believe that design can change the world. At Checkmate, we don''t just fill roles; we build teams of visionaries.",
      "benefits": [
        "Remote-first culture",
        "Health & Wellness stipend",
        "Annual studio retreats",
        "Learning & Development budget",
        "Cutting-edge equipment"
      ]
    }'::jsonb
  )
on conflict (page_key) do nothing;

-- ---------------------------------------------------------------------------
-- Playground posts
-- ---------------------------------------------------------------------------
create table if not exists public.playground_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text not null,
  category      text not null
                check (category in ('Insights', 'Press', 'Featured', 'At Checkmate')),
  author        text not null,
  author_role   text not null default '',
  image_url     text not null,
  body          text not null default '',
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  sort_order    integer not null default 0,
  published_at  timestamptz,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

create index if not exists playground_posts_status_idx on public.playground_posts (status);
create index if not exists playground_posts_sort_idx on public.playground_posts (sort_order, published_at desc);

drop trigger if exists playground_posts_set_updated_at on public.playground_posts;
create trigger playground_posts_set_updated_at
before update on public.playground_posts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Career job listings
-- ---------------------------------------------------------------------------
create table if not exists public.career_jobs (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  category         text not null,
  location         text not null,
  employment_type  text not null default 'Full-time',
  description      text not null,
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  status           text not null default 'draft'
                   check (status in ('draft', 'published')),
  sort_order       integer not null default 0,
  posted_at        timestamptz not null default timezone('utc', now()),
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now())
);

create index if not exists career_jobs_status_idx on public.career_jobs (status);
create index if not exists career_jobs_sort_idx on public.career_jobs (sort_order, posted_at desc);

drop trigger if exists career_jobs_set_updated_at on public.career_jobs;
create trigger career_jobs_set_updated_at
before update on public.career_jobs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.site_pages enable row level security;
alter table public.playground_posts enable row level security;
alter table public.career_jobs enable row level security;

drop policy if exists site_pages_public_read on public.site_pages;
create policy site_pages_public_read on public.site_pages
  for select using (true);

drop policy if exists site_pages_editor_write on public.site_pages;
create policy site_pages_editor_write on public.site_pages
  for all using (public.is_studio_editor())
  with check (public.is_studio_editor());

drop policy if exists playground_posts_public_read on public.playground_posts;
create policy playground_posts_public_read on public.playground_posts
  for select using (status = 'published' or public.is_studio_editor());

drop policy if exists playground_posts_editor_write on public.playground_posts;
create policy playground_posts_editor_write on public.playground_posts
  for all using (public.is_studio_editor())
  with check (public.is_studio_editor());

drop policy if exists career_jobs_public_read on public.career_jobs;
create policy career_jobs_public_read on public.career_jobs
  for select using (status = 'published' or public.is_studio_editor());

drop policy if exists career_jobs_editor_write on public.career_jobs;
create policy career_jobs_editor_write on public.career_jobs
  for all using (public.is_studio_editor())
  with check (public.is_studio_editor());

-- Career applications: editors can read and update pipeline status
drop policy if exists career_applications_editor_select on public.career_applications;
create policy career_applications_editor_select on public.career_applications
  for select using (public.is_studio_editor());

drop policy if exists career_applications_editor_update on public.career_applications;
create policy career_applications_editor_update on public.career_applications
  for update using (public.is_studio_editor())
  with check (public.is_studio_editor());

-- ---------------------------------------------------------------------------
-- Seed default content (matches legacy static pages)
-- ---------------------------------------------------------------------------
insert into public.playground_posts (
  slug, title, excerpt, category, author, author_role, image_url, body, status, sort_order, published_at
) values
  (
    'silent-influence-minimalist-design',
    'The Silent Influence of Minimalist Design',
    'How stripping away the unnecessary can lead to a more focused and fulfilling life.',
    'Insights',
    'Alex Rivers',
    'Design Lead',
    'https://picsum.photos/seed/minimal/1200/800',
    E'Design is more than just how something looks. It''s about how it works, how it feels, and how it impacts the lives of the people who use it.\n\nWhen we approach a new project, we start by asking ourselves: how will this improve the user''s life?',
    'published',
    0,
    timezone('utc', '2026-03-24'::timestamptz)
  ),
  (
    'agency-of-the-year',
    'Checkmate Studio Wins Agency of the Year',
    'We are thrilled to announce that Checkmate Studio has been recognized for its commitment to design excellence.',
    'Press',
    'Sarah Chen',
    'Visual Strategist',
    'https://picsum.photos/seed/award/1200/800',
    'Recognition is never the goal — but it validates the craft we pour into every engagement.',
    'published',
    1,
    timezone('utc', '2026-03-18'::timestamptz)
  ),
  (
    'design-for-longevity',
    'Design for Longevity: Moving Beyond Trends',
    'In a world of fast design, how do we create products that stand the test of time?',
    'Featured',
    'Marcus Thorne',
    'Creative Director',
    'https://picsum.photos/seed/time/1200/800',
    'Longevity means restraint, systems thinking, and empathy that outlasts a quarterly roadmap.',
    'published',
    2,
    timezone('utc', '2026-03-12'::timestamptz)
  ),
  (
    'new-studio-space',
    'Behind the Scenes: Our New Studio Space',
    'A look inside the environment where our best ideas come to life.',
    'At Checkmate',
    'Elena Vance',
    'Product Designer',
    'https://picsum.photos/seed/studio/1200/800',
    'Light, material, and acoustics — the invisible infrastructure of creative focus.',
    'published',
    3,
    timezone('utc', '2026-03-05'::timestamptz)
  ),
  (
    'future-of-interface-design',
    'The Future of Interface Design',
    'Predicting the next decade of digital interaction and human-computer relationships.',
    'Insights',
    'Alex Rivers',
    'Design Lead',
    'https://picsum.photos/seed/future/1200/800',
    'Interfaces will dissolve into context — ambient, respectful, and deeply personal.',
    'published',
    4,
    timezone('utc', '2026-02-28'::timestamptz)
  )
on conflict (slug) do nothing;

insert into public.career_jobs (
  slug, title, category, location, employment_type, description, responsibilities, requirements, status, sort_order
) values
  (
    'senior-visual-designer',
    'Senior Visual Designer',
    'Design',
    'Remote / Lagos',
    'Full-time',
    'We''re looking for a visionary designer to lead our branding projects and push the boundaries of visual storytelling.',
    array[
      'Lead the visual direction for high-impact branding projects.',
      'Collaborate with cross-functional teams to deliver cohesive design systems.',
      'Mentor junior designers and provide constructive feedback.',
      'Stay ahead of design trends and implement innovative visual solutions.'
    ],
    array[
      '5+ years of experience in visual or brand design.',
      'Expertise in Adobe Creative Suite and Figma.',
      'Strong portfolio demonstrating high-end visual storytelling.',
      'Excellent communication and leadership skills.'
    ],
    'published',
    0
  ),
  (
    'product-designer-ui-ux',
    'Product Designer (UI/UX)',
    'Design',
    'Remote',
    'Full-time',
    'Join our product team to build seamless digital experiences for our global clients.',
    array[
      'Design intuitive user interfaces and user experiences.',
      'Conduct user research and translate findings into design solutions.',
      'Create wireframes, prototypes, and high-fidelity mockups.',
      'Work closely with developers to ensure design feasibility.'
    ],
    array[
      '3+ years of experience in UI/UX design.',
      'Proficiency in Figma and prototyping tools.',
      'Deep understanding of user-centered design principles.',
      'Experience working in an agile environment.'
    ],
    'published',
    1
  ),
  (
    'creative-technologist',
    'Creative Technologist',
    'Engineering',
    'Hybrid / Lagos',
    'Full-time',
    'Bridge the gap between design and code. We need someone who can bring complex interactions to life.',
    array[
      'Develop high-performance, interactive web experiences.',
      'Prototype experimental design concepts using code.',
      'Collaborate with designers to implement complex animations.',
      'Optimize web applications for maximum speed and scalability.'
    ],
    array[
      'Strong proficiency in React, TypeScript, and Framer Motion.',
      'Experience with WebGL or Three.js is a plus.',
      'A keen eye for design and attention to detail.',
      'Problem-solving mindset and passion for creative coding.'
    ],
    'published',
    2
  ),
  (
    'motion-graphics-artist',
    'Motion Graphics Artist',
    'Design',
    'Remote',
    'Contract',
    'Help us add life to our projects through high-end motion design and animation.',
    array[
      'Create compelling motion graphics for digital and social media.',
      'Animate brand identities and UI interactions.',
      'Collaborate with the creative team on video production.',
      'Manage multiple projects from concept to final delivery.'
    ],
    array[
      'Expertise in After Effects, Cinema 4D, or similar tools.',
      'Strong sense of timing, rhythm, and motion principles.',
      'Ability to work independently and meet tight deadlines.',
      'Portfolio showcasing diverse motion design work.'
    ],
    'published',
    3
  ),
  (
    'studio-manager',
    'Studio Manager',
    'Operations',
    'Lagos',
    'Full-time',
    'Keep the studio running smoothly. You''ll be the backbone of our creative operations.',
    array[
      'Oversee day-to-day studio operations and logistics.',
      'Manage project timelines and resource allocation.',
      'Coordinate with clients and external partners.',
      'Foster a positive and productive studio culture.'
    ],
    array[
      'Experience in operations or project management within a creative agency.',
      'Exceptional organizational and multitasking abilities.',
      'Strong interpersonal and communication skills.',
      'Proficiency in project management tools.'
    ],
    'published',
    4
  )
on conflict (slug) do nothing;
