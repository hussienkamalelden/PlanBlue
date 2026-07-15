'use client';

import { useTranslations } from '@/lib/i18n/use-translations';

export function TopSellingShopHeading() {
  const t = useTranslations();

  return (
    <div className="pb-home-section-heading">
      <h2 className="pb-home-section-heading__title">
        {t.home.topSelling.title}{' '}
        <span className="text-[#4389F7]">{t.home.topSelling.highlight}</span>
      </h2>
    </div>
  );
}
