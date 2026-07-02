'use client';

import { ProductCard } from '@/components/shop/product-card';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiProduct } from '@/lib/types/strapi';

type RelatedProductsProps = {
  products: StrapiProduct[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  const t = useTranslations();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 pt-10">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">
        {t.productDetail.relatedProducts}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.documentId}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
