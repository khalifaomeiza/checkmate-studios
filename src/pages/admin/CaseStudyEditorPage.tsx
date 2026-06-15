import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Eye, Upload, Trash2 } from 'lucide-react';
import { fetchCaseStudyByIdForEditor } from '../../lib/case-studies';
import {
  createDraftCaseStudy,
  deleteCaseStudy,
  openOrCreateCaseStudyForWork,
  replaceCaseStudyBlocks,
  uploadCaseStudyMedia,
  upsertCaseStudy
} from '../../lib/case-study-admin';
import { WORK_CATEGORIES } from '../../data/works';
import type { CaseStudy, CaseStudyBlockType, CaseStudyStatus } from '../../types/case-study';
import { emptyBlockPayload } from '../../types/case-study';
import { CaseStudyMediaImage } from '../../components/case-study/CaseStudyMediaImage';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { BackButton } from '../../components/ui/BackButton';
import { AddContentGrid, InsertMediaBar } from '../../components/admin/editor/InsertMediaBar';
import { draftToSaveRows, EditorBlock, type DraftBlock } from '../../components/admin/editor/EditorBlock';
import { parseTagsInput } from '../../lib/parseTagsInput';

const newLocalId = () => crypto.randomUUID();

const NEW_EDITOR_PATH = '/admin/works/new';

const blocksFromStudy = (row: CaseStudy): DraftBlock[] =>
  (row.blocks ?? []).map((b, i) => ({
    localId: b.id,
    block_type: b.block_type,
    payload: b.payload,
    sort_order: i
  }));

export const CaseStudyEditorPage = () => {
  const location = useLocation();
  const { id: editId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const isNew =
    location.pathname === NEW_EDITOR_PATH || location.pathname.endsWith(`${NEW_EDITOR_PATH}/`);
  const presetSlug = search.get('slug') ?? '';

  const [study, setStudy] = useState<Partial<CaseStudy>>({});
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const loadedStudyIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isNew) {
      let cancelled = false;
      setLoading(true);
      setLoadError(null);

      const create = presetSlug
        ? openOrCreateCaseStudyForWork(presetSlug)
        : createDraftCaseStudy();

      void create
        .then((draft) => {
          if (cancelled) return;
          navigate(`/admin/works/edit/${draft.id}`, { replace: true });
        })
        .catch((e) => {
          if (!cancelled) {
            setLoadError(e instanceof Error ? e.message : 'Could not open editor.');
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    if (!editId) {
      setLoading(false);
      setLoadError('Case study not found.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void fetchCaseStudyByIdForEditor(editId)
      .then((row) => {
        if (cancelled) return;
        if (row) {
          setStudy(row);
          setBlocks(blocksFromStudy(row));
          return;
        }
        setLoadError('Case study not found.');
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load editor.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNew, editId, presetSlug, navigate]);

  useEffect(() => {
    if (!study.id || study.id === loadedStudyIdRef.current) return;
    loadedStudyIdRef.current = study.id;
    setTagsInput((study.tags ?? []).join(', '));
  }, [study.id]);

  const commitTags = () => {
    setStudy((s) => ({ ...s, tags: parseTagsInput(tagsInput) }));
  };

  const insertBlock = useCallback((type: CaseStudyBlockType, atIndex: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(atIndex, 0, {
        localId: newLocalId(),
        block_type: type,
        payload: emptyBlockPayload(type),
        sort_order: atIndex
      });
      return next;
    });
  }, []);

  const updateBlock = (localId: string, payload: DraftBlock['payload']) => {
    setBlocks((prev) => prev.map((b) => (b.localId === localId ? { ...b, payload } : b)));
  };

  const removeBlock = (localId: string) => {
    setBlocks((prev) => prev.filter((b) => b.localId !== localId));
  };

  const uploadCover = async (file: File) => {
    if (!study.id) return;
    setCoverUploading(true);
    setMessage(null);
    try {
      const result = await uploadCaseStudyMedia(file, study.id);
      setStudy((s) => ({
        ...s,
        cover_url: result.url,
        cover_width: result.width ?? null,
        cover_height: result.height ?? null
      }));
      setMessage('Cover image updated.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Cover upload failed.');
    } finally {
      setCoverUploading(false);
      if (coverFileRef.current) coverFileRef.current.value = '';
    }
  };

  const removeProject = async () => {
    if (!study.id) return;

    setDeleting(true);
    setMessage(null);
    try {
      await deleteCaseStudy(study.id);
      navigate('/admin/works', { replace: true });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Delete failed.');
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const save = async (status: CaseStudyStatus) => {
    if (!study.id) {
      setMessage('Project is still being created — try again in a moment.');
      return;
    }
    if (!study.title?.trim()) {
      setMessage('Title is required.');
      return;
    }
    if (status === 'published' && !study.slug?.trim()) {
      setMessage('Set a slug before publishing — it becomes the public URL.');
      return;
    }

    setSaving(true);
    setMessage(null);
    const tags = parseTagsInput(tagsInput);
    try {
      const saved = await upsertCaseStudy({
        ...(study as CaseStudy),
        title: study.title.trim(),
        tags,
        status
      });
      const savedBlocks = await replaceCaseStudyBlocks(saved.id, draftToSaveRows(blocks));
      setStudy({ ...saved, blocks: savedBlocks });
      setTagsInput((saved.tags ?? []).join(', '));
      setBlocks(
        savedBlocks.map((b, i) => ({
          localId: b.id,
          block_type: b.block_type,
          payload: b.payload,
          sort_order: i
        }))
      );
      setMessage(status === 'published' ? 'Published.' : 'Draft saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
        <p>{isNew ? 'Opening editor…' : 'Loading editor…'}</p>
        <p className="text-xs text-gray-400">This should only take a moment.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-500">{loadError}</p>
        <BackButton to="/admin/works" label="Back to Works" />
      </div>
    );
  }

  const publicPath = study.slug ? `/works/${study.slug}` : null;
  const deleteLabel = study.slug ?? study.title ?? 'this project';

  return (
    <div className="min-h-screen bg-[#ececec]">
      <ConfirmModal
        open={deleteOpen}
        title={`Delete “${deleteLabel}”?`}
        description="This removes the case study and all uploaded images. This cannot be undone."
        confirmLabel="Delete project"
        destructive
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        onConfirm={() => void removeProject()}
      />
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-4 min-w-0">
            <BackButton to="/admin/works" label="Back to Works" className="shrink-0" />
            <input
              value={study.title ?? ''}
              onChange={(e) => setStudy((s) => ({ ...s, title: e.target.value }))}
              placeholder="Project title"
              className="min-w-0 flex-1 bg-transparent text-lg font-medium outline-none"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-xs text-gray-400 capitalize">{study.status}</span>
            {study.status === 'published' && publicPath ? (
              <Link
                to={publicPath}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand-orange"
              >
                <Eye size={14} />
                Preview
              </Link>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={() => void save('draft')}
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:border-brand-orange disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save('published')}
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <Save size={14} />
              Publish
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px] md:px-8">
        <div className="min-w-0">
          <div className="mb-8 rounded-2xl bg-white p-6 ring-1 ring-black/10 space-y-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Project details</h2>
            <p className="text-xs text-gray-400 font-mono truncate">ID: {study.id}</p>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">Cover image</p>
              {study.cover_url ? (
                <CaseStudyMediaImage
                  src={study.cover_url}
                  alt=""
                  width={study.cover_width ?? undefined}
                  height={study.cover_height ?? undefined}
                  className="rounded-xl ring-1 ring-black/10"
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-black/15 bg-[#fafafa] text-sm text-gray-400">
                  No cover image
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={coverUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadCover(file);
                  }}
                />
                <button
                  type="button"
                  disabled={coverUploading}
                  onClick={() => coverFileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-black text-white px-4 py-2 text-sm font-medium hover:bg-brand-orange disabled:opacity-60"
                >
                  <Upload size={14} />
                  {coverUploading ? 'Uploading…' : 'Upload cover'}
                </button>
                <p className="w-full text-xs text-gray-400">
                  Recommended: 1920×1080 or wider — files are stored at full resolution.
                </p>
                <input
                  type="url"
                  value={study.cover_url ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, cover_url: e.target.value || null }))}
                  placeholder="Or paste cover URL"
                  className="flex-1 min-w-[12rem] rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block text-xs text-gray-500">
                Slug (public URL — required to publish)
                <input
                  value={study.slug ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, slug: e.target.value || null }))}
                  placeholder="e.g. dellioo"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              <label className="block text-xs text-gray-500">
                Client
                <input
                  value={study.client ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, client: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              <label className="block text-xs text-gray-500">
                Year
                <input
                  value={study.year ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, year: e.target.value }))}
                  placeholder="2025"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              <label className="block text-xs text-gray-500">
                Category
                <select
                  value={study.category ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, category: e.target.value || null }))}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange bg-white"
                >
                  <option value="">Select category</option>
                  {WORK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-gray-500 md:col-span-2">
                Subtitle
                <input
                  value={study.subtitle ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, subtitle: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              <label className="block text-xs text-gray-500 md:col-span-2">
                Tags (comma-separated)
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onBlur={commitTags}
                  placeholder="Female Focused, Branding, Website"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                />
                <span className="mt-1 block text-[11px] text-gray-400">
                  Separate tags with commas — spaces inside a tag are allowed.
                </span>
              </label>
              <label className="block text-xs text-gray-500 md:col-span-2">
                External link (optional)
                <input
                  type="url"
                  value={study.external_url ?? ''}
                  onChange={(e) => setStudy((s) => ({ ...s, external_url: e.target.value || null }))}
                  placeholder="https://…"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(study.featured)}
                  onChange={(e) => setStudy((s) => ({ ...s, featured: e.target.checked }))}
                  className="rounded border-black/20"
                />
                Featured on home page
              </label>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <InsertMediaBar onInsert={(type) => insertBlock(type, 0)} />
          </div>

          <div className="space-y-8">
            {blocks.map((block, index) => (
              <div key={block.localId} className="space-y-6">
                <EditorBlock
                  block={{
                    id: block.localId,
                    case_study_id: study.id ?? '',
                    sort_order: index,
                    block_type: block.block_type,
                    payload: block.payload
                  }}
                  caseStudyId={study.id ?? ''}
                  onChange={(payload) => updateBlock(block.localId, payload)}
                  onRemove={() => removeBlock(block.localId)}
                />
                <div className="relative py-4">
                  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-sky-400/70" />
                  <div className="relative flex justify-center">
                    <InsertMediaBar compact onInsert={(type) => insertBlock(type, index + 1)} />
                  </div>
                </div>
              </div>
            ))}

            {blocks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-black/15 bg-white py-24 text-center">
                <p className="text-gray-500 mb-6">Start building your case study</p>
                <InsertMediaBar onInsert={(type) => insertBlock(type, 0)} />
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/10">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-4">
              Add content
            </h3>
            <AddContentGrid onInsert={(type) => insertBlock(type, blocks.length)} />
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/10 space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Publish
            </h3>
            <p className="text-sm text-gray-500">
              All fields above are saved with your draft. Set a slug to publish at{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">
                /works/{study.slug || 'your-slug'}
              </code>
            </p>
            {message ? <p className="text-sm text-brand-orange">{message}</p> : null}
            <button
              type="button"
              disabled={deleting || !study.id}
              onClick={() => setDeleteOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting…' : 'Delete project'}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};
