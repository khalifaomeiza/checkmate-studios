import { useEffect, useState } from 'react';
import { WORKS, type Work } from '../data/works';
import { featuredFirst, loadWorksCatalog } from '../lib/works-catalog';

/** Public works list — static portfolio merged with published CMS case studies. */
export const useWorksCatalog = () => {
  const [works, setWorks] = useState<Work[]>(() => [...WORKS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void loadWorksCatalog()
      .then((rows) => {
        if (!cancelled) setWorks(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    works,
    loading,
    featuredWorks: featuredFirst(works)
  };
};
