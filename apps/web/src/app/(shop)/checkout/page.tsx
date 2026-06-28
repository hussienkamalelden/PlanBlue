"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/use-translations";

export default function CheckoutPage() {
  const t = useTranslations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-bold text-neutral-900">
        {t.checkout.title}
      </h1>
      <p className="text-sm text-neutral-600">{t.checkout.placeholder}</p>
      <Link
        href="/products"
        className="mt-8 inline-flex rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        {t.cart.continueShopping}
      </Link>
    </main>
  );
}
