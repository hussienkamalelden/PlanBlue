"use client";

import { useEffect, useState } from "react";

import { CategoryNav } from "@/components/shop/category-nav";
import { ProductGrid } from "@/components/shop/product-grid";
import type { StrapiCategory, StrapiProduct } from "@/lib/types/strapi";

type ProductsViewProps = {
  categories: StrapiCategory[];
  products: StrapiProduct[];
};

export function ProductsView({ categories, products }: ProductsViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setSelectedCategoryId(null);
  }, [categories, products]);

  return (
    <div className="space-y-10">
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <ProductGrid
        products={products}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
}
