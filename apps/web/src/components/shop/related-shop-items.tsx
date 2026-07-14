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
    <section className="pb-product-details-related">
      <div className="pb-product-details-related__header">
        <h2 className="pb-product-details-related__title">
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
