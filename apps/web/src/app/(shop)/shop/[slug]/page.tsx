import { notFound } from 'next/navigation';

import { ShopItemDetailView } from '@/components/shop/shop-item-detail-view';
import {
  fetchMostViewedShopItems,
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

  const [relatedItems, youMayAlsoLikeItems] = await Promise.all([
    fetchRelatedShopItems(item),
    fetchMostViewedShopItems(item),
  ]);

  const relatedIds = new Set(relatedItems.map((relatedItem) => relatedItem.documentId));
  const filteredYouMayAlsoLikeItems = youMayAlsoLikeItems.filter(
    (shopItem) => !relatedIds.has(shopItem.documentId),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ShopItemDetailView
        item={item}
        relatedItems={relatedItems}
        youMayAlsoLikeItems={filteredYouMayAlsoLikeItems}
      />
    </main>
  );
}
