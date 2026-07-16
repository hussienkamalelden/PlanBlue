import { ShopPageBanner } from '@/components/shop/shop-page-banner';
import { ShopView } from '@/components/shop/shop-view';
import { fetchCategories, fetchShopItems } from '@/lib/api/strapi.server';
import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.shop.title,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const trimmedSearch = search?.trim() || undefined;

  const [categories, shopResult, allItemsResult] = await Promise.all([
    fetchCategories(),
    fetchShopItems({
      pageSize: 12,
      search: trimmedSearch,
      categoryIds: category ? [category] : undefined,
    }),
    fetchShopItems({ pageSize: 100 }),
  ]);

  const initialCategoryIds = category && categories.some((item) => item.documentId === category)
    ? [category]
    : [];

  const viewKey = `${trimmedSearch ?? ''}_${category ?? ''}`;

  return (
    <>
      <ShopPageBanner />
      <main className="relative pb-large-container py-10">
        <div className="pb-shop-page" />
        <ShopView
          key={viewKey}
          categories={categories}
          items={shopResult.data}
          allItems={allItemsResult.data}
          initialCategoryIds={initialCategoryIds}
          initialSearch={trimmedSearch ?? ''}
        />
      </main>
    </>
  );
}
