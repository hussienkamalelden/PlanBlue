'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import { HOME_CATEGORY_BORDER_CLASSES } from '@/lib/assets/home-categories';
import { getMediaUrl } from '@/lib/api/strapi';
import { getLocaleDirection, type Locale } from '@/lib/i18n/config';
import type { StrapiCategory } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

import 'swiper/css';

type PopularCategoriesCarouselProps = {
  categories: StrapiCategory[];
};

export function PopularCategoriesCarousel({
  categories,
}: PopularCategoriesCarouselProps) {
  const locale = useLocaleStore((state) => state.locale);
  const direction = getLocaleDirection(locale);

  const breakpoints = useMemo(
    () => ({
      0: { slidesPerView: 2, spaceBetween: 16 },
      640: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 4, spaceBetween: 24 },
      1280: { slidesPerView: 5, spaceBetween: 28 },
      1536: { slidesPerView: 6, spaceBetween: 32 },
    }),
    [],
  );

  if (categories.length === 0) {
    return null;
  }

  return (
    <Swiper
      dir={direction}
      breakpoints={breakpoints}
      className="pb-popular-categories-swiper"
    >
      {categories.map((category, index) => (
        <SwiperSlide key={category.documentId} className="!h-auto">
          <CategoryCard category={category} index={index} locale={locale} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function CategoryCard({
  category,
  index,
  locale,
}: {
  category: StrapiCategory;
  index: number;
  locale: Locale;
}) {
  const title = locale === 'ar' ? category.title_ar : category.title;
  const borderClass =
    HOME_CATEGORY_BORDER_CLASSES[index % HOME_CATEGORY_BORDER_CLASSES.length];

  return (
    <article className={`pb-category-block ${borderClass}`}>
      <div className="pb-category-block__inner">
        <Link
          href={`/shop?category=${category.documentId}`}
          className="group block text-center"
          aria-label={title}
        >
          <figure className="pb-category-block__image-box">
            {category.image ? (
              <Image
                src={getMediaUrl(category.image.url)}
                alt={category.image.name || title}
                width={250}
                height={250}
                className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-100 text-4xl text-neutral-300">
                🧸
              </div>
            )}
          </figure>
          <h4 className="text-lg font-bold leading-6 text-neutral-900 transition-colors group-hover:text-[#4389F7] md:text-xl md:leading-6">
            {title}
          </h4>
        </Link>
      </div>
    </article>
  );
}
