"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ShopFiltersSidebar } from "@/components/shop/shop-filters-sidebar";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { AgeFilter, ShopSort } from "@/lib/shop/filters";
import type { StrapiCategory, StrapiShopItem } from "@/lib/types/strapi";
import { useLocaleStore } from "@/stores/locale-store";

type ShopViewProps = {
  categories: StrapiCategory[];
  items: StrapiShopItem[];
  initialCategoryId?: string | null;
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
    case 'price_high': return 'price:desc';
    case 'price_low': return 'price:asc';
    case 'most_viewed': return 'views:desc';
    case 'top_sellers': return 'total_sold:desc';
    default: return 'createdAt:desc';
  }
}

export function ShopView({
  categories,
  items: initialItems,
  initialCategoryId = null,
}: ShopViewProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);

  const [items, setItems] = useState<StrapiShopItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length >= 12);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [selectedSort, setSelectedSort] = useState<ShopSort>(null);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<AgeFilter>(null);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);

  const isFirstLoad = useRef(true);

  function buildQueryParams(pageNum: number): string {
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    params.set('pageSize', '12');
    params.set('sort', getSortParam(selectedSort));
    if (selectedCategoryId) params.set('category', selectedCategoryId);
    if (selectedAgeFilter) params.set('age', selectedAgeFilter);
    if (priceMin !== undefined && priceMin > 0) params.set('priceMin', String(priceMin));
    if (priceMax !== undefined && priceMax > 0) params.set('priceMax', String(priceMax));
    return params.toString();
  }

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/items?${buildQueryParams(1)}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.data ?? []);
      setPage(1);
      setPageCount(data.pageCount ?? 1);
      setHasMore((data.data?.length ?? 0) >= 12 && 1 < (data.pageCount ?? 1));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedSort, selectedCategoryId, selectedAgeFilter, priceMin, priceMax]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchItems();
  }, [fetchItems]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/shop/items?${buildQueryParams(nextPage)}`);
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
  }, [loadingMore, hasMore, page, selectedSort, selectedCategoryId, selectedAgeFilter, priceMin, priceMax]);

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

  const sortLabels: Record<string, string> = useMemo(() => ({
    newest: t.shop.newest,
    priceHigh: t.shop.priceHigh,
    priceLow: t.shop.priceLow,
    mostViewed: t.shop.mostViewed,
    topSellers: t.shop.topSellers,
  }), [t]);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <ShopFiltersSidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedAgeFilter={selectedAgeFilter}
        onSelectCategory={setSelectedCategoryId}
        onSelectAgeFilter={setSelectedAgeFilter}
        priceMin={priceMin}
        priceMax={priceMax}
        onPriceMinChange={setPriceMin}
        onPriceMaxChange={setPriceMax}
      />

      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-neutral-900">
            {t.shop.title}
          </h2>

          <div className="relative">
            <select
              value={selectedSort ?? ''}
              onChange={(e) => setSelectedSort((e.target.value || null) as ShopSort)}
              className="appearance-none rounded-lg border border-neutral-200 bg-white px-4 py-2 pe-9 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              {SORT_OPTIONS.map(({ value, labelKey }) => (
                <option key={labelKey} value={value ?? ''}>
                  {sortLabels[labelKey]}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-600">
            {t.shop.filteredEmpty}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li key={item.documentId}>
                <ShopItemCard item={item} />
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
