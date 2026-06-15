import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchAllCaseStudiesAdmin } from '../../lib/case-studies';
import { deleteCaseStudy, openOrCreateCaseStudyForWork } from '../../lib/case-study-admin';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { WORKS } from '../../data/works';
import type { CaseStudy } from '../../types/case-study';
import { OptimisedPicture } from '../../components/media/OptimisedPicture';

export const AdminWorksListPage = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseStudy | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchAllCaseStudiesAdmin()
      .then((rows) => {
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

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-24 px-6 md:px-10">
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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-12">
          <div>
            <Link to="/" className="text-xl font-medium tracking-tighter block mb-4">
              checkmate
            </Link>
            <h1 className="text-4xl font-normal tracking-tight">Case studies</h1>
            <p className="text-gray-500 mt-2">
              Signed in as {profile?.email ?? 'editor'} — build Behance-style project pages.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/works/new')}
              className="inline-flex items-center gap-2 rounded-full bg-brand-black text-white px-5 py-3 text-sm font-medium hover:bg-brand-orange transition-colors"
            >
              <Plus size={16} />
              New case study
            </button>
            <button
              type="button"
              onClick={() => {
                void signOut().then(() => navigate('/admin/login', { replace: true }));
              }}
              className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {openError ? (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{openError}</p>
        ) : null}

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-10">
            {customStudies.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                  Custom projects
                </h2>
                {customStudies.map((study) => (
                  <StudyRow
                    key={study.id}
                    title={study.title}
                    meta={study.slug ?? 'No slug yet'}
                    status={study.status}
                    study={study}
                    onEdit={() => navigate(`/admin/works/edit/${study.id}`)}
                    onDelete={() => setDeleteTarget(study)}
                    deleting={deletingId === study.id}
                  />
                ))}
              </section>
            ) : null}

            <section className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                Portfolio works
              </h2>
              <div className="space-y-3">
                {WORKS.map((work) => {
                  const study = studyBySlug.get(work.slug);
                  const isOpening = openingSlug === work.slug;

                  return (
                    <div
                      key={work.slug}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 md:p-5"
                    >
                      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-[#ececec]">
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
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                          {work.slug}
                        </p>
                        <h3 className="text-lg font-medium">{work.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {study ? (
                            <span className="capitalize">{study.status}</span>
                          ) : (
                            'Not started in CMS'
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {study?.status === 'published' && study.slug ? (
                          <Link
                            to={`/works/${study.slug}`}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand-orange hover:text-brand-orange"
                          >
                            <ExternalLink size={14} />
                            View
                          </Link>
                        ) : null}
                        {study ? (
                          <button
                            type="button"
                            disabled={deletingId === study.id}
                            onClick={() => setDeleteTarget(study)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            {deletingId === study.id ? 'Deleting…' : 'Delete'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={isOpening}
                          onClick={() => void openWorkEditor(work.slug)}
                          className="inline-flex items-center gap-2 rounded-full bg-brand-black text-white px-4 py-2 text-sm font-medium hover:bg-brand-orange disabled:opacity-60"
                        >
                          <Pencil size={14} />
                          {isOpening ? 'Opening…' : 'Edit case study'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const StudyRow = ({
  title,
  meta,
  status,
  study,
  onEdit,
  onDelete,
  deleting = false
}: {
  title: string;
  meta: string;
  status: string;
  study: CaseStudy;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-5">
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{meta}</p>
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 capitalize">{status}</p>
    </div>
    <div className="flex gap-2">
      {study.status === 'published' && study.slug ? (
        <Link
          to={`/works/${study.slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand-orange hover:text-brand-orange"
        >
          <ExternalLink size={14} />
          View
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-2 rounded-full bg-brand-black text-white px-4 py-2 text-sm font-medium hover:bg-brand-orange"
      >
        <Pencil size={14} />
        Edit case study
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={onDelete}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 size={14} />
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  </div>
);
