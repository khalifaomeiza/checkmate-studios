import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  AdminLayout,
  adminFieldClass,
  adminGhostBtn,
  adminLabelClass,
  adminPrimaryBtn
} from '../../components/admin/AdminLayout';
import { CmsStatusBadge } from '../../components/admin/CmsStatusBadge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  deleteCareerJob,
  fetchAllCareerJobsAdmin,
  fetchCareersPageConfig,
  saveCareersPageConfig
} from '../../lib/careers-cms';
import { toast } from '../../lib/toast';
import type { CareerJob, CareersPageConfig } from '../../types/cms';

export const AdminCareersListPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState<CareersPageConfig | null>(null);
  const [savingHero, setSavingHero] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerJob | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    void Promise.all([fetchAllCareerJobsAdmin(), fetchCareersPageConfig()])
      .then(([rows, cfg]) => {
        setJobs(rows);
        setPageConfig(cfg);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not load careers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const saveHero = async () => {
    if (!pageConfig) return;
    setSavingHero(true);
    try {
      await saveCareersPageConfig(pageConfig);
      toast.success('Careers hero saved.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save hero.');
    } finally {
      setSavingHero(false);
    }
  };

  const removeJob = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCareerJob(deleteTarget.id);
      toast.success('Role deleted.');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete role.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Careers"
      description="Manage open roles and hero copy on the public Careers page."
      actions={
        <>
          <button type="button" className={adminGhostBtn} onClick={() => navigate('/admin/applications')}>
            View applications
          </button>
          <button type="button" className={adminPrimaryBtn} onClick={() => navigate('/admin/careers/new')}>
            <Plus size={16} />
            New role
          </button>
        </>
      }
    >
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`Delete “${deleteTarget?.title ?? 'role'}”?`}
        description="Applicants can no longer select this role. Existing applications remain in the pipeline."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void removeJob()}
      />

      {pageConfig ? (
        <section className="mb-10 rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium">Page hero & benefits</h2>
              <p className="text-sm text-gray-500 mt-1">Headline and sidebar benefits on /careers</p>
            </div>
            <Link to="/careers" className={adminGhostBtn} target="_blank" rel="noreferrer">
              <ExternalLink size={14} />
              View live
            </Link>
          </div>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="heroTitleHtml">
                Hero title (HTML allowed for accent span)
              </label>
              <input
                id="heroTitleHtml"
                className={adminFieldClass}
                value={pageConfig.heroTitleHtml}
                onChange={(e) => setPageConfig({ ...pageConfig, heroTitleHtml: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="careersSubtitle">
                Hero subtitle
              </label>
              <textarea
                id="careersSubtitle"
                rows={3}
                className={adminFieldClass}
                value={pageConfig.heroSubtitle}
                onChange={(e) => setPageConfig({ ...pageConfig, heroSubtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="benefits">
                Benefits (one per line)
              </label>
              <textarea
                id="benefits"
                rows={5}
                className={adminFieldClass}
                value={pageConfig.benefits.join('\n')}
                onChange={(e) =>
                  setPageConfig({
                    ...pageConfig,
                    benefits: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                  })
                }
              />
            </div>
          </div>
          <button
            type="button"
            disabled={savingHero}
            className={`${adminPrimaryBtn} mt-6 disabled:opacity-60`}
            onClick={() => void saveHero()}
          >
            {savingHero ? 'Saving…' : 'Save page content'}
          </button>
        </section>
      ) : null}

      {loading ? (
        <p className="text-gray-500">Loading roles…</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white/60 p-12 text-center">
          <p className="text-gray-500 mb-4">No open roles — add your first listing.</p>
          <button type="button" className={adminPrimaryBtn} onClick={() => navigate('/admin/careers/new')}>
            <Plus size={16} />
            New role
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 truncate">
                  {job.slug} · {job.category} · {job.location}
                </p>
                <h3 className="text-lg font-medium">{job.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CmsStatusBadge status={job.status} />
                  <span className="text-xs text-gray-400">{job.employment_type}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.status === 'published' ? (
                  <Link to="/careers" className={adminGhostBtn} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} />
                    View
                  </Link>
                ) : null}
                <button
                  type="button"
                  className={adminPrimaryBtn}
                  onClick={() => navigate(`/admin/careers/edit/${job.id}`)}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(job)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
};
