"use client";

import { ProductCard } from "./product-card";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  filterProductsByCategory,
  sortProducts,
  type ProductSort,
} from "@/lib/product/filters";
import type { StrapiProduct } from "@/lib/types/strapi";

type ProductGridProps = {
  products: StrapiProduct[];
  selectedCategoryId: string | null;
  selectedSort: ProductSort;
};

export function ProductGrid({
  products,
  selectedCategoryId,
  selectedSort,
}: ProductGridProps) {
  const t = useTranslations();

  const visibleProducts = sortProducts(
    filterProductsByCategory(products, selectedCategoryId),
    selectedSort,
  );

  const hasActiveFilter = selectedCategoryId !== null || selectedSort !== null;

  return (
    <section aria-label={t.products.title}>
      <h2 className="mb-4 text-2xl font-bold text-neutral-900">
        {t.products.title}
      </h2>

      {visibleProducts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-600">
          {hasActiveFilter ? t.products.filteredEmpty : t.products.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
