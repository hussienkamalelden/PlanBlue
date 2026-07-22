'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CircleCheck, CircleX, Share2 } from 'lucide-react';

import { QuantitySelector } from '@/components/shop/quantity-selector';
import { ShopItemMediaGallery } from '@/components/shop/shop-item-media-gallery';
import { RelatedShopItems } from '@/components/shop/related-shop-items';
import { formatPrice, formatPriceWhole, getShopItemPrices } from '@/lib/api/strapi';
import { buildCartLineFromShopItem } from '@/lib/cart/build-cart-line';
import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';
import { interpolate } from '@/lib/i18n/dictionary';
import { buildProductShareMessage } from '@/lib/seo/metadata';
import {
  areDetailPurchaseActionsDisabled,
  getRemainingAddableQuantity,
  isDetailAddQuantityExceedsAvailable,
  isShopItemOutOfStock,
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
  const cartQuantity = useCartStore(
    (state) =>
      state.items.find((line) => line.documentId === item.documentId)
        ?.quantity ?? 0,
  );

  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [quantityUnavailableNotice, setQuantityUnavailableNotice] =
    useState(false);

  const maxAddableQuantity = getRemainingAddableQuantity(item, cartQuantity);
  const outOfStock = isShopItemOutOfStock(item);
  const exceedsAvailable = isDetailAddQuantityExceedsAvailable(
    quantity,
    item,
    cartQuantity,
  );
  const showQuantityUnavailable =
    (exceedsAvailable || quantityUnavailableNotice) && !outOfStock;
  const actionsDisabled = areDetailPurchaseActionsDisabled(
    quantity,
    item,
    cartQuantity,
  );
  const { basePrice, salePrice } = getShopItemPrices(item);
  const title = locale === 'ar' ? item.title_ar : item.title;
  const description = locale === 'ar' ? item.description_ar : item.description;

  useEffect(() => {
    setQuantity((current) => {
      if (maxAddableQuantity <= 0) {
        return 1;
      }
      return Math.min(Math.max(1, current), maxAddableQuantity);
    });
    setQuantityUnavailableNotice(false);
  }, [maxAddableQuantity, item.documentId]);

  function incrementQuantity() {
    setFeedback(null);
    if (maxAddableQuantity <= 0 || quantity >= maxAddableQuantity) {
      setQuantityUnavailableNotice(true);
      return;
    }
    setQuantityUnavailableNotice(false);
    setQuantity((current) => Math.min(maxAddableQuantity, current + 1));
  }

  function decrementQuantity() {
    setFeedback(null);
    setQuantityUnavailableNotice(false);
    setQuantity((current) => Math.max(1, current - 1));
  }

  function buildCartLine() {
    return buildCartLineFromShopItem(item, quantity);
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

  async function handleShare() {
    const url = `${window.location.origin}/shop/${item.slug}`;
    const displayPrice = salePrice ?? basePrice;
    const priceLabel = formatPriceWhole(displayPrice, locale);
    const shareText = buildProductShareMessage(title, priceLabel, url);

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ text: shareText });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareFeedback(t.shopItemDetail.shareCopied);
      window.setTimeout(() => setShareFeedback(null), 2500);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setShareFeedback(t.shopItemDetail.shareFailed);
      window.setTimeout(() => setShareFeedback(null), 2500);
    }
  }

  return (
    <div className="pb-product-details">
      <div className="pb-product-details__content">
        <div className="pb-product-details__gallery">
          <ShopItemMediaGallery media={item.media ?? []} alt={title} />
        </div>

        <div className="pb-product-details__info">
          <h1 className="pb-product-details__title">{title}</h1>

          <div className="pb-product-details__price">
            {item.has_sale && salePrice !== null ? (
              <>
                <span className="pb-product-details__price-current">
                  {formatPrice(salePrice, locale)}
                </span>
                <del className="pb-product-details__price-old">
                  {formatPrice(basePrice, locale)}
                </del>
              </>
            ) : (
              <span className="pb-product-details__price-current">
                {formatPrice(basePrice, locale)}
              </span>
            )}
          </div>

          {description?.trim() && (
            <div className="pb-product-details__description">
              <p className="whitespace-pre-line">{description}</p>
            </div>
          )}

          <ul className="pb-product-details__meta-box">
            {item.sku && (
              <li>
                <strong>{t.shopItemDetail.sku}:</strong>
                <span>{item.sku}</span>
              </li>
            )}
            {item.categories && item.categories.length > 0 && (
              <li>
                <strong>{t.shopItemDetail.category}:</strong>
                <span className="pb-product-details__meta-links">
                  {item.categories.map((cat, index) => (
                    <span key={cat.documentId}>
                      {index > 0 ? ', ' : null}
                      <Link
                        href={`/shop?category=${cat.documentId}`}
                        className="pb-product-details__meta-link"
                      >
                        {locale === 'ar' ? cat.title_ar : cat.title}
                      </Link>
                    </span>
                  ))}
                </span>
              </li>
            )}
            {item.need_batteries && (
              <li>
                <strong>{t.shopItemDetail.freeBatteries}:</strong>
                <span className="pb-product-details__meta-positive">
                  {item.batteries_quantity?.trim() ||
                    t.shopItemDetail.freeBatteriesIncluded}
                </span>
              </li>
            )}
            <li>
              <strong>{t.shopItemDetail.availability}:</strong>
              {outOfStock ? (
                <span className="pb-product-details__availability pb-product-details__availability--out">
                  <CircleX className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t.shopItemDetail.notInStock}
                </span>
              ) : (
                <span className="pb-product-details__availability pb-product-details__availability--in">
                  <CircleCheck
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  {t.shopItemDetail.availableNow}
                </span>
              )}
            </li>
          </ul>

          <div className="pb-product-details__actions">
            <div className="pb-product-details__qty-row">
              <QuantitySelector
                variant="product"
                quantity={quantity}
                stockQuantity={maxAddableQuantity}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
                label={t.shopItemDetail.quantity}
              />
              {cartQuantity > 0 ? (
                <p className="pb-product-details__cart-notice" role="status">
                  {interpolate(t.shopItemDetail.inCartNotice, {
                    quantity: cartQuantity,
                  })}
                </p>
              ) : null}
            </div>

            <div className="pb-product-details__buttons">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={actionsDisabled}
                aria-disabled={actionsDisabled}
                className="pb-product-details__btn pb-product-details__btn--primary"
              >
                {t.shopItemDetail.addToCart}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={actionsDisabled}
                aria-disabled={actionsDisabled}
                className="pb-product-details__btn pb-product-details__btn--secondary"
              >
                {t.shopItemDetail.buyNow}
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label={t.shopItemDetail.share}
                className="pb-product-details__btn pb-product-details__btn--share"
              >
                <Share2 className="h-5 w-5" aria-hidden="true" />
                <span>{t.shopItemDetail.share}</span>
              </button>
            </div>
          </div>

          {shareFeedback && (
            <p className="pb-product-details__feedback" role="status">
              {shareFeedback}
            </p>
          )}

          {showQuantityUnavailable && (
            <p role="alert" className="pb-product-details__alert">
              {t.shopItemDetail.quantityUnavailable}
            </p>
          )}

          {feedback && (
            <p className="pb-product-details__feedback" role="status">
              {feedback}
            </p>
          )}
        </div>
      </div>

      <RelatedShopItems items={relatedItems} titleKey="relatedSection" />
      <RelatedShopItems
        items={youMayAlsoLikeItems}
        titleKey="youMayAlsoLikeSection"
      />
    </div>
  );
}
