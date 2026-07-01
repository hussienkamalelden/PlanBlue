'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import type { ProductSort } from '@/lib/product/filters';

type ProductSortNavProps = {
  selectedSort: ProductSort;
  onSelectSort: (sort: ProductSort) => void;
};

const SORT_OPTIONS: ProductSort[] = ['top_sellers', 'most_viewed'];

export function ProductSortNav({
  selectedSort,
  onSelectSort,
}: ProductSortNavProps) {
  const t = useTranslations();

  function getLabel(sort: Exclude<ProductSort, null>): string {
    if (sort === 'top_sellers') {
      return t.products.topSellers;
    }

    return t.products.mostViewed;
  }

  function handleSelect(sort: Exclude<ProductSort, null>) {
    onSelectSort(selectedSort === sort ? null : sort);
  }

  return (
    <section aria-label={t.products.sortTitle}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {t.products.sortTitle}
      </h2>

      <ul className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((sort) => (
          <li key={sort}>
            <button
              type="button"
              onClick={() => handleSelect(sort)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedSort === sort
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {getLabel(sort)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
