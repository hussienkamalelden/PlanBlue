"use client";

import { ActiveFilterTags } from "@/components/shop/active-filter-tags";
import { ShopItemCard } from "./shop-item-card";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  filterShopItemsByAge,
  filterShopItemsByCategory,
  filterShopItemsByPrice,
  sortShopItems,
  type ActiveFilterTag,
  type AgeFilter,
  type ShopSort,
} from "@/lib/shop/filters";
import type { StrapiShopItem } from "@/lib/types/strapi";

type ShopGridProps = {
  items: StrapiShopItem[];
  selectedCategoryId: string | null;
  selectedAgeFilter: AgeFilter;
  selectedSort: ShopSort;
  priceMin: number;
  priceMax: number;
  activeTags: ActiveFilterTag[];
  onRemoveTag: (tag: ActiveFilterTag) => void;
};

export function ShopGrid({
  items,
  selectedCategoryId,
  selectedAgeFilter,
  selectedSort,
  priceMin,
  priceMax,
  activeTags,
  onRemoveTag,
}: ShopGridProps) {
  const t = useTranslations();

  const visibleItems = sortShopItems(
    filterShopItemsByPrice(
      filterShopItemsByAge(
        filterShopItemsByCategory(items, selectedCategoryId),
        selectedAgeFilter,
      ),
      priceMin,
      priceMax,
    ),
    selectedSort,
  );

  const hasActiveFilter = activeTags.length > 0;

  return (
    <section aria-label={t.shop.title}>
      <h2 className="mb-4 text-2xl font-bold text-neutral-900">
        {t.shop.title}
      </h2>

      <ActiveFilterTags tags={activeTags} onRemove={onRemoveTag} />

      {visibleItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-600">
          {hasActiveFilter ? t.shop.filteredEmpty : t.shop.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <li key={item.documentId}>
              <ShopItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
