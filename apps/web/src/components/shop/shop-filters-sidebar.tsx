'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import {
  AGE_FILTER_OPTIONS,
  type AgeFilter,
} from '@/lib/shop/filters';
import type { StrapiCategory } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

type ShopFiltersSidebarProps = {
  categories: StrapiCategory[];
  selectedCategoryId: string | null;
  selectedAgeFilter: AgeFilter;
  priceMin?: number;
  priceMax?: number;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectAgeFilter: (filter: AgeFilter) => void;
  onPriceMinChange: (value: number | undefined) => void;
  onPriceMaxChange: (value: number | undefined) => void;
};

export function ShopFiltersSidebar({
  categories,
  selectedCategoryId,
  selectedAgeFilter,
  priceMin,
  priceMax,
  onSelectCategory,
  onSelectAgeFilter,
  onPriceMinChange,
  onPriceMaxChange,
}: ShopFiltersSidebarProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);

  function getAgeLabel(filter: Exclude<AgeFilter, null>): string {
    const labels: Record<Exclude<AgeFilter, null>, string> = {
      '0-1': t.shop.age0to1,
      '1-2': t.shop.age1to2,
      '2-3': t.shop.age2to3,
      '3-4': t.shop.age3to4,
      '4-6': t.shop.age4to6,
      '6+': t.shop.ageAbove6,
    };

    return labels[filter];
  }

  return (
    <aside
      aria-label={t.shop.filtersTitle}
      className="rounded-xl border border-neutral-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start"
    >
      <div className="border-b border-neutral-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
          {t.shop.filtersTitle}
        </h2>
      </div>

      <div className="max-h-[min(70vh,560px)] overflow-y-auto px-3 py-3">
        <FilterSection title={t.category.title}>
          <ul className="space-y-1">
            {categories.map((category) => {
              const label = locale === 'ar' ? category.title_ar : category.title;
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

        <FilterSection title={t.shop.ageTitle}>
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

        <FilterSection title={t.shop.priceTitle}>
          <div className="space-y-3 px-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">{t.shop.priceFrom}</label>
              <input
                type="number"
                min={0}
                value={priceMin ?? ''}
                onChange={(e) => onPriceMinChange(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-700 focus:border-brand-primary focus:outline-none"
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">{t.shop.priceTo}</label>
              <input
                type="number"
                min={0}
                value={priceMax ?? ''}
                onChange={(e) => onPriceMaxChange(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-700 focus:border-brand-primary focus:outline-none"
                placeholder="∞"
              />
            </div>
            {(priceMin !== undefined || priceMax !== undefined) && (
              <button
                type="button"
                onClick={() => { onPriceMinChange(undefined); onPriceMaxChange(undefined); }}
                className="text-xs font-medium text-brand-primary hover:underline"
              >
                {t.shop.priceReset}
              </button>
            )}
          </div>
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
