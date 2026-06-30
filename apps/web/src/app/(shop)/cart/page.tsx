"use client";

import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/lib/cart/cart-store";
import { formatPrice } from "@/lib/api/strapi";
import { interpolate } from "@/lib/i18n/dictionary";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useLocaleStore } from "@/stores/locale-store";

export default function CartPage() {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const items = useCartStore((state) => state.items);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const total = items.reduce((sum, item) => {
    const unitPrice =
      item.has_sale && item.discountPrice !== null
        ? item.discountPrice
        : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const hasStockIssue = items.some(
    (item) => item.quantity > item.stockQuantity,
  );

  function handleClearCart() {
    clearCart();
    setShowClearConfirm(false);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900">{t.cart.title}</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center">
          <p className="text-sm text-neutral-600">{t.cart.empty}</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart items */}
          <ul className="space-y-4">
            {items.map((item) => {
              const unitPrice =
                item.has_sale && item.discountPrice !== null
                  ? item.discountPrice
                  : item.price;
              const exceedsStock = item.quantity > item.stockQuantity;

              return (
                <li
                  key={item.documentId}
                  className={`rounded-xl border bg-white p-5 ${
                    exceedsStock
                      ? "border-amber-300 bg-amber-50/50"
                      : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-base font-semibold text-neutral-900 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm text-neutral-500">
                        {formatPrice(unitPrice, locale)} × {item.quantity}
                      </p>

                      {exceedsStock && (
                        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                          {interpolate(t.cart.stockWarning, {
                            stock: item.stockQuantity,
                            quantity: item.quantity,
                          })}
                        </p>
                      )}
                    </div>

                    <p className="text-base font-bold text-neutral-900">
                      {formatPrice(unitPrice * item.quantity, locale)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? setItemQuantity(item.documentId, item.quantity - 1)
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
                        disabled={item.quantity >= item.stockQuantity}
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

          {/* Summary and actions */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
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
                href={hasStockIssue ? "#" : "/checkout"}
                onClick={(e) => {
                  if (hasStockIssue) e.preventDefault();
                }}
                className={`flex-1 rounded-lg px-6 py-3 text-center text-sm font-semibold text-white transition-colors ${
                  hasStockIssue
                    ? "cursor-not-allowed bg-neutral-300 text-neutral-500"
                    : "bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                {t.cart.proceedToCheckout}
              </Link>

              <Link
                href="/products"
                className="flex-1 rounded-lg border border-neutral-200 px-6 py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                {t.cart.continueShopping}
              </Link>
            </div>

            {/* Clear cart */}
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
                  <p className="text-xs text-neutral-600">{t.cart.clearConfirm}</p>
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
    </main>
  );
}
