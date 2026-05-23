/**
 * Single source of truth for Checkmate Studios social handles.
 * Pulled from checkmate-website (Footer + BrandDiscovery page) so every
 * surface — UI, JSON-LD, email — references the same canonical URLs.
 */

export interface SocialLink {
  name: string;
  url: string;
  handle: string;
  ariaLabel: string;
}

export const SOCIAL_LINKS = {
  facebook: {
    name: 'Facebook',
    url: 'https://www.facebook.com/studios.checkmate',
    handle: '@studios.checkmate',
    ariaLabel: 'Checkmate Studios on Facebook'
  },
  instagram: {
    name: 'Instagram',
    url: 'https://instagram.com/studios.checkmate',
    handle: '@studios.checkmate',
    ariaLabel: 'Checkmate Studios on Instagram'
  },
  behance: {
    name: 'Behance',
    url: 'https://www.behance.net/checkmatestudios',
    handle: '@checkmatestudios',
    ariaLabel: 'Checkmate Studios on Behance'
  },
  twitter: {
    name: 'Twitter',
    url: 'http://twitter.com/stds_checkmate',
    handle: '@stds_checkmate',
    ariaLabel: 'Checkmate Studios on Twitter / X'
  },
  dribbble: {
    name: 'Dribbble',
    url: 'https://dribbble.com/Checkmate_studios',
    handle: '@Checkmate_studios',
    ariaLabel: 'Checkmate Studios on Dribbble'
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/stds-checkmate/',
    handle: 'stds-checkmate',
    ariaLabel: 'Checkmate Studios on LinkedIn'
  }
} as const satisfies Record<string, SocialLink>;

/** Footer order follows client-approved list (no LinkedIn in this strip). */
export const FOOTER_SOCIALS: readonly SocialLink[] = [
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.twitter,
  SOCIAL_LINKS.dribbble,
  SOCIAL_LINKS.behance,
  SOCIAL_LINKS.facebook
];

export const CONTACT_EMAIL = 'hello@studiocheckmate.com';
