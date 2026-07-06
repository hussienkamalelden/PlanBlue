'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

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
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const breakpoints = useMemo(
    () => ({
      0: { slidesPerView: 1, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      1024: { slidesPerView: 3, spaceBetween: 0 },
      1280: { slidesPerView: 4, spaceBetween: 0 },
    }),
    [],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="popular-shop-nav-wrap relative">
      <div className="popular-shop-owl-nav pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 min-[1201px]:block">
        <button
          ref={prevRef}
          type="button"
          className="popular-shop-nav-btn popular-shop-nav-prev pointer-events-auto"
          aria-label="Previous slide"
        >
          <span className="icon-21" aria-hidden="true" />
        </button>
        <button
          ref={nextRef}
          type="button"
          className="popular-shop-nav-btn popular-shop-nav-next pointer-events-auto"
          aria-label="Next slide"
        >
          <span className="icon-20" aria-hidden="true" />
        </button>
      </div>

      <Swiper
        dir={direction}
        modules={[Navigation]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper: SwiperType) => {
          if (
            !swiper.params.navigation ||
            typeof swiper.params.navigation === 'boolean'
          ) {
            return;
          }

          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onInit={(swiper: SwiperType) => {
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        breakpoints={breakpoints}
        className="popular-shop-swiper "
      >
        {items.map((item) => (
          <SwiperSlide key={item.documentId} className="!h-auto">
            <CarouselCard item={item} locale={locale} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
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
    <article className="group flex h-full flex-col overflow-hidden border border-dashed border-neutral-300 bg-white px-6 pb-4 pt-8 text-center transition-shadow hover:border-[#4389F7] hover:shadow-md">
      <div className="mx-auto mb-6 h-[235px] w-full max-w-[235px] shrink-0">
        {item.has_sale && item.discount_percentage > 0 && (
          <span className="absolute start-0 top-0 z-10  bg-[#27D82E]/15 px-2.5 py-1 text-md font-semibold text-[#27D82E]">
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
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-100 text-4xl text-neutral-300">
              🧸
            </div>
          )}
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 flex-col bg-white transition-all duration-500 ease-in-out group-hover:-mt-[73px] group-hover:pb-[90px]">
        <h3 className="mb-1 line-clamp-2 min-h-[2.75rem] text-lg capitalize font-bold leading-snug text-neutral-900">
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

        <div className="absolute bottom-10 left-0 w-full scale-x-0 opacity-0 transition-all duration-500 ease-in-out group-hover:scale-x-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || isAdded}
            className={`w-full rounded-full border-2 px-6 py-2.5 text-sm font-bold transition-colors ${
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
      </div>
    </article>
  );
}
