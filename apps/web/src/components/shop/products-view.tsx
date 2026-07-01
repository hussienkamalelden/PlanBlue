"use client";

import { useEffect, useState } from "react";

import { CategoryNav } from "@/components/shop/category-nav";
import { ProductAgeNav } from "@/components/shop/product-age-nav";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductSortNav } from "@/components/shop/product-sort-nav";
import type { AgeFilter, ProductSort } from "@/lib/product/filters";
import type { StrapiCategory, StrapiProduct } from "@/lib/types/strapi";

type ProductsViewProps = {
  categories: StrapiCategory[];
  products: StrapiProduct[];
};

export function ProductsView({ categories, products }: ProductsViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSort, setSelectedSort] = useState<ProductSort>(null);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<AgeFilter>(null);

  useEffect(() => {
    setSelectedCategoryId(null);
    setSelectedSort(null);
    setSelectedAgeFilter(null);
  }, [categories, products]);

  return (
    <div className="space-y-10">
      <ProductSortNav
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />

      <ProductAgeNav
        selectedAgeFilter={selectedAgeFilter}
        onSelectAgeFilter={setSelectedAgeFilter}
      />

      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <ProductGrid
        products={products}
        selectedCategoryId={selectedCategoryId}
        selectedAgeFilter={selectedAgeFilter}
        selectedSort={selectedSort}
      />
    </div>
  );
}
