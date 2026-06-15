import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { CaseStudyBlock, CaseStudyBlockType, CaseStudyMediaItem, CaseStudyTextPayload } from '../../../types/case-study';
import { BentoPhotoGrid } from '../../case-study/BentoPhotoGrid';
import { CASE_STUDY_SHELL } from '../../case-study/caseStudyLayout';
import { CaseStudyBlockView } from '../../case-study/CaseStudyBlockView';
import { CaseStudyMediaImage } from '../../case-study/CaseStudyMediaImage';
import { TextBlockControls } from './TextBlockControls';
import { uploadCaseStudyMedia } from '../../../lib/case-study-admin';

export const EditorBlock = ({
  block,
  caseStudyId,
  onChange,
  onRemove
}: {
  block: CaseStudyBlock;
  caseStudyId: string;
  onChange: (payload: CaseStudyBlock['payload']) => void;
  onRemove: () => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadCaseStudyMedia(file, caseStudyId);
      onChange({
        ...block.payload,
        url: result.url,
        r2Key: result.r2Key,
        width: result.width,
        height: result.height
      });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const uploadGridFiles = async (files: File[]) => {
    setUploading(true);
    setUploadError(null);
    try {
      const items: CaseStudyMediaItem[] = [
        ...((block.payload as { items?: CaseStudyMediaItem[] }).items ?? [])
      ];
      for (const file of files) {
        const result = await uploadCaseStudyMedia(file, caseStudyId);
        items.push({
          url: result.url,
          r2Key: result.r2Key,
          width: result.width,
          height: result.height
        });
      }
      onChange({ ...block.payload, items });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group relative rounded-2xl ring-1 ring-black/10 bg-white overflow-hidden">
      <div className="absolute right-3 top-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full bg-white/90 p-2 shadow ring-1 ring-black/10 hover:text-red-500"
          aria-label="Remove section"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="pointer-events-none bg-[#fafafa] py-6">
        <div className={CASE_STUDY_SHELL}>
          <CaseStudyBlockView block={block} />
        </div>
      </div>

      <div className="border-t border-black/10 p-4 bg-[#fafafa] space-y-3">
        {block.block_type === 'text' ? (
          <div className="space-y-3">
            <TextBlockControls
              payload={block.payload as CaseStudyTextPayload}
              onChange={(payload) => onChange(payload)}
            />
            <textarea
              value={(block.payload as CaseStudyTextPayload).body ?? ''}
              onChange={(e) =>
                onChange({
                  ...(block.payload as CaseStudyTextPayload),
                  body: e.target.value
                })
              }
              rows={5}
              placeholder="Write your case study copy…"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-orange"
            />
          </div>
        ) : null}

        {(block.block_type === 'image' || block.block_type === 'video') && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept={block.block_type === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file);
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-brand-black text-white px-4 py-2 text-sm font-medium hover:bg-brand-orange disabled:opacity-60"
              >
                <Upload size={14} />
                {uploading ? 'Uploading…' : 'Upload media'}
              </button>
              <input
                type="url"
                value={(block.payload as { url?: string }).url ?? ''}
                onChange={(e) => onChange({ ...block.payload, url: e.target.value })}
                placeholder="Or paste media URL"
                className="flex-1 min-w-[12rem] rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-brand-orange"
              />
            </div>
            <p className="text-xs text-gray-400">
              Upload PNG or JPEG at least 1920px wide for sharpest results on the live page.
            </p>
            {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
          </div>
        )}

        {block.block_type === 'embed' ? (
          <input
            type="url"
            value={(block.payload as { embedUrl?: string }).embedUrl ?? ''}
            onChange={(e) => onChange({ ...block.payload, embedUrl: e.target.value, aspectRatio: '16/9' })}
            placeholder="Embed URL (Figma, Vimeo, etc.)"
            className="w-full rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-brand-orange"
          />
        ) : null}

        {block.block_type === 'photo_grid' ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Upload images — layout auto-arranges into a bento grid based on image count and size.
            </p>
            {((block.payload as { items?: CaseStudyMediaItem[] }).items ?? []).length > 0 ? (
              <BentoPhotoGrid items={(block.payload as { items?: CaseStudyMediaItem[] }).items ?? []} />
            ) : null}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                if (files.length) void uploadGridFiles(files);
              }}
              className="block w-full text-sm disabled:opacity-60"
            />
            {uploading ? <p className="text-xs text-gray-500">Uploading…</p> : null}
            {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export type DraftBlock = {
  localId: string;
  block_type: CaseStudyBlockType;
  payload: CaseStudyBlock['payload'];
  sort_order: number;
};

export const draftToSaveRows = (blocks: DraftBlock[]) =>
  blocks.map((b, i) => ({
    block_type: b.block_type,
    payload: b.payload,
    sort_order: i
  }));
