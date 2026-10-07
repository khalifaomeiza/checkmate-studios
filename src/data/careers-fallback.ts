import type { CareerJob, CareersPageConfig } from '../types/cms';

export const CAREERS_PAGE_FALLBACK: CareersPageConfig = {
  heroTitleHtml: 'Join the <span class="text-brand-orange">Studio.</span>',
  heroSubtitle:
    "We're always looking for brilliant minds who believe that design can change the world. At Checkmate, we don't just fill roles; we build teams of visionaries.",
  benefits: [
    'Remote-first culture',
    'Health & Wellness stipend',
    'Annual studio retreats',
    'Learning & Development budget',
    'Cutting-edge equipment'
  ]
};

export const CAREER_JOBS_FALLBACK: CareerJob[] = [
  {
    id: 'fallback-job-1',
    slug: 'senior-visual-designer',
    title: 'Senior Visual Designer',
    category: 'Design',
    location: 'Remote / Lagos',
    employment_type: 'Full-time',
    description:
      "We're looking for a visionary designer to lead our branding projects and push the boundaries of visual storytelling.",
    responsibilities: [
      'Lead the visual direction for high-impact branding projects.',
      'Collaborate with cross-functional teams to deliver cohesive design systems.',
      'Mentor junior designers and provide constructive feedback.',
      'Stay ahead of design trends and implement innovative visual solutions.'
    ],
    requirements: [
      '5+ years of experience in visual or brand design.',
      'Expertise in Adobe Creative Suite and Figma.',
      'Strong portfolio demonstrating high-end visual storytelling.',
      'Excellent communication and leadership skills.'
    ],
    status: 'published',
    sort_order: 0,
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-job-2',
    slug: 'product-designer-ui-ux',
    title: 'Product Designer (UI/UX)',
    category: 'Design',
    location: 'Remote',
    employment_type: 'Full-time',
    description: 'Join our product team to build seamless digital experiences for our global clients.',
    responsibilities: [
      'Design intuitive user interfaces and user experiences.',
      'Conduct user research and translate findings into design solutions.',
      'Create wireframes, prototypes, and high-fidelity mockups.',
      'Work closely with developers to ensure design feasibility.'
    ],
    requirements: [
      '3+ years of experience in UI/UX design.',
      'Proficiency in Figma and prototyping tools.',
      'Deep understanding of user-centered design principles.',
      'Experience working in an agile environment.'
    ],
    status: 'published',
    sort_order: 1,
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-job-3',
    slug: 'creative-technologist',
    title: 'Creative Technologist',
    category: 'Engineering',
    location: 'Hybrid / Lagos',
    employment_type: 'Full-time',
    description: 'Bridge the gap between design and code. We need someone who can bring complex interactions to life.',
    responsibilities: [
      'Develop high-performance, interactive web experiences.',
      'Prototype experimental design concepts using code.',
      'Collaborate with designers to implement complex animations.',
      'Optimize web applications for maximum speed and scalability.'
    ],
    requirements: [
      'Strong proficiency in React, TypeScript, and Framer Motion.',
      'Experience with WebGL or Three.js is a plus.',
      'A keen eye for design and attention to detail.',
      'Problem-solving mindset and passion for creative coding.'
    ],
    status: 'published',
    sort_order: 2,
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-job-4',
    slug: 'motion-graphics-artist',
    title: 'Motion Graphics Artist',
    category: 'Design',
    location: 'Remote',
    employment_type: 'Contract',
    description: 'Help us add life to our projects through high-end motion design and animation.',
    responsibilities: [
      'Create compelling motion graphics for digital and social media.',
      'Animate brand identities and UI interactions.',
      'Collaborate with the creative team on video production.',
      'Manage multiple projects from concept to final delivery.'
    ],
    requirements: [
      'Expertise in After Effects, Cinema 4D, or similar tools.',
      'Strong sense of timing, rhythm, and motion principles.',
      'Ability to work independently and meet tight deadlines.',
      'Portfolio showcasing diverse motion design work.'
    ],
    status: 'published',
    sort_order: 3,
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-job-5',
    slug: 'studio-manager',
    title: 'Studio Manager',
    category: 'Operations',
    location: 'Lagos',
    employment_type: 'Full-time',
    description: "Keep the studio running smoothly. You'll be the backbone of our creative operations.",
    responsibilities: [
      'Oversee day-to-day studio operations and logistics.',
      'Manage project timelines and resource allocation.',
      'Coordinate with clients and external partners.',
      'Foster a positive and productive studio culture.'
    ],
    requirements: [
      'Experience in operations or project management within a creative agency.',
      'Exceptional organizational and multitasking abilities.',
      'Strong interpersonal and communication skills.',
      'Proficiency in project management tools.'
    ],
    status: 'published',
    sort_order: 4,
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
