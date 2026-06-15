import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublishedCaseStudy, staticWorkFallback } from '../lib/case-studies';
import type { CaseStudy } from '../types/case-study';
import { CaseStudyView } from '../components/case-study/CaseStudyView';
import { BackButton } from '../components/ui/BackButton';
import { usePageSeo } from '../lib/seo';

export const CaseStudyPage = () => {
  const { slug = '' } = useParams();
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  usePageSeo({
    title: study
      ? `${study.title} — Case Study | Checkmate Studios`
      : 'Case Study | Checkmate Studios',
    description: study?.subtitle ?? 'Project case study from Checkmate Studios.',
    canonical: `https://www.studiocheckmate.com/works/${slug}`
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetchPublishedCaseStudy(slug).then((published) => {
      if (cancelled) return;

      if (published) {
        setStudy(published);
        setMissing(false);
      } else {
        const fallback = staticWorkFallback(slug);
        if (fallback) {
          setStudy({
            id: fallback.slug,
            slug: fallback.slug,
            title: fallback.title,
            subtitle: fallback.subtitle,
            client: fallback.client,
            year: fallback.year,
            category: fallback.category,
            tags: fallback.tags ?? [],
            featured: Boolean(fallback.featured),
            status: 'published',
            cover_url: fallback.thumbnail.src,
            cover_width: fallback.thumbnail.width,
            cover_height: fallback.thumbnail.height,
            external_url: fallback.href,
            sort_order: 0,
            published_at: null,
            blocks: []
          });
          setMissing(false);
        } else {
          setMissing(true);
        }
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-sm text-gray-500">
        Loading case study…
      </div>
    );
  }

  if (missing || !study) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-6 text-center">
        <h1 className="text-3xl font-normal tracking-tight mb-4">Case study not found</h1>
        <p className="text-gray-500 mb-8">This project hasn&apos;t been published yet.</p>
        <BackButton to="/works" label="Back to Works" />
      </div>
    );
  }

  return (
    <>
      <CaseStudyView study={study} />
      {study.blocks?.length === 0 ? (
        <div className="px-6 md:px-12 pb-24 text-center text-gray-500 text-sm max-w-lg mx-auto">
          <p>
            This project&apos;s full case study is being prepared. Check back soon for the curated
            project page.
          </p>
        </div>
      ) : null}
    </>
  );
};
