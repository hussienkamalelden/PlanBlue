"use client";

import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale/locale-switcher";
import { useCartStore } from "@/lib/cart/cart-store";
import { useTranslations } from "@/lib/i18n/use-translations";

export function SiteHeader() {
  const t = useTranslations();
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            {t.common.brand}
          </Link>
          <p className="text-xs text-neutral-500">{t.common.tagline}</p>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            {t.header.products}
          </Link>
          <Link
            href="/cart"
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            {t.header.cart}
            {itemCount > 0 && (
              <span className="ms-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-neutral-900 px-1.5 py-0.5 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
