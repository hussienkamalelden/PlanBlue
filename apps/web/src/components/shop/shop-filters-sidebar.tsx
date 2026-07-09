'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { PriceRangeSlider } from '@/components/shop/price-range-slider';
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
  priceBounds: { min: number; max: number };
  priceMin: number;
  priceMax: number;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectAgeFilter: (filter: AgeFilter) => void;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  onPriceReset: () => void;
};

export function ShopFiltersSidebar({
  categories,
  selectedCategoryId,
  selectedAgeFilter,
  priceBounds,
  priceMin,
  priceMax,
  onSelectCategory,
  onSelectAgeFilter,
  onPriceMinChange,
  onPriceMaxChange,
  onPriceReset,
}: ShopFiltersSidebarProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    router.push(`/shop?search=${encodeURIComponent(query)}`);
  }

  return (
    <aside
      aria-label={t.shop.filtersTitle}
      className="pb-shop-sidebar lg:sticky lg:top-6 lg:self-start"
    >
      <div className="pb-shop-sidebar-widget">
        <section className="pb-shop-sidebar-section pb-shop-sidebar-section--search">
          <form onSubmit={handleSearchSubmit}>
            <div className="pb-shop-sidebar-search__group">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t.header.searchPlaceholder}
                aria-label={t.header.searchPlaceholder}
              />
              <button type="submit" aria-label={t.header.searchPlaceholder}>
                <i className="icon-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>

        {priceBounds.max > 0 && (
          <>
            <hr className="pb-shop-sidebar-separator" />
            <section className="pb-shop-sidebar-section">
              <div className="pb-shop-sidebar-widget__title">
                <h4>{t.shop.priceTitle}</h4>
              </div>
              <div dir="ltr" className="pb-shop-price-filter">
                <PriceRangeSlider
                  bounds={priceBounds}
                  min={priceMin}
                  max={priceMax}
                  locale={locale}
                  fromLabel={t.shop.priceFrom}
                  toLabel={t.shop.priceTo}
                  resetLabel={t.shop.priceReset}
                  onMinChange={onPriceMinChange}
                  onMaxChange={onPriceMaxChange}
                  onReset={onPriceReset}
                />
              </div>
            </section>
          </>
        )}

        <hr className="pb-shop-sidebar-separator" />

        <section className="pb-shop-sidebar-section">
          <div className="pb-shop-sidebar-widget__title">
            <h4>{t.shop.ageTitle}</h4>
          </div>
          <ul className="pb-shop-sidebar-list">
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
        </section>

        <hr className="pb-shop-sidebar-separator" />

        <section className="pb-shop-sidebar-section">
          <div className="pb-shop-sidebar-widget__title">
            <h3>{t.category.title}</h3>
          </div>
          <div className="pb-shop-sidebar-list-scroll">
            <ul className="pb-shop-sidebar-list">
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
          </div>
        </section>
      </div>
    </aside>
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
      className={`pb-shop-sidebar-option${selected ? ' is-selected' : ''}`}
    >
      {label}
    </button>
  );
}
