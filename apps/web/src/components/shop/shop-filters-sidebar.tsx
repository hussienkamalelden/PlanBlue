'use client';

import {
  Baby,
  CircleDot,
  LayoutGrid,
  Tag,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { type FormEvent } from 'react';

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
  selectedCategoryIds: string[];
  selectedAgeFilters: Exclude<AgeFilter, null>[];
  priceBounds: { min: number; max: number };
  priceMin: number;
  priceMax: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onToggleCategory: (categoryId: string) => void;
  onToggleAgeFilter: (filter: Exclude<AgeFilter, null>) => void;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  onPriceReset: () => void;
  variant?: 'sidebar' | 'drawer';
  className?: string;
};

export function ShopFiltersSidebar({
  categories,
  selectedCategoryIds,
  selectedAgeFilters,
  priceBounds,
  priceMin,
  priceMax,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onToggleCategory,
  onToggleAgeFilter,
  onPriceMinChange,
  onPriceMaxChange,
  onPriceReset,
  variant = 'sidebar',
  className,
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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <aside
      aria-label={t.shop.filtersTitle}
      className={`pb-shop-sidebar${
        variant === 'drawer' ? ' pb-shop-sidebar--drawer' : ''
      }${
        variant === 'sidebar' ? ' lg:sticky lg:top-6 lg:self-start' : ''
      }${className ? ` ${className}` : ''}`}
    >
      <div className="pb-shop-sidebar-widget">
        <section className="pb-shop-sidebar-section pb-shop-sidebar-section--search">
          <form onSubmit={handleSearchSubmit}>
            <div className="pb-shop-sidebar-search__group">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
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
              <SidebarSectionTitle icon={Wallet} title={t.shop.priceTitle} />
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
            </section>
          </>
        )}

        <hr className="pb-shop-sidebar-separator" />

        <section className="pb-shop-sidebar-section">
          <SidebarSectionTitle icon={Baby} title={t.shop.ageTitle} />
          <ul className="pb-shop-sidebar-list">
            {AGE_FILTER_OPTIONS.map((filter) => (
              <li key={filter}>
                <FilterOption
                  icon={CircleDot}
                  label={getAgeLabel(filter)}
                  selected={selectedAgeFilters.includes(filter)}
                  onClick={() => onToggleAgeFilter(filter)}
                />
              </li>
            ))}
          </ul>
        </section>

        <hr className="pb-shop-sidebar-separator" />

        <section className="pb-shop-sidebar-section">
          <SidebarSectionTitle icon={LayoutGrid} title={t.category.title} />
          <div className="pb-shop-sidebar-list-scroll">
            <ul className="pb-shop-sidebar-list">
              {categories.map((category) => {
                const label =
                  locale === 'ar' ? category.title_ar : category.title;

                return (
                  <li key={category.documentId}>
                    <FilterOption
                      icon={Tag}
                      label={label}
                      selected={selectedCategoryIds.includes(category.documentId)}
                      onClick={() => onToggleCategory(category.documentId)}
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

function SidebarSectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="pb-shop-sidebar-widget__title">
      <span className="pb-shop-sidebar-widget__title-icon" aria-hidden="true">
        <Icon className="size-5" strokeWidth={2.25} />
      </span>
      <h4>{title}</h4>
    </div>
  );
}

function FilterOption({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: LucideIcon;
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
      <span className="pb-shop-sidebar-option__icon" aria-hidden="true">
        <Icon className="size-4" strokeWidth={2.25} />
      </span>
      <span className="pb-shop-sidebar-option__label">{label}</span>
    </button>
  );
}
