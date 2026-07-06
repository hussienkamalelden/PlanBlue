'use client';

import { useTranslations } from '@/lib/i18n/use-translations';

export function PopularShopHeading() {
  const t = useTranslations();

  return (
    <div className="mb-10">
      <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl">
        {t.home.popular.title}{' '}
        <span className="text-[#4389F7]">{t.home.popular.highlight}</span>
      </h2>
    </div>
  );
}
