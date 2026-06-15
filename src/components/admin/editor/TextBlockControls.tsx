import { AlignCenter, AlignLeft, AlignRight, Bold, Underline } from 'lucide-react';
import type { CaseStudyTextPayload, CaseStudyTextAlign, CaseStudyTextSize } from '../../../types/case-study';
import { cn } from '../../../lib/utils';
import { isTextBlockBold } from '../../case-study/textBlockStyles';

const SIZE_OPTIONS: { value: CaseStudyTextSize; label: string }[] = [
  { value: 'display', label: 'Display' },
  { value: 'heading', label: 'Heading' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'body', label: 'Body' },
  { value: 'small', label: 'Small' }
];

const ALIGN_OPTIONS: { value: CaseStudyTextAlign; icon: typeof AlignLeft; label: string }[] = [
  { value: 'left', icon: AlignLeft, label: 'Left' },
  { value: 'center', icon: AlignCenter, label: 'Center' },
  { value: 'right', icon: AlignRight, label: 'Right' }
];

export const TextBlockControls = ({
  payload,
  onChange
}: {
  payload: CaseStudyTextPayload;
  onChange: (payload: CaseStudyTextPayload) => void;
}) => {
  const update = (patch: Partial<CaseStudyTextPayload>) =>
    onChange({ ...payload, ...patch });

  const isBold = isTextBlockBold(payload);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">Position</span>
        {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => update({ align: value })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              (payload.align ?? 'left') === value
                ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                : 'border-black/10 bg-white text-gray-600 hover:border-black/20'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-400">
          Size
          <select
            value={payload.size ?? 'body'}
            onChange={(e) => update({ size: e.target.value as CaseStudyTextSize })}
            className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-brand-black outline-none focus:border-brand-orange"
          >
            {SIZE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-400">
          Width
          <select
            value={payload.layout ?? 'full'}
            onChange={(e) =>
              update({ layout: e.target.value as CaseStudyTextPayload['layout'] })
            }
            className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm text-brand-black outline-none focus:border-brand-orange"
          >
            <option value="full">Full</option>
            <option value="narrow">Narrow</option>
          </select>
        </label>

        <button
          type="button"
          aria-pressed={isBold}
          onClick={() => update({ bold: !isBold })}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            isBold
              ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
              : 'border-black/10 bg-white text-gray-600 hover:border-black/20'
          )}
        >
          <Bold size={14} />
          Bold
        </button>

        <button
          type="button"
          aria-pressed={Boolean(payload.underline)}
          onClick={() => update({ underline: !payload.underline })}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            payload.underline
              ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
              : 'border-black/10 bg-white text-gray-600 hover:border-black/20'
          )}
        >
          <Underline size={14} />
          Underline
        </button>
      </div>
    </div>
  );
};
