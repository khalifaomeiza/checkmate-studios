import type { CaseStudyMediaItem } from '../../types/case-study';

export interface BentoCell {
  item: CaseStudyMediaItem;
  colSpan: number;
  rowSpan: number;
}

interface CellTemplate {
  colSpan: number;
  rowSpan: number;
}

const TEMPLATES: Record<number, CellTemplate[]> = {
  1: [{ colSpan: 12, rowSpan: 2 }],
  2: [
    { colSpan: 6, rowSpan: 2 },
    { colSpan: 6, rowSpan: 2 }
  ],
  3: [
    { colSpan: 8, rowSpan: 2 },
    { colSpan: 4, rowSpan: 1 },
    { colSpan: 4, rowSpan: 1 }
  ],
  4: [
    { colSpan: 7, rowSpan: 2 },
    { colSpan: 5, rowSpan: 1 },
    { colSpan: 5, rowSpan: 1 },
    { colSpan: 12, rowSpan: 1 }
  ],
  5: [
    { colSpan: 7, rowSpan: 2 },
    { colSpan: 5, rowSpan: 1 },
    { colSpan: 5, rowSpan: 1 },
    { colSpan: 6, rowSpan: 1 },
    { colSpan: 6, rowSpan: 1 }
  ],
  6: [
    { colSpan: 6, rowSpan: 2 },
    { colSpan: 6, rowSpan: 1 },
    { colSpan: 6, rowSpan: 1 },
    { colSpan: 4, rowSpan: 1 },
    { colSpan: 4, rowSpan: 1 },
    { colSpan: 4, rowSpan: 1 }
  ]
};

const itemScore = (item: CaseStudyMediaItem) => {
  const width = item.width ?? 1200;
  const height = item.height ?? 800;
  return width * height;
};

const templateForCount = (count: number): CellTemplate[] => {
  if (TEMPLATES[count]) return TEMPLATES[count];
  return Array.from({ length: count }, () => ({ colSpan: 4, rowSpan: 1 }));
};

/** Assign images to bento cells — largest image gets the hero slot. */
export const buildBentoGrid = (items: CaseStudyMediaItem[]): BentoCell[] => {
  const urls = items.filter((item) => item.url);
  if (urls.length === 0) return [];

  const template = templateForCount(urls.length);
  const ranked = [...urls].sort((a, b) => itemScore(b) - itemScore(a));

  return template.map((cell, index) => ({
    item: ranked[index] ?? urls[index],
    colSpan: cell.colSpan,
    rowSpan: cell.rowSpan
  }));
};
