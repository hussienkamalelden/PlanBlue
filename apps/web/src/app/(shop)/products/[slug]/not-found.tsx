import Link from "next/link";

import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ProductNotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">
        {t.productDetail.notFound}
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-600">
        {t.productDetail.notFoundDescription}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        {t.productDetail.backToProducts}
      </Link>
    </main>
  );
}
