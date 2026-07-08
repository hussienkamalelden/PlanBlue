'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  formatPrice,
  getFirstShopItemImage,
  getMediaUrl,
  getShopItemPrices,
} from '@/lib/api/strapi';
import type { Locale } from '@/lib/i18n/config';
import { useTranslations } from '@/lib/i18n/use-translations';
import { isShopItemOutOfStock } from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';

type ShopProductCardProps = {
  item: StrapiShopItem;
  locale: Locale;
};

export function ShopProductCard({ item, locale }: ShopProductCardProps) {
  const t = useTranslations();

  const title = locale === 'ar' ? item.title_ar : item.title;
  const { basePrice, salePrice } = getShopItemPrices(item);
  const firstImage = getFirstShopItemImage(item.media);
  const outOfStock = isShopItemOutOfStock(item);

  return (
    <Link
      href={`/shop/${item.slug}`}
      className="group block h-full transition-opacity hover:opacity-95"
      aria-label={title}
    >
      <article className="flex h-full flex-col overflow-hidden border border-dashed border-neutral-300 bg-white px-6 pb-4 pt-8 text-center transition-shadow hover:border-[#4389F7] hover:shadow-md">
        <div className="mx-auto mb-6 h-[235px] w-full max-w-[235px] shrink-0">
          {item.has_sale && item.discount_percentage > 0 && (
            <span className="absolute start-0 top-0 z-10 bg-[#27D82E]/15 px-2.5 py-1 text-md font-semibold text-[#27D82E]">
              {item.discount_percentage}% {t.shopItem.sale}
            </span>
          )}

          {outOfStock && (
            <span className="absolute end-0 top-0 z-10 bg-[#E42932]/15 px-2.5 py-1 text-md font-semibold text-[#E42932]">
              {t.shopItem.outOfStock}
            </span>
          )}

          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            {firstImage ? (
              <Image
                src={getMediaUrl(firstImage.url)}
                alt={firstImage.name || title}
                width={235}
                height={235}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-100 text-4xl text-neutral-300">
                🧸
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-white">
          <h3 className="mb-1 line-clamp-2 min-h-[2.75rem] text-lg font-bold capitalize leading-snug text-neutral-900 transition-colors group-hover:text-[#4389F7]">
            {title}
          </h3>

          <div className="mb-4 flex items-center justify-center gap-2">
            {item.has_sale && salePrice !== null ? (
              <>
                <span className="text-lg font-bold text-[#27D82E]">
                  {formatPrice(salePrice, locale)}
                </span>
                <del className="text-sm text-neutral-400">
                  {formatPrice(basePrice, locale)}
                </del>
              </>
            ) : (
              <span className="text-lg font-bold text-neutral-900">
                {formatPrice(basePrice, locale)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
