'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import {
  formatPrice,
  getFirstShopItemImage,
  getMediaUrl,
  getShopItemPrices,
} from '@/lib/api/strapi';
import { useCartStore } from '@/lib/cart/cart-store';
import { getLocaleDirection, type Locale } from '@/lib/i18n/config';
import { useTranslations } from '@/lib/i18n/use-translations';
import { isShopItemOutOfStock } from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

import 'swiper/css';
import 'swiper/css/navigation';

type PopularShopCarouselProps = {
  items: StrapiShopItem[];
};

export function PopularShopCarousel({ items }: PopularShopCarouselProps) {
  const locale = useLocaleStore((state) => state.locale);
  const direction = getLocaleDirection(locale);

  const breakpoints = useMemo(
    () => ({
      0: { slidesPerView: 1, spaceBetween: 16 },
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
      1280: { slidesPerView: 4, spaceBetween: 24 },
    }),
    [],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <Swiper
      dir={direction}
      modules={[Navigation]}
      navigation
      breakpoints={breakpoints}
      className="popular-shop-swiper !overflow-visible"
    >
      {items.map((item) => (
        <SwiperSlide key={item.documentId} className="!h-auto">
          <CarouselCard item={item} locale={locale} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function CarouselCard({
  item,
  locale,
}: {
  item: StrapiShopItem;
  locale: Locale;
}) {
  const t = useTranslations();
  const addItem = useCartStore((state) => state.addItem);
  const inCart = useCartStore((state) => state.isInCart(item.documentId));
  const [added, setAdded] = useState(false);

  const title = locale === 'ar' ? item.title_ar : item.title;
  const { basePrice, salePrice } = getShopItemPrices(item);
  const firstImage = getFirstShopItemImage(item.media);
  const outOfStock = isShopItemOutOfStock(item);
  const isAdded = added || inCart;

  function handleAddToCart() {
    if (outOfStock || isAdded) {
      return;
    }

    addItem({
      documentId: item.documentId,
      slug: item.slug,
      title: item.title,
      quantity: 1,
      price: basePrice,
      discountPrice: salePrice,
      has_sale: item.has_sale,
      stockQuantity: item.available_stock,
    });
    setAdded(true);
  }

  return (
    <article className="flex h-full flex-col rounded-[10px] border border-dashed border-neutral-300 bg-white px-6 pb-4 pt-8 text-center transition-shadow hover:shadow-md">
      <div className="relative mx-auto mb-6 h-[235px] w-full max-w-[235px] shrink-0">
        {item.has_sale && item.discount_percentage > 0 && (
          <span className="absolute start-0 top-0 z-10 rounded-full bg-[#4389F7]/15 px-2.5 py-1 text-xs font-semibold text-[#4389F7]">
            {item.discount_percentage}% {t.shopItem.sale}
          </span>
        )}

        <Link
          href={`/shop/${item.slug}`}
          className="flex h-full w-full items-center justify-center overflow-hidden"
        >
          {firstImage ? (
            <Image
              src={getMediaUrl(firstImage.url)}
              alt={firstImage.name || title}
              width={235}
              height={235}
              className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-100 text-4xl text-neutral-300">
              🧸
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-3 line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-neutral-900">
          <Link
            href={`/shop/${item.slug}`}
            className="transition-colors hover:text-[#4389F7]"
          >
            {title}
          </Link>
        </h3>

        <div className="mb-4 flex items-center justify-center gap-2">
          {item.has_sale && salePrice !== null ? (
            <>
              <span className="text-lg font-bold text-[#4389F7]">
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

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock || isAdded}
          className={`mt-auto rounded-full border-2 px-6 py-2.5 text-sm font-bold transition-colors ${
            isAdded
              ? 'cursor-default border-neutral-200 bg-neutral-100 text-neutral-500'
              : 'border-dashed border-[#4389F7] bg-white text-[#4389F7] hover:bg-[#4389F7] hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-white disabled:hover:text-neutral-400'
          }`}
        >
          {outOfStock
            ? t.shopItem.outOfStock
            : isAdded
              ? t.shopItemDetail.addedToCart
              : t.shopItemDetail.addToCart}
        </button>
      </div>
    </article>
  );
}
