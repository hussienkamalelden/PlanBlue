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
  const [categories, shopResult] = await Promise.all([
    fetchCategories(),
    fetchShopItems({ pageSize: 12 }),
  ]);

  const initialCategoryId =
    category && categories.some((item) => item.documentId === category)
      ? category
      : null;

  return (
    <>
      <div
        className="h-8 w-full bg-brand-primary sm:h-9"
        aria-hidden="true"
      />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <ShopView
          categories={categories}
          items={shopResult.data}
          initialCategoryId={initialCategoryId}
        />
      </main>
    </>
  );
}
