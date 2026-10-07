import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout, adminPrimaryBtn } from '../../components/admin/AdminLayout';
import { Plus, Pencil, ExternalLink, Trash2 } from 'lucide-react';
import { fetchAllCaseStudiesAdmin, fetchCaseStudyForEditor } from '../../lib/case-studies';
import { deleteCaseStudy, openOrCreateCaseStudyForWork } from '../../lib/case-study-admin';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { PAGE_SIZE, Pagination, paginate } from '../../components/ui/Pagination';
import { WORKS } from '../../data/works';
import type { CaseStudy } from '../../types/case-study';
import { OptimisedPicture } from '../../components/media/OptimisedPicture';
import { cn } from '../../lib/utils';

const StatusBadge = ({
  study,
  hasStudy = Boolean(study)
}: {
  study?: CaseStudy;
  hasStudy?: boolean;
}) => {
  if (!hasStudy || !study) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        Not started
      </span>
    );
  }

  const published = study.status === 'published';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest',
        published ? 'bg-brand-orange/10 text-brand-orange' : 'bg-neutral-100 text-gray-600'
      )}
    >
      {study.status}
    </span>
  );
};

const viewLinkClass =
  'inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm transition-colors hover:border-brand-orange hover:text-brand-orange';

const ViewLink = ({ href, className }: { href: string; className?: string }) => (
  <Link to={href} className={cn(viewLinkClass, 'text-gray-600', className)}>
    <ExternalLink size={14} className="shrink-0" />
    View
  </Link>
);

const actionBtnBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors md:py-2';

const mobileActionRow = 'mt-4 grid grid-cols-2 gap-2 md:mt-0 md:flex md:flex-wrap md:items-center md:gap-2';

const CardContent = ({
  meta,
  title,
  study,
  hasStudy,
  thumbnail
}: {
  meta: string;
  title: string;
  study?: CaseStudy;
  hasStudy: boolean;
  thumbnail?: ReactNode;
}) => (
  <>
    {thumbnail}
    <div className="min-w-0 flex-1 space-y-2">
      <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {meta}
      </p>
      <h3 className="text-lg font-medium leading-snug md:text-xl">{title}</h3>
      <StatusBadge study={study} hasStudy={hasStudy} />
    </div>
  </>
);

const AdminProjectCard = ({
  meta,
  title,
  study,
  hasStudy,
  viewHref,
  thumbnail,
  actions
}: {
  meta: string;
  title: string;
  study?: CaseStudy;
  hasStudy: boolean;
  viewHref?: string;
  thumbnail?: ReactNode;
  actions: ReactNode;
}) => (
  <article className="relative rounded-2xl border border-black/10 bg-white p-4 md:p-5">
    {viewHref ? (
      <ViewLink href={viewHref} className="absolute right-4 top-4 z-10 bg-white shadow-sm md:hidden" />
    ) : null}

    <div className="hidden md:flex md:flex-wrap md:items-center md:gap-4">
      <CardContent
        meta={meta}
        title={title}
        study={study}
        hasStudy={hasStudy}
        thumbnail={thumbnail}
      />
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {viewHref ? <ViewLink href={viewHref} /> : null}
        {actions}
      </div>
    </div>

    <div className={cn('md:hidden', viewHref && 'pt-10')}>
      <div className="flex gap-4">
        <CardContent
          meta={meta}
          title={title}
          study={study}
          hasStudy={hasStudy}
          thumbnail={thumbnail}
        />
      </div>
      <div className={mobileActionRow}>{actions}</div>
    </div>
  </article>
);

export const AdminWorksListPage = () => {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseStudy | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [customOffset, setCustomOffset] = useState(0);
  const [portfolioOffset, setPortfolioOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetchAllCaseStudiesAdmin({ limit: 500, offset: 0 })
      .then(({ rows }) => {
        if (!cancelled) setStudies(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const studyBySlug = useMemo(() => {
    const map = new Map<string, CaseStudy>();
    for (const study of studies) {
      if (study.slug) map.set(study.slug, study);
    }
    return map;
  }, [studies]);

  const workSlugs = useMemo(() => new Set(WORKS.map((w) => w.slug)), []);

  const customStudies = useMemo(
    () => studies.filter((s) => !s.slug || !workSlugs.has(s.slug)),
    [studies, workSlugs]
  );

  const customPage = paginate(customStudies, customOffset);
  const portfolioPage = paginate(WORKS, portfolioOffset);

  useEffect(() => {
    if (customOffset > 0 && customOffset >= customStudies.length) {
      setCustomOffset(Math.max(0, customOffset - PAGE_SIZE));
    }
  }, [customStudies.length, customOffset]);

  useEffect(() => {
    if (portfolioOffset > 0 && portfolioOffset >= WORKS.length) {
      setPortfolioOffset(Math.max(0, portfolioOffset - PAGE_SIZE));
    }
  }, [portfolioOffset]);

  const openWorkEditor = async (workSlug: string) => {
    setOpeningSlug(workSlug);
    setOpenError(null);
    try {
      const study = await openOrCreateCaseStudyForWork(workSlug);
      navigate(`/admin/works/edit/${study.id}`);
    } catch (e) {
      setOpenError(e instanceof Error ? e.message : 'Could not open editor.');
    } finally {
      setOpeningSlug(null);
    }
  };

  const requestPortfolioDelete = async (workSlug: string, study?: CaseStudy) => {
    setOpenError(null);
    if (study) {
      setDeleteTarget(study);
      return;
    }
    try {
      const row = await fetchCaseStudyForEditor(workSlug);
      if (row) {
        setDeleteTarget(row);
        return;
      }
      setOpenError('No case study to delete for this work yet.');
    } catch (e) {
      setOpenError(e instanceof Error ? e.message : 'Could not load case study.');
    }
  };

  const removeStudy = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    setOpenError(null);
    try {
      await deleteCaseStudy(deleteTarget.id);
      setStudies((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setOpenError(e instanceof Error ? e.message : 'Could not delete case study.');
    } finally {
      setDeletingId(null);
    }
  };

  const editBtnClass = cn(actionBtnBase, 'w-full bg-brand-black text-white hover:bg-brand-orange md:w-auto');
  const deleteBtnClass = cn(
    actionBtnBase,
    'w-full border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 md:w-auto'
  );

  return (
    <AdminLayout
      title="Case studies"
      description="Build Behance-style project pages for the portfolio."
      actions={
        <button type="button" className={adminPrimaryBtn} onClick={() => navigate('/admin/works/new')}>
          <Plus size={16} />
          New case study
        </button>
      }
    >
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`Delete “${deleteTarget?.slug ?? deleteTarget?.title ?? 'project'}”?`}
        description="This removes the case study and all uploaded images from Cloudflare R2 and Supabase. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={Boolean(deleteTarget && deletingId === deleteTarget.id)}
        onClose={() => {
          if (!deletingId) setDeleteTarget(null);
        }}
        onConfirm={() => void removeStudy()}
      />
      <div>
        {openError ? (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{openError}</p>
        ) : null}

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-10">
            {customStudies.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                  Custom projects
                </h2>
                {customPage.map((study) => (
                  <AdminProjectCard
                    key={study.id}
                    meta={study.slug ?? 'No slug yet'}
                    title={study.title}
                    study={study}
                    hasStudy
                    viewHref={
                      study.status === 'published' && study.slug
                        ? `/works/${study.slug}`
                        : undefined
                    }
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/works/edit/${study.id}`)}
                          className={editBtnClass}
                        >
                          <Pencil size={14} />
                          <span className="md:hidden">Edit</span>
                          <span className="hidden md:inline">Edit case study</span>
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === study.id}
                          onClick={() => setDeleteTarget(study)}
                          className={deleteBtnClass}
                        >
                          <Trash2 size={14} />
                          {deletingId === study.id ? '…' : 'Delete'}
                        </button>
                      </>
                    }
                  />
                ))}
                <Pagination
                  offset={customOffset}
                  total={customStudies.length}
                  onChange={setCustomOffset}
                />
              </section>
            ) : null}

            <section className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                Portfolio works
              </h2>
              <div className="space-y-3">
                {portfolioPage.map((work) => {
                  const study = studyBySlug.get(work.slug);
                  const isOpening = openingSlug === work.slug;

                  return (
                    <AdminProjectCard
                      key={work.slug}
                      meta={work.slug}
                      title={work.title}
                      study={study}
                      hasStudy={Boolean(study)}
                      viewHref={
                        study?.status === 'published' && study.slug
                          ? `/works/${study.slug}`
                          : undefined
                      }
                      thumbnail={
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[#ececec] sm:h-16 sm:w-28">
                          <OptimisedPicture
                            src={work.thumbnail.src}
                            sources={work.thumbnail.sources}
                            width={work.thumbnail.width}
                            height={work.thumbnail.height}
                            alt=""
                            loading="lazy"
                            sizes="7rem"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      }
                      actions={
                        <>
                          <button
                            type="button"
                            disabled={isOpening}
                            onClick={() => void openWorkEditor(work.slug)}
                            className={cn(editBtnClass, 'disabled:opacity-60')}
                          >
                            <Pencil size={14} />
                            {isOpening ? (
                              '…'
                            ) : (
                              <>
                                <span className="md:hidden">Edit</span>
                                <span className="hidden md:inline">Edit case study</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(study && deletingId === study.id)}
                            onClick={() => void requestPortfolioDelete(work.slug, study)}
                            className={deleteBtnClass}
                          >
                            <Trash2 size={14} />
                            {study && deletingId === study.id ? '…' : 'Delete'}
                          </button>
                        </>
                      }
                    />
                  );
                })}
              </div>
              <Pagination
                offset={portfolioOffset}
                total={WORKS.length}
                onChange={setPortfolioOffset}
              />
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
