import { notFound } from 'next/navigation';

import { ShopItemDetailView } from '@/components/shop/shop-item-detail-view';
import {
  fetchRelatedShopItems,
  fetchShopItemBySlug,
} from '@/lib/api/strapi.server';

type ShopItemDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ShopItemDetailPage({
  params,
}: ShopItemDetailPageProps) {
  const { slug } = await params;

  const item = await fetchShopItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await fetchRelatedShopItems(item);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ShopItemDetailView item={item} relatedItems={relatedItems} />
    </main>
  );
}
