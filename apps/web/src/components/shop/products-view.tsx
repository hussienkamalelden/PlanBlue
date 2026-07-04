"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductFiltersSidebar } from "@/components/shop/product-filters-sidebar";
import { ProductGrid } from "@/components/shop/product-grid";
import { formatPrice } from "@/lib/api/strapi";
import {
  type ActiveFilterTag,
  type AgeFilter,
  getProductPriceBounds,
  isPriceFilterActive,
  type ProductSort,
} from "@/lib/product/filters";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { StrapiCategory, StrapiProduct } from "@/lib/types/strapi";
import { useLocaleStore } from "@/stores/locale-store";

type ProductsViewProps = {
  categories: StrapiCategory[];
  products: StrapiProduct[];
};

export function ProductsView({ categories, products }: ProductsViewProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSort, setSelectedSort] = useState<ProductSort>(null);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<AgeFilter>(null);

  const priceBounds = useMemo(
    () => getProductPriceBounds(products),
    [products],
  );
  const [priceMin, setPriceMin] = useState(priceBounds.min);
  const [priceMax, setPriceMax] = useState(priceBounds.max);

  useEffect(() => {
    setSelectedCategoryId(null);
    setSelectedSort(null);
    setSelectedAgeFilter(null);
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [categories, products, priceBounds.min, priceBounds.max]);

  const activeTags = useMemo(() => {
    const tags: ActiveFilterTag[] = [];

    if (selectedSort) {
      tags.push({
        key: `sort-${selectedSort}`,
        type: 'sort',
        sort: selectedSort,
        label:
          selectedSort === 'top_sellers'
            ? t.products.topSellers
            : t.products.mostViewed,
      });
    }

    if (selectedAgeFilter) {
      const ageLabels: Record<Exclude<AgeFilter, null>, string> = {
        '0-1': t.products.age0to1,
        '1-2': t.products.age1to2,
        '2-3': t.products.age2to3,
        '3-4': t.products.age3to4,
        '4-6': t.products.age4to6,
        '6+': t.products.ageAbove6,
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
        (item) => item.documentId === selectedCategoryId,
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
      <ProductFiltersSidebar
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

      <ProductGrid
        products={products}
        selectedCategoryId={selectedCategoryId}
        selectedAgeFilter={selectedAgeFilter}
        selectedSort={selectedSort}
        priceMin={priceMin}
        priceMax={priceMax}
        activeTags={activeTags}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  );
}
