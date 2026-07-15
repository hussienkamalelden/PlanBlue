import { notFound } from 'next/navigation';

import { ShopItemDetailView } from '@/components/shop/shop-item-detail-view';
import { ShopPageBanner } from '@/components/shop/shop-page-banner';
import {
  fetchMostViewedShopItems,
  fetchRelatedShopItems,
  fetchShopItemBySlug,
} from '@/lib/api/strapi.server';
import { getLocale } from '@/lib/i18n/get-locale';
import {
  buildProductJsonLd,
  buildProductMetadata,
} from '@/lib/seo/metadata';

import type { Metadata } from 'next';

type ShopItemDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ShopItemDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [item, locale] = await Promise.all([
    fetchShopItemBySlug(slug),
    getLocale(),
  ]);

  if (!item) {
    return {};
  }

  return buildProductMetadata(item, locale);
}

export default async function ShopItemDetailPage({
  params,
}: ShopItemDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();

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

  const productJsonLd = buildProductJsonLd(item, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ShopPageBanner />
      <main className="relative pb-medium-container pb-product-details-page py-10">
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
