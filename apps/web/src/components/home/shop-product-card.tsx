'use client';

import Image from 'next/image';
import { SliderLink } from '@/components/ui/slider-link';

import {
  formatPriceWhole,
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
  const displayPrice =
    item.has_sale && salePrice !== null ? salePrice : basePrice;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100 transition-shadow hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] ${
        outOfStock ? 'opacity-80' : ''
      }`}
    >
      <SliderLink
        href={`/shop/${item.slug}`}
        className="flex h-full flex-col"
        aria-label={title}
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          {item.has_sale && item.discount_percentage > 0 && (
            <span className="absolute start-3 top-3 z-10 rounded-md bg-[#1e9922] px-2 py-1 text-xs font-semibold text-white">
              -{item.discount_percentage}%
            </span>
          )}

          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 z-10 bg-[#992127]/90 px-3 py-2 text-center text-sm font-semibold text-white">
              {t.shopItem.outOfStock}
            </span>
          )}
          <div className="flex flex-col h-full w-full items-center justify-center">
            {firstImage ? (
              <Image
                src={getMediaUrl(firstImage.url)}
                alt={firstImage.name || title}
                className="object-contain transition-transform duration-500 group-hover:scale-105 w-[80%] h-[80%] rounded-lg"
                width={100}
                height={100}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-neutral-300">
                🧸
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 text-start">
          <h3
            className="mb-2 line-clamp-1 text-base font-bold leading-snug  capitalize text-brand-primary md:text-lg"
            title={title}
          >
            {title}
          </h3>

          <div className="mt-auto flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-[#bd912c] md:text-xl">
              {formatPriceWhole(displayPrice, locale)}
            </span>
            {item.has_sale && salePrice !== null && (
              <del className="text-sm text-neutral-400">
                {formatPriceWhole(basePrice, locale)}
              </del>
            )}
          </div>
        </div>
      </SliderLink>
    </article>
  );
}
