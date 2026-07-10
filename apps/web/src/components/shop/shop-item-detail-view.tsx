'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QuantitySelector } from '@/components/shop/quantity-selector';
import { ShopItemMediaGallery } from '@/components/shop/shop-item-media-gallery';
import { RelatedShopItems } from '@/components/shop/related-shop-items';
import { formatPrice, getShopItemPrices } from '@/lib/api/strapi';
import { useCartStore } from '@/lib/cart/cart-store';
import { interpolate } from '@/lib/i18n/dictionary';
import { useTranslations } from '@/lib/i18n/use-translations';
import {
  arePurchaseActionsDisabled,
  getStockQuantity,
  isShopItemOutOfStock,
  isQuantityExceedsStock,
} from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

type ShopItemDetailViewProps = {
  item: StrapiShopItem;
  relatedItems: StrapiShopItem[];
  youMayAlsoLikeItems: StrapiShopItem[];
};

export function ShopItemDetailView({
  item,
  relatedItems,
  youMayAlsoLikeItems,
}: ShopItemDetailViewProps) {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);

  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stockQuantity = getStockQuantity(item);
  const outOfStock = isShopItemOutOfStock(item);
  const exceedsStock = isQuantityExceedsStock(quantity, item);
  const actionsDisabled = arePurchaseActionsDisabled(quantity, item);
  const { basePrice, salePrice } = getShopItemPrices(item);
  const title = locale === 'ar' ? item.title_ar : item.title;

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
      documentId: item.documentId,
      slug: item.slug,
      title: item.title,
      quantity,
      price: basePrice,
      discountPrice: salePrice,
      has_sale: item.has_sale,
      stockQuantity,
    };
  }

  function handleAddToCart() {
    if (actionsDisabled) {
      return;
    }

    addItem(buildCartLine());
    setFeedback(t.shopItemDetail.addedToCart);
  }

  function handleBuyNow() {
    if (actionsDisabled) {
      return;
    }

    if (!isInCart(item.documentId)) {
      addItem(buildCartLine());
    }
    router.push('/checkout');
  }

  return (
    <div className="space-y-8">
      <Link
        href="/shop"
        className="inline-flex text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
      >
        ← {t.shopItemDetail.backToShop}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <ShopItemMediaGallery media={item.media ?? []} alt={title} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              {title}
            </h1>

            {item.sku && (
              <p className="mt-1 text-xs font-medium text-neutral-400">
                {t.shopItemDetail.sku}: {item.sku}
              </p>
            )}

            {item.categories && item.categories.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {t.shopItemDetail.categories}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.categories.map((cat) => (
                    <span
                      key={cat.documentId}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {locale === 'ar' ? cat.title_ar : cat.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {outOfStock && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {t.shopItemDetail.outOfStock}
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-neutral-600">
                {item.has_sale && salePrice !== null
                  ? t.shopItemDetail.discountPrice
                  : t.shopItemDetail.basePrice}
              </span>
              <div className="flex items-baseline gap-2">
                {item.has_sale && salePrice !== null ? (
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
                {interpolate(t.shopItemDetail.inStock, { stock: stockQuantity })}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <QuantitySelector
              quantity={quantity}
              stockQuantity={stockQuantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              label={t.shopItemDetail.quantity}
            />

            {exceedsStock && !outOfStock && (
              <p
                role="alert"
                className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
              >
                {interpolate(t.shopItemDetail.quantityWarning, {
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
              {t.shopItemDetail.addToCart}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={actionsDisabled}
              aria-disabled={actionsDisabled}
              className="flex-1 rounded-lg border border-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
            >
              {t.shopItemDetail.buyNow}
            </button>
          </div>

          {feedback && (
            <p className="text-sm font-medium text-green-700" role="status">
              {feedback}
            </p>
          )}

          <section className="border-t border-neutral-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">
              {t.shopItemDetail.description}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {locale === 'ar' ? item.description_ar : item.description}
            </p>
          </section>
        </div>
      </div>

      <RelatedShopItems items={relatedItems} titleKey="relatedItems" />
      <RelatedShopItems items={youMayAlsoLikeItems} titleKey="youMayAlsoLike" />
    </div>
  );
}
