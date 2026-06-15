import {
  Image,
  Type,
  LayoutGrid,
  CirclePlay,
  Code2
} from 'lucide-react';
import type { CaseStudyBlockType } from '../../../types/case-study';
import { BLOCK_TYPE_LABELS } from '../../../types/case-study';

const ITEMS: { type: CaseStudyBlockType; icon: typeof Image }[] = [
  { type: 'image', icon: Image },
  { type: 'text', icon: Type },
  { type: 'photo_grid', icon: LayoutGrid },
  { type: 'video', icon: CirclePlay },
  { type: 'embed', icon: Code2 }
];

export const InsertMediaBar = ({
  onInsert,
  compact = false
}: {
  onInsert: (type: CaseStudyBlockType) => void;
  compact?: boolean;
}) => (
  <div
    className={
      compact
        ? 'inline-flex items-center gap-1 rounded-full bg-brand-black px-3 py-2 text-white shadow-xl'
        : 'mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-brand-black px-4 py-3 text-white shadow-xl'
    }
  >
    <span className="px-2 text-xs font-medium text-white/70 whitespace-nowrap">Insert Media:</span>
    {ITEMS.map(({ type, icon: Icon }) => (
      <button
        key={type}
        type="button"
        title={BLOCK_TYPE_LABELS[type]}
        onClick={() => onInsert(type)}
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
      >
        <Icon size={16} strokeWidth={1.75} />
      </button>
    ))}
  </div>
);

export const AddContentGrid = ({
  onInsert
}: {
  onInsert: (type: CaseStudyBlockType) => void;
}) => (
  <div className="grid grid-cols-2 gap-2">
    {ITEMS.map(({ type, icon: Icon }) => (
      <button
        key={type}
        type="button"
        onClick={() => onInsert(type)}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-4 text-xs font-medium hover:border-brand-orange hover:text-brand-orange transition-colors"
      >
        <Icon size={18} strokeWidth={1.75} />
        {BLOCK_TYPE_LABELS[type]}
      </button>
    ))}
  </div>
);
