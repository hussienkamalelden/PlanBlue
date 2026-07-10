'use client';

import { PopularShopCarousel } from '@/components/home/popular-shop-carousel';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiShopItem } from '@/lib/types/strapi';

type RelatedShopItemsProps = {
  items: StrapiShopItem[];
  titleKey?: 'relatedItems' | 'youMayAlsoLike';
};

export function RelatedShopItems({
  items,
  titleKey = 'relatedItems',
}: RelatedShopItemsProps) {
  const t = useTranslations();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 pt-10">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">
        {t.shopItemDetail[titleKey]}
      </h2>
      <div className="popular-shop-carousel-wrap relative">
        <PopularShopCarousel items={items} disableLoop />
      </div>
    </section>
  );
}
