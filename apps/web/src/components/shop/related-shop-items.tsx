'use client';

import { ShopItemCard } from '@/components/shop/shop-item-card';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiShopItem } from '@/lib/types/strapi';

type RelatedShopItemsProps = {
  items: StrapiShopItem[];
};

export function RelatedShopItems({ items }: RelatedShopItemsProps) {
  const t = useTranslations();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 pt-10">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">
        {t.shopItemDetail.relatedItems}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.documentId}>
            <ShopItemCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
