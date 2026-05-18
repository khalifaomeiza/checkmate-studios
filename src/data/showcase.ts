

import type { WorkCategory } from './works';

import branding1 from '../assets/showcase/branding/branding-1.png?as=picture';
import branding2 from '../assets/showcase/branding/branding-2.png?as=picture';
import branding3 from '../assets/showcase/branding/branding-3.png?as=picture';
import branding4 from '../assets/showcase/branding/branding-4.png?as=picture';

import illustration1 from '../assets/showcase/illustration/illustration-1.png?as=picture';
import illustration2 from '../assets/showcase/illustration/illustration-2.png?as=picture';

import am1 from '../assets/showcase/adverts-and-media/am-1.png?as=picture';
import am2 from '../assets/showcase/adverts-and-media/am-2.png?as=picture';
import am3 from '../assets/showcase/adverts-and-media/am-3.png?as=picture';
import am4 from '../assets/showcase/adverts-and-media/am-4.png?as=picture';

export interface ShowcaseImage {
  kind: 'image';
  src: string;
  sources: Record<string, string>;
  width: number;
  height: number;
  alt: string;
}

export interface ShowcaseVideo {
  kind: 'video';
  src: string;
  poster?: string;
  alt: string;
}

export type ShowcaseItem = ShowcaseImage | ShowcaseVideo;

type ImagetoolsPicture = {
  img: { src: string; w: number; h: number };
  sources: Record<string, string>;
};

const asShowcaseImage =
  (alt: string) =>
  (p: ImagetoolsPicture): ShowcaseImage => ({
    kind: 'image',
    src: p.img.src,
    sources: p.sources,
    width: p.img.w,
    height: p.img.h,
    alt
  });

// ----- Category map -------------------------------------------------------
export const SHOWCASE: Record<WorkCategory, readonly ShowcaseItem[]> = {
  Branding: [
    asShowcaseImage('Branding showcase — identity system')(branding1),
    asShowcaseImage('Branding showcase — logo treatment')(branding2),
    asShowcaseImage('Branding showcase — type & colour exploration')(branding3),
    asShowcaseImage('Branding showcase — applied identity')(branding4)
  ],
  Illustration: [
    asShowcaseImage('Illustration showcase — editorial style')(illustration1),
    asShowcaseImage('Illustration showcase — character vignette')(illustration2)
  ],
  'Adverts and Media': [
    asShowcaseImage('Adverts & media — campaign key visual')(am1),
    asShowcaseImage('Adverts & media — outdoor execution')(am2),
    asShowcaseImage('Adverts & media — social cut')(am3),
    asShowcaseImage('Adverts & media — film still')(am4)
  ],
  Website: [
    {
      kind: 'video',
      src: '/showcase/Websites/web1.mp4',
      alt: 'Website showcase — interactive scroll demo'
    },
    {
      kind: 'video',
      src: '/showcase/Websites/web2.mp4',
      alt: 'Website showcase — product landing demo'
    },
    {
      kind: 'video',
      src: '/showcase/Websites/web3.mp4',
      alt: 'Website showcase — editorial layout demo'
    },
    {
      kind: 'video',
      src: '/showcase/Websites/web4.mp4',
      alt: 'Website showcase — brand site motion demo'
    }
  ],
  Application: [] // pipeline — drop PNGs into src/assets/showcase/application/
};

export const showcaseForCategory = (
  category: WorkCategory
): readonly ShowcaseItem[] => SHOWCASE[category];
