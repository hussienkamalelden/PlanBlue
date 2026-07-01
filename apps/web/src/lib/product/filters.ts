import type { StrapiProduct } from '@/lib/types/strapi';

export type ProductSort = 'top_sellers' | 'most_viewed' | null;

/** Age bucket filter — null means no age filter (show all products). */
export type AgeFilter =
  | '0-1'
  | '1-2'
  | '2-3'
  | '3-4'
  | '4-6'
  | '6+'
  | null;

export const AGE_FILTER_OPTIONS: Exclude<AgeFilter, null>[] = [
  '0-1',
  '1-2',
  '2-3',
  '3-4',
  '4-6',
  '6+',
];

/** Map a product's age integer to its filter bucket. */
export function getProductAgeBucket(age: number): Exclude<AgeFilter, null> {
  if (age <= 0) return '0-1';
  if (age === 1) return '1-2';
  if (age === 2) return '2-3';
  if (age === 3) return '3-4';
  if (age === 4 || age === 5) return '4-6';
  return '6+';
}

export function filterProductsByCategory(
  products: StrapiProduct[],
  categoryId: string | null,
): StrapiProduct[] {
  if (!categoryId) {
    return products;
  }

  return products.filter((product) =>
    product.categories?.some((category) => category.documentId === categoryId),
  );
}

export function filterProductsByAge(
  products: StrapiProduct[],
  ageFilter: AgeFilter,
): StrapiProduct[] {
  if (!ageFilter) {
    return products;
  }

  return products.filter((product) => {
    if (product.all_ages) {
      return true;
    }

    const age = Number(product.age ?? 0);
    return getProductAgeBucket(age) === ageFilter;
  });
}

export function sortProducts(
  products: StrapiProduct[],
  sort: ProductSort,
): StrapiProduct[] {
  if (!sort) {
    return products;
  }

  const sorted = [...products];

  if (sort === 'top_sellers') {
    return sorted.sort(
      (a, b) => Number(b.total_sold ?? 0) - Number(a.total_sold ?? 0),
    );
  }

  return sorted.sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0));
}
