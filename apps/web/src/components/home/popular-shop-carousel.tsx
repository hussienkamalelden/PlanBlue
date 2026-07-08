'use client';

import { useMemo, useRef } from 'react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import { SliderCarouselFrame } from '@/components/ui/slider-carousel-frame';
import { ShopProductCard } from '@/components/home/shop-product-card';
import { useSliderDirection } from '@/lib/hooks/use-slider-direction';
import { useSliderSwiperProps } from '@/lib/shop/slider-drag-guard';
import { buildInfiniteSliderItems } from '@/lib/shop/slider-loop';
import { SLIDER_TOUCH_OPTIONS } from '@/lib/shop/slider-touch';
import type { StrapiShopItem } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

import 'swiper/css';
import 'swiper/css/navigation';

const MAX_SLIDES_PER_VIEW = 6;
const MIN_LOOP_SLIDES = MAX_SLIDES_PER_VIEW * 3;

type PopularShopCarouselProps = {
  items: StrapiShopItem[];
};

function PopularShopCarouselInner({ items }: PopularShopCarouselProps) {
  const locale = useLocaleStore((state) => state.locale);
  const direction = useSliderDirection();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const sliderDragProps = useSliderSwiperProps();

  const loopSlides = useMemo(
    () => buildInfiniteSliderItems(items, MIN_LOOP_SLIDES),
    [items],
  );

  const breakpoints = useMemo(
    () => ({
      0: { slidesPerView: 1.1, spaceBetween: 16 },
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
      1280: { slidesPerView: 4, spaceBetween: 24 },
      1440: { slidesPerView: 5, spaceBetween: 24 },
      1920: { slidesPerView: MAX_SLIDES_PER_VIEW, spaceBetween: 24 },
    }),
    [],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <>
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
        key={`popular-shop-${direction}`}
        dir={direction}
        modules={[Navigation, Autoplay]}
        {...SLIDER_TOUCH_OPTIONS}
        {...sliderDragProps}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop
        loopAdditionalSlides={MAX_SLIDES_PER_VIEW}
        watchSlidesProgress
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
        className="popular-shop-swiper"
      >
        {loopSlides.map(({ data, slideKey }) => (
          <SwiperSlide key={slideKey} className="!h-auto">
            <ShopProductCard item={data} locale={locale} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}

export function PopularShopCarousel({ items }: PopularShopCarouselProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SliderCarouselFrame className="popular-shop-nav-wrap relative">
      <PopularShopCarouselInner items={items} />
    </SliderCarouselFrame>
  );
}
