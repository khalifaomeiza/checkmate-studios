import { useEffect } from 'react';

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
}

/**
 * Lightweight per-page SEO hook.
 * Updates <title>, meta description, and canonical link on route changes.
 * Pages also keep the global JSON-LD blocks declared in index.html.
 */
export const usePageSeo = ({ title, description, canonical }: SeoOptions): void => {
  useEffect(() => {
    if (title) {
      const fullTitle = title.includes('Checkmate Studios')
        ? title
        : `${title} — Checkmate Studios`;
      document.title = fullTitle;
      setMeta('property', 'og:title', fullTitle);
      setMeta('name', 'twitter:title', fullTitle);
    }

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
      setMeta('property', 'og:url', canonical);
    }
  }, [title, description, canonical]);
};

const setMeta = (
  attr: 'name' | 'property',
  key: string,
  content: string
): void => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};
