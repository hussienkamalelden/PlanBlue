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
import { formatPriceDisplay } from '@/lib/api/strapi';
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
                        <th className="pb-cart-table__total-head">
                          {t.cart.tableTotal}
                        </th>
                        <th className="pb-cart-table__remove-head" aria-hidden="true">
                          &nbsp;
                        </th>
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
                        const itemDescription =
                          locale === 'ar'
                            ? item.description_ar ?? item.description
                            : item.description ?? item.description_ar;
                        const salePercentage =
                          item.discount_percentage && item.discount_percentage > 0
                            ? Math.round(item.discount_percentage)
                            : hasSale && item.price > 0
                              ? Math.round(
                                  ((item.price - unitPrice) / item.price) * 100,
                                )
                              : 0;

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
                                <Link
                                  href={`/shop/${item.slug}`}
                                  className="pb-cart-table__image"
                                  aria-label={item.title}
                                >
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt=""
                                      width={150}
                                      height={150}
                                      className="h-full w-full object-contain rounded-md"
                                    />
                                  ) : (
                                    <span
                                      className="pb-cart-table__image-fallback"
                                      aria-hidden="true"
                                    >
                                      🧸
                                    </span>
                                  )}
                                </Link>
                                <div className="pb-cart-table__details">
                                  <Link
                                    href={`/shop/${item.slug}`}
                                    className="pb-cart-table__name"
                                  >
                                    {item.title}
                                  </Link>

                                  {itemDescription?.trim() && (
                                    <p className="pb-cart-table__description">
                                      {itemDescription.trim()}
                                    </p>
                                  )}

                                  {item.sku && (
                                    <p className="pb-cart-table__sku">
                                      <strong>{t.shopItemDetail.sku}:</strong>{' '}
                                      <span>{item.sku}</span>
                                    </p>
                                  )}

                                  {hasSale && salePercentage > 0 && (
                                    <p className="pb-cart-table__sale">
                                      <strong>{t.shopItem.sale}:</strong>{' '}
                                      <span>-{salePercentage}%</span>
                                    </p>
                                  )}

                                  <div className="pb-cart-table__qty-row">
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
                                  </div>

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
                              className="pb-cart-table__total-cell"
                              data-label={t.cart.tableTotal}
                            >
                              <span className="pb-cart-table__total-value">
                                {formatPriceDisplay(unitPrice * item.quantity, locale)}
                              </span>
                            </td>
                            <td
                              className="pb-cart-table__remove-cell"
                              data-label={t.cart.remove}
                            >
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
                  <h5>{formatPriceDisplay(total, locale)}</h5>
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
