"use client";

import { ActiveFilterTags } from "@/components/shop/active-filter-tags";
import { ProductCard } from "./product-card";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  filterProductsByAge,
  filterProductsByCategory,
  filterProductsByPrice,
  sortProducts,
  type ActiveFilterTag,
  type AgeFilter,
  type ProductSort,
} from "@/lib/product/filters";
import type { StrapiProduct } from "@/lib/types/strapi";

type ProductGridProps = {
  products: StrapiProduct[];
  selectedCategoryId: string | null;
  selectedAgeFilter: AgeFilter;
  selectedSort: ProductSort;
  priceMin: number;
  priceMax: number;
  activeTags: ActiveFilterTag[];
  onRemoveTag: (tag: ActiveFilterTag) => void;
};

export function ProductGrid({
  products,
  selectedCategoryId,
  selectedAgeFilter,
  selectedSort,
  priceMin,
  priceMax,
  activeTags,
  onRemoveTag,
}: ProductGridProps) {
  const t = useTranslations();

  const visibleProducts = sortProducts(
    filterProductsByPrice(
      filterProductsByAge(
        filterProductsByCategory(products, selectedCategoryId),
        selectedAgeFilter,
      ),
      priceMin,
      priceMax,
    ),
    selectedSort,
  );

  const hasActiveFilter = activeTags.length > 0;

  return (
    <section aria-label={t.products.title}>
      <h2 className="mb-4 text-2xl font-bold text-neutral-900">
        {t.products.title}
      </h2>

      <ActiveFilterTags tags={activeTags} onRemove={onRemoveTag} />

      {visibleProducts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-600">
          {hasActiveFilter ? t.products.filteredEmpty : t.products.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <li key={product.documentId}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
