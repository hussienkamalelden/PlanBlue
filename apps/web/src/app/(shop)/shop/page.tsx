import { ShopView } from '@/components/shop/shop-view';
import { fetchCategories, fetchShopItems } from '@/lib/api/strapi.server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const [categories, shopResult] = await Promise.all([
    fetchCategories(),
    fetchShopItems({ pageSize: 12, search: search?.trim() || undefined }),
  ]);

  const initialCategoryId =
    category && categories.some((item) => item.documentId === category)
      ? category
      : null;

  return (
    <>
      <div
        className="h-20 w-full bg-brand-primary md:h-40 opacity-80"
        aria-hidden="true"
        style={{
          backgroundImage: `url(/images/shop/shop_banner.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <main className="relative pb-large-container py-10">
        <div className="pb-shop-page" />
        <ShopView
          categories={categories}
          items={shopResult.data}
          initialCategoryId={initialCategoryId}
          initialSearch={search?.trim() ?? ''}
        />
      </main>
    </>
  );
}
