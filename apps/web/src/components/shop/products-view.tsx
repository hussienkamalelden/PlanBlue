"use client";

import { useEffect, useState } from "react";

import { CategoryNav } from "@/components/shop/category-nav";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductSortNav } from "@/components/shop/product-sort-nav";
import type { ProductSort } from "@/lib/product/filters";
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

  useEffect(() => {
    setSelectedCategoryId(null);
    setSelectedSort(null);
  }, [categories, products]);

  return (
    <div className="space-y-10">
      <ProductSortNav
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />

      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <ProductGrid
        products={products}
        selectedCategoryId={selectedCategoryId}
        selectedSort={selectedSort}
      />
    </div>
  );
}
