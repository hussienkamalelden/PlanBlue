'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ActiveFilterTags } from '@/components/shop/active-filter-tags';
import { ShopEmptyState } from '@/components/shop/shop-empty-state';
import { ShopFiltersSidebar } from '@/components/shop/shop-filters-sidebar';
import { ShopProductCard } from '@/components/home/shop-product-card';
import { ShopSortDropdown } from '@/components/shop/shop-sort-dropdown';
import { useTranslations } from '@/lib/i18n/use-translations';
import {
  getShopItemPriceBounds,
  isPriceFilterActive,
  type ActiveFilterTag,
  type AgeFilter,
  type ShopSort,
} from '@/lib/shop/filters';
import type { StrapiCategory, StrapiShopItem } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

type ShopViewProps = {
  categories: StrapiCategory[];
  items: StrapiShopItem[];
  allItems?: StrapiShopItem[];
  initialCategoryIds?: string[];
  initialSearch?: string;
};

const SORT_OPTIONS: { value: ShopSort; labelKey: string }[] = [
  { value: null, labelKey: 'newest' },
  { value: 'price_high', labelKey: 'priceHigh' },
  { value: 'price_low', labelKey: 'priceLow' },
  { value: 'most_viewed', labelKey: 'mostViewed' },
  { value: 'top_sellers', labelKey: 'topSellers' },
];

function getSortParam(sort: ShopSort): string {
  switch (sort) {
    case 'price_high':
      return 'price:desc';
    case 'price_low':
      return 'price:asc';
    case 'most_viewed':
      return 'views:desc';
    case 'top_sellers':
      return 'total_sold:desc';
    default:
      return 'createdAt:desc';
  }
}

export function ShopView({
  categories,
  items: initialItems,
  allItems,
  initialCategoryIds = [],
  initialSearch = '',
}: ShopViewProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);

  const [items, setItems] = useState<StrapiShopItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length >= 12);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);
  const [selectedSort, setSelectedSort] = useState<ShopSort>(null);
  const [selectedAgeFilters, setSelectedAgeFilters] = useState<Exclude<AgeFilter, null>[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);

  const priceBounds = useMemo(
    () => getShopItemPriceBounds(allItems && allItems.length > 0 ? allItems : initialItems),
    [allItems, initialItems],
  );
  const [priceMin, setPriceMin] = useState(priceBounds.min);
  const [priceMax, setPriceMax] = useState(priceBounds.max);

  const priceDebounceRef = useRef<number | null>(null);
  const isFirstLoad = useRef(true);
  const filtersRef = useRef({
    selectedSort,
    selectedCategoryIds,
    selectedAgeFilters,
    priceMin,
    priceMax,
    activeSearch,
  });
  filtersRef.current = {
    selectedSort,
    selectedCategoryIds,
    selectedAgeFilters,
    priceMin,
    priceMax,
    activeSearch,
  };

  function buildQueryString(pageNum: number): string {
    const {
      selectedSort: sort,
      selectedCategoryIds: cats,
      selectedAgeFilters: ages,
      priceMin: pMin,
      priceMax: pMax,
      activeSearch: search,
    } = filtersRef.current;
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    params.set('pageSize', '12');
    params.set('sort', getSortParam(sort));
    cats.forEach((id) => params.append('category', id));
    ages.forEach((age) => params.append('age', age));
    if (isPriceFilterActive(pMin, pMax, priceBounds)) {
      if (pMin > priceBounds.min)
        params.set('priceMin', String(Math.round(pMin)));
      if (pMax < priceBounds.max)
        params.set('priceMax', String(Math.round(pMax)));
    }
    if (search.trim()) params.set('search', search.trim());
    return params.toString();
  }

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/items?${buildQueryString(1)}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.data ?? []);
      setPage(1);
      setHasMore((data.data?.length ?? 0) >= 12 && 1 < (data.pageCount ?? 1));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when sort/category/age/search changes (not price — that's debounced)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchFirstPage();
  }, [selectedSort, selectedCategoryIds, selectedAgeFilters, activeSearch]);

  function handlePriceMinChange(value: number) {
    setPriceMin(value);
    if (priceDebounceRef.current) window.clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = window.setTimeout(() => fetchFirstPage(), 500);
  }

  function handlePriceMaxChange(value: number) {
    setPriceMax(value);
    if (priceDebounceRef.current) window.clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = window.setTimeout(() => fetchFirstPage(), 500);
  }

  function handlePriceReset() {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
    if (priceDebounceRef.current) window.clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = window.setTimeout(() => fetchFirstPage(), 100);
  }

  function handleSearchSubmit() {
    const query = searchQuery.trim();
    setActiveSearch(query);
  }

  function handleClearSearch() {
    setSearchQuery('');
    setActiveSearch('');
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/shop/items?${buildQueryString(nextPage)}`);
      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      const newItems: StrapiShopItem[] = data.data;

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.documentId));
          const unique = newItems.filter((i) => !existingIds.has(i.documentId));
          return [...prev, ...unique];
        });
        setPage(nextPage);
        if (nextPage >= (data.pageCount ?? 1)) {
          setHasMore(false);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const sortLabels: Record<string, string> = useMemo(
    () => ({
      newest: t.shop.newest,
      priceHigh: t.shop.priceHigh,
      priceLow: t.shop.priceLow,
      mostViewed: t.shop.mostViewed,
      topSellers: t.shop.topSellers,
    }),
    [t],
  );

  const sortOptions = useMemo(
    () =>
      SORT_OPTIONS.map(({ value, labelKey }) => ({
        value,
        label: sortLabels[labelKey],
      })),
    [sortLabels],
  );

  const activeFilterTags = useMemo(() => {
    const tags: ActiveFilterTag[] = [];

    if (activeSearch.trim()) {
      tags.push({
        key: 'search',
        type: 'search',
        query: activeSearch.trim(),
        label: `${t.shop.searchLabel}: ${activeSearch.trim()}`,
      });
    }

    for (const catId of selectedCategoryIds) {
      const cat = categories.find((c) => c.documentId === catId);
      if (cat) {
        tags.push({
          key: `cat-${catId}`,
          type: 'category',
          categoryId: catId,
          label: locale === 'ar' ? cat.title_ar : cat.title,
        });
      }
    }

    const ageLabels: Record<Exclude<AgeFilter, null>, string> = {
      '0-1': t.shop.age0to1,
      '1-2': t.shop.age1to2,
      '2-3': t.shop.age2to3,
      '3-4': t.shop.age3to4,
      '4-6': t.shop.age4to6,
      '6+': t.shop.ageAbove6,
    };
    for (const af of selectedAgeFilters) {
      tags.push({
        key: `age-${af}`,
        type: 'age',
        ageFilter: af,
        label: ageLabels[af],
      });
    }

    if (isPriceFilterActive(priceMin, priceMax, priceBounds)) {
      tags.push({
        key: `price-${priceMin}-${priceMax}`,
        type: 'price',
        min: priceMin,
        max: priceMax,
        label: `${Math.round(priceMin)} - ${Math.round(priceMax)}`,
      });
    }

    return tags;
  }, [activeSearch, selectedCategoryIds, selectedAgeFilters, priceMin, priceMax, priceBounds, categories, locale, t]);

  function handleRemoveFilterTag(tag: ActiveFilterTag) {
    switch (tag.type) {
      case 'search':
        handleClearSearch();
        break;
      case 'category':
        setSelectedCategoryIds((prev) => prev.filter((id) => id !== tag.categoryId));
        break;
      case 'age':
        setSelectedAgeFilters((prev) => prev.filter((a) => a !== tag.ageFilter));
        break;
      case 'price':
        handlePriceReset();
        break;
    }
  }

  const hasActiveFilters = activeFilterTags.length > 0;

  const emptyMessage = hasActiveFilters
    ? t.shop.filteredEmpty
    : t.shop.empty;

  return (
    <div className="pt-10 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <ShopFiltersSidebar
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        selectedAgeFilters={selectedAgeFilters}
        priceBounds={priceBounds}
        priceMin={priceMin}
        priceMax={priceMax}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onToggleCategory={(id) =>
          setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
          )
        }
        onToggleAgeFilter={(filter) =>
          setSelectedAgeFilters((prev) =>
            prev.includes(filter) ? prev.filter((a) => a !== filter) : [...prev, filter],
          )
        }
        onPriceMinChange={handlePriceMinChange}
        onPriceMaxChange={handlePriceMaxChange}
        onPriceReset={handlePriceReset}
      />

      <div>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <ShopSortDropdown
            label={t.shop.sortTitle}
            value={selectedSort}
            options={sortOptions}
            onChange={setSelectedSort}
          />
          <ActiveFilterTags tags={activeFilterTags} onRemove={handleRemoveFilterTag} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-primary" />
          </div>
        ) : items.length === 0 ? (
          <ShopEmptyState message={emptyMessage} />
        ) : (
          <ul className="bg-white rounded-lg p-4 border border-dashed border-neutral-300 grid gap-x-3 gap-y-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {items.map((item) => (
              <li key={item.documentId} className="px-1 pb-2">
                <ShopProductCard item={item} locale={locale} />
              </li>
            ))}
          </ul>
        )}

        {hasMore && !loading && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loadingMore && (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
