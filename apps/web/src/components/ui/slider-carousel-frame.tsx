'use client';

import type { ReactNode } from 'react';

import {
  SliderDragGuardProvider,
  useSliderClickCaptureHandler,
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

  return (
    <div
      className={className}
      data-slider-carousel=""
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
