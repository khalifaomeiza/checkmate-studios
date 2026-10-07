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
import { createCareerJob, fetchCareerJobById, updateCareerJob } from '../../lib/careers-cms';
import { slugify } from '../../lib/playground-cms';
import { toast } from '../../lib/toast';
import type { CareerJobInput } from '../../types/cms';

const linesToArray = (text: string) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

const arrayToLines = (items: string[]) => items.join('\n');

const emptyInput = (): CareerJobInput => ({
  slug: '',
  title: '',
  category: 'Design',
  location: 'Remote',
  employment_type: 'Full-time',
  description: '',
  responsibilities: [],
  requirements: [],
  status: 'draft',
  sort_order: 0
});

export const AdminCareerJobEditorPage = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [input, setInput] = useState<CareerJobInput>(emptyInput);
  const [respText, setRespText] = useState('');
  const [reqText, setReqText] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    void fetchCareerJobById(id!)
      .then((row) => {
        if (!row) {
          toast.error('Role not found.');
          navigate('/admin/careers', { replace: true });
          return;
        }
        setInput({
          slug: row.slug,
          title: row.title,
          category: row.category,
          location: row.location,
          employment_type: row.employment_type,
          description: row.description,
          responsibilities: row.responsibilities,
          requirements: row.requirements,
          status: row.status,
          sort_order: row.sort_order,
          posted_at: row.posted_at
        });
        setRespText(arrayToLines(row.responsibilities));
        setReqText(arrayToLines(row.requirements));
        setSlugTouched(true);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not load role.'))
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CareerJobInput = {
        ...input,
        slug: slugify(input.slug || input.title),
        responsibilities: linesToArray(respText),
        requirements: linesToArray(reqText)
      };
      if (isNew) {
        const created = await createCareerJob(payload);
        toast.success('Role created.');
        navigate(`/admin/careers/edit/${created.id}`, { replace: true });
      } else {
        await updateCareerJob(id!, payload);
        toast.success('Role saved.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save role.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isNew ? 'New role' : 'Edit role'}
      description="Role details sync to the careers listing and application form when published."
    >
      <BackButton to="/admin/careers" label="Back to Careers" className="mb-8" />

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
                Job title
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
                Slug
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
              <input
                id="category"
                required
                className={adminFieldClass}
                value={input.category}
                onChange={(e) => setInput({ ...input, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="location">
                Location
              </label>
              <input
                id="location"
                required
                className={adminFieldClass}
                value={input.location}
                onChange={(e) => setInput({ ...input, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="employment_type">
                Employment type
              </label>
              <input
                id="employment_type"
                required
                className={adminFieldClass}
                value={input.employment_type}
                onChange={(e) => setInput({ ...input, employment_type: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={adminLabelClass} htmlFor="description">
                Short description
              </label>
              <textarea
                id="description"
                required
                rows={3}
                className={adminFieldClass}
                value={input.description}
                onChange={(e) => setInput({ ...input, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="responsibilities">
                Responsibilities (one per line)
              </label>
              <textarea
                id="responsibilities"
                required
                rows={8}
                className={adminFieldClass}
                value={respText}
                onChange={(e) => setRespText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className={adminLabelClass} htmlFor="requirements">
                Requirements (one per line)
              </label>
              <textarea
                id="requirements"
                required
                rows={8}
                className={adminFieldClass}
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
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
                  setInput({ ...input, status: e.target.value as CareerJobInput['status'] })
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
            {saving ? 'Saving…' : 'Save role'}
          </button>
        </form>
      )}
    </AdminLayout>
  );
};
