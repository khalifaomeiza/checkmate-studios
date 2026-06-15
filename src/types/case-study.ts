export type CaseStudyBlockType = 'image' | 'text' | 'photo_grid' | 'video' | 'embed';

export type CaseStudyStatus = 'draft' | 'published';

export interface CaseStudyMediaItem {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  r2Key?: string;
}

export interface CaseStudyImagePayload extends CaseStudyMediaItem {
  caption?: string;
}

export type CaseStudyTextAlign = 'left' | 'center' | 'right';
export type CaseStudyTextSize = 'display' | 'heading' | 'subheading' | 'body' | 'small';

export interface CaseStudyTextPayload {
  body: string;
  layout?: 'full' | 'narrow';
  align?: CaseStudyTextAlign;
  size?: CaseStudyTextSize;
  bold?: boolean;
  underline?: boolean;
}

export interface CaseStudyPhotoGridPayload {
  columns?: 2 | 3 | 4;
  items: CaseStudyMediaItem[];
}

export interface CaseStudyVideoPayload extends CaseStudyMediaItem {
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export interface CaseStudyEmbedPayload {
  embedUrl?: string;
  html?: string;
  aspectRatio?: string;
}

export type CaseStudyBlockPayload =
  | CaseStudyImagePayload
  | CaseStudyTextPayload
  | CaseStudyPhotoGridPayload
  | CaseStudyVideoPayload
  | CaseStudyEmbedPayload;

export interface CaseStudyBlock {
  id: string;
  case_study_id: string;
  sort_order: number;
  block_type: CaseStudyBlockType;
  payload: CaseStudyBlockPayload;
  created_at?: string;
  updated_at?: string;
}

export interface CaseStudy {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  client: string | null;
  year: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  status: CaseStudyStatus;
  cover_url: string | null;
  cover_width: number | null;
  cover_height: number | null;
  external_url: string | null;
  sort_order: number;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  blocks?: CaseStudyBlock[];
}

export interface StudioProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'editor';
}

export const BLOCK_TYPE_LABELS: Record<CaseStudyBlockType, string> = {
  image: 'Image',
  text: 'Text',
  photo_grid: 'Photo Grid',
  video: 'Video & Audio',
  embed: 'Embed'
};

export const emptyBlockPayload = (type: CaseStudyBlockType): CaseStudyBlockPayload => {
  switch (type) {
    case 'image':
      return { url: '', alt: '' };
    case 'text':
      return {
        body: '',
        layout: 'full',
        align: 'left',
        size: 'body'
      };
    case 'photo_grid':
      return { columns: 2, items: [] };
    case 'video':
      return { url: '', autoplay: true, muted: true, loop: true };
    case 'embed':
      return { embedUrl: '', aspectRatio: '16/9' };
    default:
      return { body: '' };
  }
};
