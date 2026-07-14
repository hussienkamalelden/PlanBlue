import Fuse, { type IFuseOptions } from 'fuse.js';

type SearchableProduct = {
  title?: string | null;
  title_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  sku?: string | null;
};

const FUSE_OPTIONS: IFuseOptions<SearchableProduct> = {
  keys: [
    { name: 'title', weight: 0.35 },
    { name: 'title_ar', weight: 0.35 },
    { name: 'sku', weight: 0.15 },
    { name: 'description', weight: 0.075 },
    { name: 'description_ar', weight: 0.075 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
  distance: 100,
};

export function fuzzySearchProducts<T extends SearchableProduct>(
  products: T[],
  query: string,
): T[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return products;
  }

  const fuse = new Fuse(products, FUSE_OPTIONS);
  return fuse.search(trimmed).map((result) => result.item);
}
