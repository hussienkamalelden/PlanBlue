'use client';

import { useEffect, useState } from 'react';

import { RelatedShopItems } from '@/components/shop/related-shop-items';
import type { StrapiShopItem } from '@/lib/types/strapi';

export function CartTopSellers() {
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
    <div className="mt-12">
      <RelatedShopItems items={items} titleKey="youMayAlsoLikeSection" />
    </div>
  );
}
