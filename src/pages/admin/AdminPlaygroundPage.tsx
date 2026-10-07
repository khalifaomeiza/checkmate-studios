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
  deletePlaygroundPost,
  fetchAllPlaygroundPostsAdmin,
  fetchPlaygroundPageConfig,
  savePlaygroundPageConfig
} from '../../lib/playground-cms';
import { toast } from '../../lib/toast';
import type { PlaygroundPageConfig, PlaygroundPost } from '../../types/cms';

export const AdminPlaygroundPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PlaygroundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState<PlaygroundPageConfig | null>(null);
  const [savingHero, setSavingHero] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PlaygroundPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    void Promise.all([fetchAllPlaygroundPostsAdmin(), fetchPlaygroundPageConfig()])
      .then(([rows, cfg]) => {
        setPosts(rows);
        setPageConfig(cfg);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not load playground.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const saveHero = async () => {
    if (!pageConfig) return;
    setSavingHero(true);
    try {
      await savePlaygroundPageConfig(pageConfig);
      toast.success('Playground hero saved.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save hero.');
    } finally {
      setSavingHero(false);
    }
  };

  const removePost = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePlaygroundPost(deleteTarget.id);
      toast.success('Post deleted.');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete post.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Playground"
      description="Edit hero copy and thought pieces that appear on the public Playground page."
      actions={
        <button type="button" className={adminPrimaryBtn} onClick={() => navigate('/admin/playground/new')}>
          <Plus size={16} />
          New post
        </button>
      }
    >
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`Delete “${deleteTarget?.title ?? 'post'}”?`}
        description="This removes the post from the website immediately if it was published."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void removePost()}
      />

      {pageConfig ? (
        <section className="mb-10 rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium">Page hero</h2>
              <p className="text-sm text-gray-500 mt-1">Scramble headline and intro on /playground</p>
            </div>
            <Link to="/playground" className={adminGhostBtn} target="_blank" rel="noreferrer">
              <ExternalLink size={14} />
              View live
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="scrambleWords">
                Scramble words (comma-separated)
              </label>
              <input
                id="scrambleWords"
                className={adminFieldClass}
                value={pageConfig.scrambleWords.join(', ')}
                onChange={(e) =>
                  setPageConfig({
                    ...pageConfig,
                    scrambleWords: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="heroSubtitle">
                Hero subtitle
              </label>
              <textarea
                id="heroSubtitle"
                rows={3}
                className={adminFieldClass}
                value={pageConfig.heroSubtitle}
                onChange={(e) => setPageConfig({ ...pageConfig, heroSubtitle: e.target.value })}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={savingHero}
            className={`${adminPrimaryBtn} mt-6 disabled:opacity-60`}
            onClick={() => void saveHero()}
          >
            {savingHero ? 'Saving…' : 'Save hero'}
          </button>
        </section>
      ) : null}

      {loading ? (
        <p className="text-gray-500">Loading posts…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white/60 p-12 text-center">
          <p className="text-gray-500 mb-4">No posts yet — create your first Playground story.</p>
          <button type="button" className={adminPrimaryBtn} onClick={() => navigate('/admin/playground/new')}>
            <Plus size={16} />
            New post
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="group flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:flex-row md:items-center"
            >
              <div
                className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 md:h-16 md:w-28"
                style={{
                  backgroundImage: `url(${post.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 truncate">
                  {post.slug} · {post.category}
                </p>
                <h3 className="text-lg font-medium truncate">{post.title}</h3>
                <CmsStatusBadge status={post.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {post.status === 'published' ? (
                  <Link to="/playground" className={adminGhostBtn} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} />
                    View
                  </Link>
                ) : null}
                <button
                  type="button"
                  className={adminPrimaryBtn}
                  onClick={() => navigate(`/admin/playground/edit/${post.id}`)}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(post)}
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
