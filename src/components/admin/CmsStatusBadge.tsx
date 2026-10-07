import type { CmsStatus } from '../../types/cms';
import { cn } from '../../lib/utils';

export const CmsStatusBadge = ({ status }: { status: CmsStatus }) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest',
      status === 'published' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-neutral-100 text-gray-600'
    )}
  >
    {status}
  </span>
);
