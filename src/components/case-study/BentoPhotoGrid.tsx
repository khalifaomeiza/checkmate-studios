import type { CaseStudyMediaItem } from '../../types/case-study';
import { buildBentoGrid } from './bentoGridLayout';

export const BentoPhotoGrid = ({ items }: { items: CaseStudyMediaItem[] }) => {
  const cells = buildBentoGrid(items);
  if (cells.length === 0) return null;

  return (
    <div className="grid grid-cols-12 auto-rows-[minmax(9rem,auto)] gap-3 md:gap-4">
      {cells.map((cell, index) => (
        <div
          key={`${cell.item.url}-${index}`}
          className="relative min-h-[9rem] overflow-hidden rounded-xl bg-[#ececec]"
          style={{
            gridColumn: `span ${cell.colSpan} / span ${cell.colSpan}`,
            gridRow: `span ${cell.rowSpan} / span ${cell.rowSpan}`
          }}
        >
          <img
            src={cell.item.url}
            alt={cell.item.alt ?? ''}
            width={cell.item.width}
            height={cell.item.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};
