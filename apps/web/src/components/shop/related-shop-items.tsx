'use client';

import { PopularShopCarousel } from '@/components/home/popular-shop-carousel';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiShopItem } from '@/lib/types/strapi';

type RelatedShopItemsProps = {
  items: StrapiShopItem[];
  titleKey?: 'relatedSection' | 'youMayAlsoLikeSection';
};

export function RelatedShopItems({
  items,
  titleKey = 'relatedSection',
}: RelatedShopItemsProps) {
  const t = useTranslations();
  const section = t.shopItemDetail[titleKey];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 pt-10">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl">
          {section.title}{' '}
          <span className="text-[#4389F7]">{section.highlight}</span>
        </h2>
      </div>
      <div className="popular-shop-carousel-wrap relative">
        <PopularShopCarousel items={items} disableLoop />
      </div>
    </section>
  );
}
