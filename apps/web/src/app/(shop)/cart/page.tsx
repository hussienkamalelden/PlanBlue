"use client";

import Link from "next/link";

import { useCartStore } from "@/lib/cart/cart-store";
import { formatPrice } from "@/lib/api/strapi";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useLocaleStore } from "@/stores/locale-store";

export default function CartPage() {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const items = useCartStore((state) => state.items);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
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
        <ul className="space-y-4">
          {items.map((item) => {
            const unitPrice =
              item.has_sale && item.discountPrice !== null
                ? item.discountPrice
                : item.price;

            return (
              <li
                key={item.documentId}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <Link
                    href={`/products/${item.documentId}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    {item.quantity} × {formatPrice(unitPrice, locale)}
                  </p>
                </div>
                <p className="font-semibold text-neutral-900">
                  {formatPrice(unitPrice * item.quantity, locale)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
