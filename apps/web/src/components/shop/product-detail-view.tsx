'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QuantitySelector } from '@/components/shop/quantity-selector';
import { formatPrice, getProductPrices } from '@/lib/api/strapi';
import { useCartStore } from '@/lib/cart/cart-store';
import { interpolate } from '@/lib/i18n/dictionary';
import { useTranslations } from '@/lib/i18n/use-translations';
import {
  arePurchaseActionsDisabled,
  getStockQuantity,
  isProductOutOfStock,
  isQuantityExceedsStock,
} from '@/lib/product/stock';
import type { StrapiProduct } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';
import Image from 'next/image';

type ProductDetailViewProps = {
  product: StrapiProduct;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stockQuantity = getStockQuantity(product);
  const outOfStock = isProductOutOfStock(product);
  const exceedsStock = isQuantityExceedsStock(quantity, product);
  const actionsDisabled = arePurchaseActionsDisabled(quantity, product);
  const { basePrice, salePrice } = getProductPrices(product);
  const media = product.media as any;

  function incrementQuantity() {
    setFeedback(null);
    setQuantity((current) => current + 1);
  }

  function decrementQuantity() {
    setFeedback(null);
    setQuantity((current) => Math.max(1, current - 1));
  }

  function buildCartLine() {
    return {
      documentId: product.documentId,
      title: product.title,
      quantity,
      price: basePrice,
      discountPrice: salePrice,
      has_sale: product.has_sale,
    };
  }

  function handleAddToCart() {
    if (actionsDisabled) {
      return;
    }

    addItem(buildCartLine());
    setFeedback(t.productDetail.addedToCart);
  }

  function handleBuyNow() {
    if (actionsDisabled) {
      return;
    }

    addItem(buildCartLine());
    router.push('/checkout');
  }

  const numberLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="space-y-8">
      <Link
        href="/products"
        className="inline-flex text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
      >
        ← {t.productDetail.backToProducts}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
            <Image
              src={media[0].url}
              alt={media[0].name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              {product.title}
            </h1>

            {outOfStock && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {t.productDetail.outOfStock}
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-neutral-600">
                {product.has_sale && salePrice !== null
                  ? t.productDetail.discountPrice
                  : t.productDetail.basePrice}
              </span>
              <div className="flex items-baseline gap-2">
                {product.has_sale && salePrice !== null ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(salePrice, locale)}
                    </span>
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(basePrice, locale)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-neutral-900">
                    {formatPrice(basePrice, locale)}
                  </span>
                )}
              </div>
            </div>

            {!outOfStock && (
              <p className="text-sm text-neutral-500">
                {interpolate(t.productDetail.inStock, { stock: stockQuantity })}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <QuantitySelector
              quantity={quantity}
              stockQuantity={stockQuantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              label={t.productDetail.quantity}
            />

            {exceedsStock && !outOfStock && (
              <p
                role="alert"
                className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
              >
                {interpolate(t.productDetail.quantityWarning, {
                  stock: stockQuantity,
                })}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={actionsDisabled}
              aria-disabled={actionsDisabled}
              className="flex-1 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {t.productDetail.addToCart}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={actionsDisabled}
              aria-disabled={actionsDisabled}
              className="flex-1 rounded-lg border border-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
            >
              {t.productDetail.buyNow}
            </button>
          </div>

          {feedback && (
            <p className="text-sm font-medium text-green-700" role="status">
              {feedback}
            </p>
          )}

          <section className="border-t border-neutral-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">
              {t.productDetail.description}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
