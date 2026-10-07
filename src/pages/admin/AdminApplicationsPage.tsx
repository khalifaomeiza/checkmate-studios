import { Fragment, useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileText, Search } from 'lucide-react';
import {
  AdminLayout,
  adminFieldClass,
  adminGhostBtn,
  adminLabelClass
} from '../../components/admin/AdminLayout';
import {
  APPLICATION_STATUS_LABELS,
  fetchCareerApplicationsAdmin,
  updateApplicationStatus
} from '../../lib/career-applications-admin';
import { toast } from '../../lib/toast';
import type { ApplicationStatus, CareerApplicationRow } from '../../types/cms';
import { cn } from '../../lib/utils';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'received',
  'reviewing',
  'shortlisted',
  'rejected',
  'hired'
];

const statusPillClass = (status: ApplicationStatus) => {
  switch (status) {
    case 'shortlisted':
      return 'bg-emerald-50 text-emerald-700';
    case 'hired':
      return 'bg-brand-orange/10 text-brand-orange';
    case 'rejected':
      return 'bg-red-50 text-red-600';
    case 'reviewing':
      return 'bg-sky-50 text-sky-700';
    default:
      return 'bg-neutral-100 text-gray-600';
  }
};

export const AdminApplicationsPage = () => {
  const [rows, setRows] = useState<CareerApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    void fetchCareerApplicationsAdmin()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not load applications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.job_title.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const onStatusChange = async (id: string, status: ApplicationStatus) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, status);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success('Status updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout
      title="Applications"
      description="Every careers form submission from the main website — review resumes and move candidates through your pipeline."
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search name, email, or role…"
            className={`${adminFieldClass} pl-11`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="applications-search"
          />
        </div>
        <div className="space-y-2 sm:w-48">
          <label className={adminLabelClass} htmlFor="statusFilter">
            Status
          </label>
          <select
            id="statusFilter"
            className={adminFieldClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading applications…</p>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-3xl border border-dashed border-black/10 bg-white/70 p-16 text-center"
          data-testid="applications-empty"
        >
          <FileText className="mx-auto mb-4 text-gray-300" size={40} />
          <p className="text-gray-500">No applications match your filters yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm" data-testid="applications-table">
              <thead>
                <tr className="border-b border-black/5 bg-[#fafafa] text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const expanded = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr
                        className="border-b border-black/5 hover:bg-[#fcfcfb] transition-colors"
                        data-testid="application-row"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-brand-black">{row.full_name}</p>
                          <a href={`mailto:${row.email}`} className="text-gray-500 hover:text-brand-orange">
                            {row.email}
                          </a>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{row.job_title}</td>
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(row.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest',
                              statusPillClass(row.status)
                            )}
                          >
                            {APPLICATION_STATUS_LABELS[row.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs"
                              value={row.status}
                              disabled={updatingId === row.id}
                              onChange={(e) =>
                                void onStatusChange(row.id, e.target.value as ApplicationStatus)
                              }
                              aria-label={`Status for ${row.full_name}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {APPLICATION_STATUS_LABELS[s]}
                                </option>
                              ))}
                            </select>
                            {row.resume_url ? (
                              <a
                                href={row.resume_url}
                                target="_blank"
                                rel="noreferrer"
                                className={adminGhostBtn + ' !py-1.5 !px-3 text-xs'}
                              >
                                <ExternalLink size={12} />
                                Resume
                              </a>
                            ) : null}
                            <button
                              type="button"
                              className="text-xs font-medium text-gray-500 hover:text-brand-orange"
                              onClick={() => setExpandedId(expanded ? null : row.id)}
                            >
                              {expanded ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="bg-[#fafafa]">
                          <td colSpan={5} className="px-5 py-5 text-sm text-gray-600">
                            {row.portfolio_url ? (
                              <p className="mb-2">
                                Portfolio:{' '}
                                <a
                                  href={row.portfolio_url}
                                  className="text-brand-orange hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {row.portfolio_url}
                                </a>
                              </p>
                            ) : null}
                            {row.cover_letter ? (
                              <p className="whitespace-pre-wrap leading-relaxed">{row.cover_letter}</p>
                            ) : (
                              <p className="text-gray-400 italic">No cover letter provided.</p>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-black/5 px-5 py-3 text-xs text-gray-400">
            {filtered.length} application{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </AdminLayout>
  );
};
