'use client';

import Link from 'next/link';

import { formatPrice, getProductPrices } from '@/lib/api/strapi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { isProductOutOfStock } from '@/lib/product/stock';
import type { StrapiProduct } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

type ProductCardProps = {
  product: StrapiProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const { basePrice, salePrice } = getProductPrices(product);
  const unavailable = isProductOutOfStock(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group block h-full transition-opacity hover:opacity-90 ${
        unavailable ? 'opacity-50' : ''
      }`}
      aria-label={product.title}
    >
      <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow group-hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">
            {locale === 'ar' ? product.title_ar : product.title}
          </h3>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {product.has_sale && salePrice !== null && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                {t.productCard.sale}
              </span>
            )}
            {unavailable && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                {t.productCard.outOfStock}
              </span>
            )}
          </div>
        </div>

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">
          {locale === 'ar' ? product.description_ar : product.description}
        </p>

        <div className="mt-auto space-y-2 border-t border-neutral-100 pt-4">
          <div className="flex items-baseline gap-2">
            {product.has_sale && salePrice !== null ? (
              <>
                <span className="text-xl font-bold text-red-600">
                  {formatPrice(salePrice, locale)}
                </span>
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(basePrice, locale)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-neutral-900">
                {formatPrice(basePrice, locale)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
