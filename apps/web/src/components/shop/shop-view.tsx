"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ShopFiltersSidebar } from "@/components/shop/shop-filters-sidebar";
import { ShopGrid } from "@/components/shop/shop-grid";
import { formatPrice } from "@/lib/api/strapi";
import {
  type ActiveFilterTag,
  type AgeFilter,
  getShopItemPriceBounds,
  isPriceFilterActive,
  type ShopSort,
} from "@/lib/shop/filters";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { StrapiCategory, StrapiShopItem } from "@/lib/types/strapi";
import { useLocaleStore } from "@/stores/locale-store";

type ShopViewProps = {
  categories: StrapiCategory[];
  items: StrapiShopItem[];
  initialCategoryId?: string | null;
};

export function ShopView({
  categories,
  items: initialItems,
  initialCategoryId = null,
}: ShopViewProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);

  const [items, setItems] = useState<StrapiShopItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length >= 12);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategoryId,
  );
  const [selectedSort, setSelectedSort] = useState<ShopSort>(null);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<AgeFilter>(null);

  const priceBounds = useMemo(
    () => getShopItemPriceBounds(items),
    [items],
  );
  const [priceMin, setPriceMin] = useState(priceBounds.min);
  const [priceMax, setPriceMax] = useState(priceBounds.max);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length >= 12);
    setSelectedCategoryId(initialCategoryId);
    setSelectedSort(null);
    setSelectedAgeFilter(null);
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [
    initialItems,
    initialCategoryId,
    priceBounds.min,
    priceBounds.max,
  ]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/shop/items?page=${nextPage}&pageSize=12`);
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
        if (nextPage >= data.pageCount) {
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

  const activeTags = useMemo(() => {
    const tags: ActiveFilterTag[] = [];

    if (selectedSort) {
      tags.push({
        key: `sort-${selectedSort}`,
        type: 'sort',
        sort: selectedSort,
        label:
          selectedSort === 'top_sellers'
            ? t.shop.topSellers
            : t.shop.mostViewed,
      });
    }

    if (selectedAgeFilter) {
      const ageLabels: Record<Exclude<AgeFilter, null>, string> = {
        '0-1': t.shop.age0to1,
        '1-2': t.shop.age1to2,
        '2-3': t.shop.age2to3,
        '3-4': t.shop.age3to4,
        '4-6': t.shop.age4to6,
        '6+': t.shop.ageAbove6,
      };

      tags.push({
        key: `age-${selectedAgeFilter}`,
        type: 'age',
        ageFilter: selectedAgeFilter,
        label: ageLabels[selectedAgeFilter],
      });
    }

    if (isPriceFilterActive(priceMin, priceMax, priceBounds)) {
      tags.push({
        key: 'price-range',
        type: 'price',
        min: priceMin,
        max: priceMax,
        label: `${formatPrice(priceMin, locale)} – ${formatPrice(priceMax, locale)}`,
      });
    }

    if (selectedCategoryId) {
      const category = categories.find(
        (entry) => entry.documentId === selectedCategoryId,
      );

      if (category) {
        tags.push({
          key: `category-${selectedCategoryId}`,
          type: 'category',
          categoryId: selectedCategoryId,
          label: locale === 'ar' ? category.title_ar : category.title,
        });
      }
    }

    return tags;
  }, [
    categories,
    locale,
    priceBounds,
    priceMax,
    priceMin,
    selectedAgeFilter,
    selectedCategoryId,
    selectedSort,
    t,
  ]);

  function handleRemoveTag(tag: ActiveFilterTag) {
    if (tag.type === 'category') {
      setSelectedCategoryId(null);
      return;
    }

    if (tag.type === 'age') {
      setSelectedAgeFilter(null);
      return;
    }

    if (tag.type === 'price') {
      setPriceMin(priceBounds.min);
      setPriceMax(priceBounds.max);
      return;
    }

    setSelectedSort(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <ShopFiltersSidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedSort={selectedSort}
        selectedAgeFilter={selectedAgeFilter}
        priceMin={priceMin}
        priceMax={priceMax}
        priceBounds={priceBounds}
        onSelectCategory={setSelectedCategoryId}
        onSelectSort={setSelectedSort}
        onSelectAgeFilter={setSelectedAgeFilter}
        onPriceMinChange={setPriceMin}
        onPriceMaxChange={setPriceMax}
      />

      <div>
        <ShopGrid
          items={items}
          selectedCategoryId={selectedCategoryId}
          selectedAgeFilter={selectedAgeFilter}
          selectedSort={selectedSort}
          priceMin={priceMin}
          priceMax={priceMax}
          activeTags={activeTags}
          onRemoveTag={handleRemoveTag}
        />

        {hasMore && (
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
