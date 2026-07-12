'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import {
  CartItemValidationMessages,
  CartItemValidationOverlay,
  CartValidationBanner,
} from '@/components/shop/cart-validation-messages';
import { CartRemoveConfirmModal } from '@/components/shop/cart-remove-confirm-modal';
import { CartTopSellers } from '@/components/shop/cart-top-sellers';
import { ShopPageShell } from '@/components/shop/shop-page-shell';
import { useCartItemImages } from '@/lib/cart/use-cart-item-images';
import { useCartValidation } from '@/lib/cart/use-cart-validation';
import { useCartStore, type CartLineItem } from '@/lib/cart/cart-store';
import { getItemValidation } from '@/lib/cart/validate-cart';
import { formatPrice } from '@/lib/api/strapi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useLocaleStore } from '@/stores/locale-store';

export default function Cart() {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const items = useCartStore((state) => state.items);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { status, validation, validatingDocumentIds, isBlocked } =
    useCartValidation();
  const [itemToRemove, setItemToRemove] = useState<CartLineItem | null>(null);

  useCartItemImages();

  const total = items.reduce((sum, item) => {
    const unitPrice =
      item.has_sale && item.discountPrice !== null
        ? item.discountPrice
        : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  function itemHasIssue(documentId: string): boolean {
    const itemValidation = getItemValidation(validation, documentId);
    return itemValidation !== null && !itemValidation.valid;
  }

  function requestRemoveItem(item: CartLineItem) {
    setItemToRemove(item);
  }

  function confirmRemoveItem() {
    if (!itemToRemove) {
      return;
    }

    removeItem(itemToRemove.documentId);
    setItemToRemove(null);
  }

  return (
    <ShopPageShell bannerSrc="/images/cart/banner.png">
      <CartRemoveConfirmModal
        open={itemToRemove !== null}
        productTitle={itemToRemove?.title ?? ''}
        onClose={() => setItemToRemove(null)}
        onConfirm={confirmRemoveItem}
      />

      <section className="pb-cart-section mt-10">
        {items.length === 0 ? (
          <div className="pb-cart-empty">
            <p>{t.cart.empty}</p>
            <Link
              href="/shop"
              className="pb-cart-summary__btn pb-cart-summary__btn--primary"
            >
              {t.cart.continueShopping}
            </Link>
          </div>
        ) : (
          <>
            <CartValidationBanner status={status} validation={validation} />

            <div className="pb-cart-layout">
              <div className="pb-cart-layout__main">
                <div className="pb-cart-table-outer">
                  <table className="pb-cart-table">
                    <thead>
                      <tr>
                        <th>{t.cart.tableProduct}</th>
                        <th>{t.cart.tableDiscount}</th>
                        <th>{t.cart.tablePrice}</th>
                        <th>{t.cart.tableQuantity}</th>
                        <th>{t.cart.tableTotal}</th>
                        <th aria-hidden="true">&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const unitPrice =
                          item.has_sale && item.discountPrice !== null
                            ? item.discountPrice
                            : item.price;
                        const hasSale =
                          item.has_sale && item.discountPrice !== null;
                        const hasIssue = itemHasIssue(item.documentId);
                        const isValidating = validatingDocumentIds.includes(
                          item.documentId,
                        );

                        return (
                          <tr
                            key={item.documentId}
                            className={
                              hasIssue ? 'pb-cart-table__row--issue' : undefined
                            }
                          >
                            <td className="pb-cart-table__product">
                              {isValidating && (
                                <CartItemValidationOverlay
                                  label={t.cart.validation.checking}
                                />
                              )}
                              <div className="pb-cart-table__product-box">
                                <div className="pb-cart-table__image">
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt=""
                                      width={85}
                                      height={85}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <span
                                      className="pb-cart-table__image-fallback"
                                      aria-hidden="true"
                                    >
                                      🧸
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/shop/${item.slug}`}
                                    className="pb-cart-table__name"
                                  >
                                    {item.title}
                                  </Link>
                                  <CartItemValidationMessages
                                    documentId={item.documentId}
                                    item={item}
                                    validation={validation}
                                    locale={locale}
                                    isValidating={isValidating}
                                  />
                                </div>
                              </div>
                            </td>
                            <td
                              data-label={t.cart.tableDiscount}
                              className={
                                hasSale
                                  ? 'pb-cart-table__discount'
                                  : 'pb-cart-table__discount pb-cart-table__discount--empty'
                              }
                            >
                              {hasSale
                                ? formatPrice(item.price, locale)
                                : '—'}
                            </td>
                            <td data-label={t.cart.tablePrice}>
                              {formatPrice(unitPrice, locale)}
                            </td>
                            <td data-label={t.cart.tableQuantity}>
                              <div
                                className="pb-product-qty pb-cart-table__qty"
                                aria-label={t.cart.tableQuantity}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    item.quantity > 1
                                      ? setItemQuantity(
                                          item.documentId,
                                          item.quantity - 1,
                                        )
                                      : requestRemoveItem(item)
                                  }
                                  className="pb-product-qty__btn"
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span
                                  className="pb-product-qty__value"
                                  aria-live="polite"
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setItemQuantity(
                                      item.documentId,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={
                                    isBlocked ||
                                    item.quantity >= item.stockQuantity
                                  }
                                  className="pb-product-qty__btn"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td data-label={t.cart.tableTotal}>
                              {formatPrice(unitPrice * item.quantity, locale)}
                            </td>
                            <td className="pb-cart-table__remove-cell">
                              <button
                                type="button"
                                onClick={() => requestRemoveItem(item)}
                                className="pb-cart-table__remove"
                                aria-label={t.cart.remove}
                              >
                                <Trash2
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside
                className={`pb-cart-summary${isBlocked ? ' pb-cart-summary--blocked' : ''}`}
              >
                <div className="pb-cart-summary__total-row">
                  <h4>{t.cart.total}</h4>
                  <h5>{formatPrice(total, locale)}</h5>
                </div>

                <div className="pb-cart-summary__actions">
                  <Link
                    href={isBlocked ? '#' : '/checkout'}
                    onClick={(event) => {
                      if (isBlocked) {
                        event.preventDefault();
                      }
                    }}
                    aria-disabled={isBlocked}
                    className={`pb-cart-summary__btn pb-cart-summary__btn--primary${
                      isBlocked ? ' pb-cart-summary__btn--disabled' : ''
                    }`}
                  >
                    {t.cart.proceedToCheckout}
                  </Link>

                  <Link
                    href="/shop"
                    className="pb-cart-summary__btn pb-cart-summary__btn--secondary"
                  >
                    {t.cart.continueShopping}
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>

      <CartTopSellers />
    </ShopPageShell>
  );
}
