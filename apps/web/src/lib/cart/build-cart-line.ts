import {
  getFirstShopItemImage,
  getMediaUrl,
  getShopItemPrices,
} from '@/lib/api/strapi';
import { getStockQuantity } from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';

import type { CartLineItem } from './cart-store';

export function buildCartLineFromShopItem(
  item: StrapiShopItem,
  quantity: number,
): CartLineItem {
  const { basePrice, salePrice } = getShopItemPrices(item);
  const firstImage = getFirstShopItemImage(item.media);

  return {
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    quantity,
    price: basePrice,
    discountPrice: salePrice,
    has_sale: item.has_sale,
    stockQuantity: getStockQuantity(item),
    imageUrl: firstImage ? getMediaUrl(firstImage.url) : null,
    description: item.description,
    description_ar: item.description_ar,
    sku: item.sku ?? null,
    discount_percentage: item.discount_percentage,
    need_batteries: item.need_batteries,
  };
}
