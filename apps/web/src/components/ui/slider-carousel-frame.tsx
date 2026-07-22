'use client';

import type { ReactNode } from 'react';

import {
  SliderDragGuardProvider,
  useSliderClickCaptureHandler,
  useStopSliderAutoplay,
} from '@/lib/shop/slider-drag-guard';

type SliderCarouselFrameProps = {
  children: ReactNode;
  className?: string;
};

function SliderCarouselFrameInner({
  children,
  className,
}: SliderCarouselFrameProps) {
  const handleClickCapture = useSliderClickCaptureHandler();
  const stopAutoplay = useStopSliderAutoplay();

  return (
    <div
      className={className}
      data-slider-carousel=""
      onPointerDownCapture={() => {
        stopAutoplay();
      }}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  );
}

export function SliderCarouselFrame({
  children,
  className,
}: SliderCarouselFrameProps) {
  return (
    <SliderDragGuardProvider>
      <SliderCarouselFrameInner className={className}>
        {children}
      </SliderCarouselFrameInner>
    </SliderDragGuardProvider>
  );
}
