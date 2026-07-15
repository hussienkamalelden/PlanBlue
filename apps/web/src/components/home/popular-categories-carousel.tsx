'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SliderCarouselFrame } from '@/components/ui/slider-carousel-frame';
import { SliderLink } from '@/components/ui/slider-link';
import { HOME_CATEGORY_BORDER_CLASSES } from '@/lib/assets/home-categories';
import { getMediaUrl } from '@/lib/api/strapi';
import { useSliderDirection } from '@/lib/hooks/use-slider-direction';
import type { Locale } from '@/lib/i18n/config';
import { useSliderSwiperProps } from '@/lib/shop/slider-drag-guard';
import { buildInfiniteSliderItems } from '@/lib/shop/slider-loop';
import { SLIDER_AUTOPLAY_OPTIONS, SLIDER_TOUCH_OPTIONS } from '@/lib/shop/slider-touch';
import type { StrapiCategory } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

import 'swiper/css';

const MAX_SLIDES_PER_VIEW = 6;
const MIN_LOOP_SLIDES = MAX_SLIDES_PER_VIEW * 3;

type PopularCategoriesCarouselProps = {
  categories: StrapiCategory[];
};

function PopularCategoriesCarouselInner({
  categories,
}: PopularCategoriesCarouselProps) {
  const locale = useLocaleStore((state) => state.locale);
  const direction = useSliderDirection();
  const sliderDragProps = useSliderSwiperProps();

  const loopSlides = useMemo(
    () => buildInfiniteSliderItems(categories, MIN_LOOP_SLIDES),
    [categories],
  );

  const breakpoints = useMemo(
    () => ({
      0: { slidesPerView: 2, spaceBetween: 12 },
      480: { slidesPerView: 2.25, spaceBetween: 14 },
      640: { slidesPerView: 3, spaceBetween: 18 },
      1024: { slidesPerView: 4, spaceBetween: 22 },
      1280: { slidesPerView: 5, spaceBetween: 28 },
    }),
    [],
  );

  return (
    <Swiper
      key={`popular-categories-${direction}`}
      dir={direction}
      modules={[Autoplay]}
      {...SLIDER_TOUCH_OPTIONS}
      {...sliderDragProps}
      autoplay={SLIDER_AUTOPLAY_OPTIONS}
      loop
      loopAdditionalSlides={MAX_SLIDES_PER_VIEW}
      watchSlidesProgress
      breakpoints={breakpoints}
      className="pb-popular-categories-swiper"
    >
      {loopSlides.map(({ data, slideKey, sourceIndex }) => (
        <SwiperSlide key={slideKey} className="!h-auto">
          <CategoryCard category={data} index={sourceIndex} locale={locale} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function PopularCategoriesCarousel({
  categories,
}: PopularCategoriesCarouselProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <SliderCarouselFrame>
      <PopularCategoriesCarouselInner categories={categories} />
    </SliderCarouselFrame>
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
        <SliderLink
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
                className="h-full w-full rounded-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-100 text-4xl text-neutral-300">
                🧸
              </div>
            )}
          </figure>
          <h4 className="pb-category-block__title">
            {title}
          </h4>
        </SliderLink>
      </div>
    </article>
  );
}
