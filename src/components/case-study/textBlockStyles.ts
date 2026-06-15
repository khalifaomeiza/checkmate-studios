import type { CaseStudyTextPayload, CaseStudyTextSize } from '../../types/case-study';
import { cn } from '../../lib/utils';

const SIZE_CLASS: Record<CaseStudyTextSize, string> = {
  display: 'text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight',
  heading: 'text-2xl md:text-4xl leading-tight tracking-tight',
  subheading: 'text-xl md:text-2xl leading-snug',
  body: 'text-base md:text-lg leading-relaxed',
  small: 'text-sm leading-relaxed text-gray-500'
};

const DEFAULT_BOLD: Partial<Record<CaseStudyTextSize, boolean>> = {
  display: true,
  heading: true,
  subheading: true
};

export const isTextBlockBold = (payload: CaseStudyTextPayload) => {
  const size = payload.size ?? 'body';
  return payload.bold ?? DEFAULT_BOLD[size] ?? false;
};

export const textBlockContainerClass = (payload: CaseStudyTextPayload) =>
  cn(
    'py-2 md:py-4',
    payload.layout === 'narrow' ? 'max-w-2xl mx-auto' : 'w-full'
  );

export const textBlockContentClass = (payload: CaseStudyTextPayload) => {
  const size = payload.size ?? 'body';
  const align = payload.align ?? 'left';
  const isBold = isTextBlockBold(payload);

  return cn(
    'max-w-none whitespace-pre-wrap text-brand-black/85',
    SIZE_CLASS[size],
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',
    align === 'left' && 'text-left',
    isBold ? 'font-semibold' : 'font-normal',
    payload.underline && 'underline underline-offset-[0.2em] decoration-brand-black/40'
  );
};
