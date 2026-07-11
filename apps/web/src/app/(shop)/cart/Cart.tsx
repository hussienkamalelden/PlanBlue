'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  CartItemValidationMessages,
  CartValidationBanner,
} from '@/components/shop/cart-validation-messages';
import { CartTopSellers } from '@/components/shop/cart-top-sellers';
import { ShopPageShell } from '@/components/shop/shop-page-shell';
import { useCartValidation } from '@/lib/cart/use-cart-validation';
import { useCartStore } from '@/lib/cart/cart-store';
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
  const clearCart = useCartStore((state) => state.clearCart);
  const { status, validation, isBlocked } = useCartValidation();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const total = items.reduce((sum, item) => {
    const unitPrice =
      item.has_sale && item.discountPrice !== null
        ? item.discountPrice
        : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  function handleClearCart() {
    clearCart();
    setShowClearConfirm(false);
  }

  function itemHasIssue(documentId: string): boolean {
    const itemValidation = getItemValidation(validation, documentId);
    return itemValidation !== null && !itemValidation.valid;
  }

  return (
    <ShopPageShell bannerSrc="/images/cart/banner.png">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900">
        {t.cart.title}
      </h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center">
          <p className="text-sm text-neutral-600">{t.cart.empty}</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <CartValidationBanner status={status} validation={validation} />

          <ul className="space-y-4">
            {items.map((item) => {
              const unitPrice =
                item.has_sale && item.discountPrice !== null
                  ? item.discountPrice
                  : item.price;
              const hasIssue = itemHasIssue(item.documentId);

              return (
                <li
                  key={item.documentId}
                  className={`rounded-xl border bg-white p-5 ${
                    hasIssue
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="text-base font-semibold text-neutral-900 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm text-neutral-500">
                        {formatPrice(unitPrice, locale)} × {item.quantity}
                      </p>

                      <CartItemValidationMessages
                        documentId={item.documentId}
                        item={item}
                        validation={validation}
                        locale={locale}
                      />
                    </div>

                    <p className="text-base font-bold text-neutral-900">
                      {formatPrice(unitPrice * item.quantity, locale)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? setItemQuantity(
                                item.documentId,
                                item.quantity - 1,
                              )
                            : removeItem(item.documentId)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setItemQuantity(item.documentId, item.quantity + 1)
                        }
                        disabled={
                          isBlocked ||
                          item.quantity >= item.stockQuantity
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.documentId)}
                      className="text-xs font-medium text-red-600 transition-colors hover:text-red-800"
                    >
                      {t.cart.remove}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className={`rounded-xl border bg-white p-6 ${
              isBlocked ? 'border-amber-200 opacity-95' : 'border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between text-base">
              <span className="text-neutral-600">
                {t.cart.total} ({items.length} {t.cart.items})
              </span>
              <span className="text-xl font-bold text-neutral-900">
                {formatPrice(total, locale)}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={isBlocked ? '#' : '/checkout'}
                onClick={(e) => {
                  if (isBlocked) e.preventDefault();
                }}
                aria-disabled={isBlocked}
                className={`flex-1 rounded-lg px-6 py-3 text-center text-sm font-semibold text-white transition-colors ${
                  isBlocked
                    ? 'cursor-not-allowed bg-neutral-300 text-neutral-500'
                    : 'bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                {t.cart.proceedToCheckout}
              </Link>

              <Link
                href="/shop"
                className="flex-1 rounded-lg border border-neutral-200 px-6 py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                {t.cart.continueShopping}
              </Link>
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-4">
              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs font-medium text-red-600 transition-colors hover:text-red-800"
                >
                  {t.cart.clearCart}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-neutral-600">
                    {t.cart.clearConfirm}
                  </p>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                  >
                    {t.cart.clearCart}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CartTopSellers />
    </ShopPageShell>
  );
}
