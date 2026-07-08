'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { HOME_CATEGORY_BORDER_CLASSES } from '@/lib/assets/home-categories';
import { getMediaUrl } from '@/lib/api/strapi';
import { useSliderDirection } from '@/lib/hooks/use-slider-direction';
import type { Locale } from '@/lib/i18n/config';
import { buildInfiniteSliderItems } from '@/lib/shop/slider-loop';
import type { StrapiCategory } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

import 'swiper/css';

const MAX_SLIDES_PER_VIEW = 6;
const MIN_LOOP_SLIDES = MAX_SLIDES_PER_VIEW * 3;

type PopularCategoriesCarouselProps = {
  categories: StrapiCategory[];
};

export function PopularCategoriesCarousel({
  categories,
}: PopularCategoriesCarouselProps) {
  const locale = useLocaleStore((state) => state.locale);
  const direction = useSliderDirection();

  const loopSlides = useMemo(
    () => buildInfiniteSliderItems(categories, MIN_LOOP_SLIDES),
    [categories],
  );

  const breakpoints = useMemo(
    () => ({
      0: { slidesPerView: 2, spaceBetween: 16 },
      640: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 4, spaceBetween: 24 },
      1280: { slidesPerView: 5, spaceBetween: 28 },
      1536: { slidesPerView: MAX_SLIDES_PER_VIEW, spaceBetween: 32 },
    }),
    [],
  );

  if (categories.length === 0) {
    return null;
  }

  return (
    <Swiper
      key={`popular-categories-${direction}`}
      dir={direction}
      modules={[Autoplay]}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop
      loopAdditionalSlides={MAX_SLIDES_PER_VIEW}
      watchSlidesProgress
      breakpoints={breakpoints}
      className="pb-popular-categories-swiper"
    >
      {loopSlides.map(({ data, slideKey, sourceIndex }) => (
        <SwiperSlide key={slideKey} className="!h-auto">
          <CategoryCard
            category={data}
            index={sourceIndex}
            locale={locale}
          />
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
