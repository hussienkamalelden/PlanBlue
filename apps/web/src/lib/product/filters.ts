import type { StrapiProduct } from '@/lib/types/strapi';

export type ProductSort = 'top_sellers' | 'most_viewed' | null;

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

export function sortProducts(
  products: StrapiProduct[],
  sort: ProductSort,
): StrapiProduct[] {
  if (!sort) {
    return products;
  }

  console.log(products);
  const sorted = [...products];

  if (sort === 'top_sellers') {
    return sorted.sort(
      (a, b) => Number(b.total_sold ?? 0) - Number(a.total_sold ?? 0),
    );
  }

  return sorted.sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0));
}
