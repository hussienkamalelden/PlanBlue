'use client';

import { useTranslations } from '@/lib/i18n/use-translations';

export function PopularCategoriesHeading() {
  const t = useTranslations();

  return (
    <div className="mb-10 md:mb-12">
      <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl">
        {t.home.popularCategories.title}{' '}
        <span className="text-[#4389F7]">
          {t.home.popularCategories.highlight}
        </span>
      </h2>
    </div>
  );
}
