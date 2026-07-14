'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  formatPrice,
  getFirstShopItemImage,
  getMediaUrl,
  getShopItemPrices,
} from '@/lib/api/strapi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { isShopItemOutOfStock } from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

type ShopItemCardProps = {
  item: StrapiShopItem;
  showDescription?: boolean;
};

export function ShopItemCard({
  item,
  showDescription = false,
}: ShopItemCardProps) {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const { basePrice, salePrice } = getShopItemPrices(item);
  const unavailable = isShopItemOutOfStock(item);
  const title = locale === 'ar' ? item.title_ar : item.title;
  const firstImage = getFirstShopItemImage(item.media);

  return (
    <Link
      href={`/shop/${item.slug}`}
      className={`group block h-full transition-opacity hover:opacity-90 ${
        unavailable ? 'opacity-50' : ''
      }`}
      aria-label={title}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square bg-neutral-100">
          {firstImage ? (
            <Image
              src={getMediaUrl(firstImage.url)}
              alt={firstImage.name || title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-neutral-300">
              🧸
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {item.has_sale && salePrice !== null && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                  {t.shopItem.sale}
                </span>
              )}
              {unavailable && (
                <span className="max-w-[9.5rem] rounded-full bg-neutral-100 px-2.5 py-1 text-center text-[11px] font-medium leading-tight text-neutral-600">
                  {t.shopItem.outOfStock}
                </span>
              )}
            </div>
          </div>

          {showDescription && (
            <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">
              {locale === 'ar' ? item.description_ar : item.description}
            </p>
          )}

          <div
            className={`${showDescription ? 'mt-auto' : 'mt-0'} space-y-2 border-t border-neutral-100 pt-4`}
          >
            <div className="flex items-baseline gap-2">
              {item.has_sale && salePrice !== null ? (
                <>
                  <span className="text-xl font-bold text-red-600">
                    {formatPrice(salePrice, locale)}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(basePrice, locale)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-neutral-900">
                  {formatPrice(basePrice, locale)}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
