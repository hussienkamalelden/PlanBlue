'use client';

import { useEffect, useState } from 'react';

import { PopularShopCarousel } from '@/components/home/popular-shop-carousel';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiShopItem } from '@/lib/types/strapi';

export function CartTopSellers() {
  const t = useTranslations();
  const [items, setItems] = useState<StrapiShopItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/shop/items?pageSize=12&sort=total_sold:desc');
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.data ?? []);
      } catch {
        // silently fail
      }
    }
    load();
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">
        {t.cart.topSellers}
      </h2>
      <div className="popular-shop-carousel-wrap relative">
        <PopularShopCarousel items={items} />
      </div>
    </section>
  );
}
