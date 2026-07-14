import { ShopView } from '@/components/shop/shop-view';
import { fetchCategories, fetchShopItems } from '@/lib/api/strapi.server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, items] = await Promise.all([
    fetchCategories(),
    fetchShopItems(),
  ]);

  const initialCategoryId =
    category && categories.some((item) => item.documentId === category)
      ? category
      : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ShopView
        categories={categories}
        items={items}
        initialCategoryId={initialCategoryId}
      />
    </main>
  );
}
