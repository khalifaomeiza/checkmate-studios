export type CmsStatus = 'draft' | 'published';

export type PlaygroundCategory = 'Insights' | 'Press' | 'Featured' | 'At Checkmate';

export interface PlaygroundPageConfig {
  scrambleWords: string[];
  heroSubtitle: string;
}

export interface CareersPageConfig {
  heroTitleHtml: string;
  heroSubtitle: string;
  benefits: string[];
}

export interface PlaygroundPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: PlaygroundCategory;
  author: string;
  author_role: string;
  image_url: string;
  body: string;
  status: CmsStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerJob {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  status: CmsStatus;
  sort_order: number;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'received'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export interface CareerApplicationRow {
  id: string;
  job_id: string;
  job_title: string;
  full_name: string;
  email: string;
  portfolio_url: string | null;
  resume_url: string | null;
  resume_name: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface PlaygroundPostInput {
  slug: string;
  title: string;
  excerpt: string;
  category: PlaygroundCategory;
  author: string;
  author_role: string;
  image_url: string;
  body: string;
  status: CmsStatus;
  sort_order: number;
  published_at?: string | null;
}

export interface CareerJobInput {
  slug: string;
  title: string;
  category: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  status: CmsStatus;
  sort_order: number;
  posted_at?: string;
}
