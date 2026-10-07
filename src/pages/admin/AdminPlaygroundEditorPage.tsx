import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import {
  AdminLayout,
  adminFieldClass,
  adminLabelClass,
  adminPrimaryBtn
} from '../../components/admin/AdminLayout';
import { BackButton } from '../../components/ui/BackButton';
import {
  createPlaygroundPost,
  fetchPlaygroundPostById,
  slugify,
  updatePlaygroundPost
} from '../../lib/playground-cms';
import { toast } from '../../lib/toast';
import type { PlaygroundCategory, PlaygroundPostInput } from '../../types/cms';

const CATEGORIES: PlaygroundCategory[] = ['Insights', 'Press', 'Featured', 'At Checkmate'];

const emptyInput = (): PlaygroundPostInput => ({
  slug: '',
  title: '',
  excerpt: '',
  category: 'Insights',
  author: '',
  author_role: '',
  image_url: '',
  body: '',
  status: 'draft',
  sort_order: 0,
  published_at: null
});

export const AdminPlaygroundEditorPage = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [input, setInput] = useState<PlaygroundPostInput>(emptyInput);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    void fetchPlaygroundPostById(id!)
      .then((row) => {
        if (!row) {
          toast.error('Post not found.');
          navigate('/admin/playground', { replace: true });
          return;
        }
        setInput({
          slug: row.slug,
          title: row.title,
          excerpt: row.excerpt,
          category: row.category,
          author: row.author,
          author_role: row.author_role,
          image_url: row.image_url,
          body: row.body,
          status: row.status,
          sort_order: row.sort_order,
          published_at: row.published_at
        });
        setSlugTouched(true);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not load post.'))
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...input,
        slug: slugify(input.slug || input.title)
      };
      if (isNew) {
        const created = await createPlaygroundPost(payload);
        toast.success('Post created.');
        navigate(`/admin/playground/edit/${created.id}`, { replace: true });
      } else {
        await updatePlaygroundPost(id!, payload);
        toast.success('Post saved.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isNew ? 'New Playground post' : 'Edit Playground post'}
      description="Craft the story — title, imagery, and body copy sync to the public site when published."
    >
      <BackButton to="/admin/playground" label="Back to Playground" className="mb-8" />

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-8 rounded-3xl border border-black/5 bg-white p-6 md:p-10 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="title">
                Title
              </label>
              <input
                id="title"
                required
                className={adminFieldClass}
                value={input.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setInput((prev) => ({
                    ...prev,
                    title,
                    slug: slugTouched ? prev.slug : slugify(title)
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="slug">
                URL slug
              </label>
              <input
                id="slug"
                required
                className={adminFieldClass}
                value={input.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setInput({ ...input, slug: e.target.value });
                }}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className={adminFieldClass}
                value={input.category}
                onChange={(e) =>
                  setInput({ ...input, category: e.target.value as PlaygroundCategory })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="author">
                Author
              </label>
              <input
                id="author"
                required
                className={adminFieldClass}
                value={input.author}
                onChange={(e) => setInput({ ...input, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="author_role">
                Author role
              </label>
              <input
                id="author_role"
                className={adminFieldClass}
                value={input.author_role}
                onChange={(e) => setInput({ ...input, author_role: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="image_url">
                Cover image URL
              </label>
              <input
                id="image_url"
                required
                type="url"
                className={adminFieldClass}
                value={input.image_url}
                onChange={(e) => setInput({ ...input, image_url: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="excerpt">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                required
                rows={2}
                className={adminFieldClass}
                value={input.excerpt}
                onChange={(e) => setInput({ ...input, excerpt: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="body">
                Body (paragraphs separated by blank lines)
              </label>
              <textarea
                id="body"
                required
                rows={12}
                className={`${adminFieldClass} font-mono text-[13px] leading-relaxed`}
                value={input.body}
                onChange={(e) => setInput({ ...input, body: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className={adminFieldClass}
                value={input.status}
                onChange={(e) =>
                  setInput({ ...input, status: e.target.value as PlaygroundPostInput['status'] })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="sort_order">
                Sort order
              </label>
              <input
                id="sort_order"
                type="number"
                className={adminFieldClass}
                value={input.sort_order}
                onChange={(e) => setInput({ ...input, sort_order: Number(e.target.value) })}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className={`${adminPrimaryBtn} disabled:opacity-60`}>
            <Save size={16} />
            {saving ? 'Saving…' : 'Save post'}
          </button>
        </form>
      )}
    </AdminLayout>
  );
};
