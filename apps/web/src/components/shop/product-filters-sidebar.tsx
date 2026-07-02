'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import {
  AGE_FILTER_OPTIONS,
  type AgeFilter,
  type ProductSort,
} from '@/lib/product/filters';
import type { StrapiCategory } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

type ProductFiltersSidebarProps = {
  categories: StrapiCategory[];
  selectedCategoryId: string | null;
  selectedSort: ProductSort;
  selectedAgeFilter: AgeFilter;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSort: (sort: ProductSort) => void;
  onSelectAgeFilter: (filter: AgeFilter) => void;
};

const SORT_OPTIONS: Exclude<ProductSort, null>[] = ['top_sellers', 'most_viewed'];

export function ProductFiltersSidebar({
  categories,
  selectedCategoryId,
  selectedSort,
  selectedAgeFilter,
  onSelectCategory,
  onSelectSort,
  onSelectAgeFilter,
}: ProductFiltersSidebarProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);

  function getSortLabel(sort: Exclude<ProductSort, null>): string {
    return sort === 'top_sellers' ? t.products.topSellers : t.products.mostViewed;
  }

  function getAgeLabel(filter: Exclude<AgeFilter, null>): string {
    const labels: Record<Exclude<AgeFilter, null>, string> = {
      '0-1': t.products.age0to1,
      '1-2': t.products.age1to2,
      '2-3': t.products.age2to3,
      '3-4': t.products.age3to4,
      '4-6': t.products.age4to6,
      '6+': t.products.ageAbove6,
    };

    return labels[filter];
  }

  return (
    <aside
      aria-label={t.products.filtersTitle}
      className="rounded-xl border border-neutral-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start"
    >
      <div className="border-b border-neutral-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
          {t.products.filtersTitle}
        </h2>
      </div>

      <div className="max-h-[min(70vh,560px)] overflow-y-auto px-3 py-3">
        <FilterSection title={t.products.sortTitle}>
          <ul className="space-y-1">
            {SORT_OPTIONS.map((sort) => (
              <li key={sort}>
                <FilterOption
                  label={getSortLabel(sort)}
                  selected={selectedSort === sort}
                  onClick={() =>
                    onSelectSort(selectedSort === sort ? null : sort)
                  }
                />
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection title={t.products.ageTitle}>
          <ul className="space-y-1">
            {AGE_FILTER_OPTIONS.map((filter) => (
              <li key={filter}>
                <FilterOption
                  label={getAgeLabel(filter)}
                  selected={selectedAgeFilter === filter}
                  onClick={() =>
                    onSelectAgeFilter(
                      selectedAgeFilter === filter ? null : filter,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection title={t.category.title}>
          <ul className="space-y-1">
            {categories.map((category) => {
              const label =
                locale === 'ar' ? category.title_ar : category.title;

              return (
                <li key={category.documentId}>
                  <FilterOption
                    label={label}
                    selected={selectedCategoryId === category.documentId}
                    onClick={() =>
                      onSelectCategory(
                        selectedCategoryId === category.documentId
                          ? null
                          : category.documentId,
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FilterOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-lg px-3 py-2 text-start text-sm transition-colors ${
        selected
          ? 'bg-neutral-900 font-medium text-white'
          : 'text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {label}
    </button>
  );
}
