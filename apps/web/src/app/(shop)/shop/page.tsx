import { ShopView } from '@/components/shop/shop-view';
import { fetchCategories, fetchShopItems } from '@/lib/api/strapi.server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
};

export default async function ShopPage() {
  const [categories, items] = await Promise.all([
    fetchCategories(),
    fetchShopItems(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ShopView categories={categories} items={items} />
    </main>
  );
}
