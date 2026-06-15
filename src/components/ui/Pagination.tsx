import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PAGE_SIZE = 10;

export interface PaginationProps {
  limit?: number;
  offset: number;
  total: number;
  onChange: (offset: number) => void;
  className?: string;
}

export const Pagination = ({
  limit = PAGE_SIZE,
  offset,
  total,
  onChange,
  className
}: PaginationProps) => {
  if (total <= limit) return null;

  const pageCount = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit);
  const from = offset + 1;
  const to = Math.min(offset + limit, total);

  const pages = Array.from({ length: pageCount }, (_, index) => index);

  return (
    <nav
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
      aria-label="Pagination"
    >
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-brand-black">{from}</span>–
        <span className="font-medium text-brand-black">{to}</span> of{' '}
        <span className="font-medium text-brand-black">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
          className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-brand-orange hover:text-brand-orange disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onChange(page * limit)}
              className={cn(
                'min-w-9 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-brand-black text-white'
                  : 'text-gray-600 hover:bg-neutral-100 hover:text-brand-black'
              )}
            >
              {page + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={offset + limit >= total}
          onClick={() => onChange(offset + limit)}
          className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-brand-orange hover:text-brand-orange disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export const paginate = <T,>(items: readonly T[], offset: number, limit = PAGE_SIZE) =>
  items.slice(offset, offset + limit);
