import Link from "next/link";

import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{t.home.title}</h1>
      <p className="mt-4 max-w-md text-neutral-600">{t.home.description}</p>
      <Link
        href="/products"
        className="mt-8 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        {t.home.cta}
      </Link>
    </main>
  );
}
