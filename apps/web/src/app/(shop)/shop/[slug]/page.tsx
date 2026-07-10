import { notFound } from 'next/navigation';

import { ShopItemDetailView } from '@/components/shop/shop-item-detail-view';
import { ShopPageBanner } from '@/components/shop/shop-page-banner';
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
    <>
      <ShopPageBanner />
      <main className="relative pb-large-container py-10">
        <div className="pb-shop-page" />
        <ShopItemDetailView
          item={item}
          relatedItems={relatedItems}
          youMayAlsoLikeItems={filteredYouMayAlsoLikeItems}
        />
      </main>
    </>
  );
}
