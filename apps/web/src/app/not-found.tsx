import Image from 'next/image';
import Link from 'next/link';

import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="pb-large-container flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Image
        src="/images/global/not_found.png"
        alt=""
        width={480}
        height={320}
        priority
        className="mb-8 h-auto w-full max-w-[500px]"
        aria-hidden="true"
      />

      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        {t.notFoundPage.title}
      </h1>

      <p className="mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
        {t.notFoundPage.description}
      </p>

      <Link href="/" className="pb-theme-btn mt-8">
        {t.notFoundPage.backHome}
      </Link>
    </main>
  );
}
