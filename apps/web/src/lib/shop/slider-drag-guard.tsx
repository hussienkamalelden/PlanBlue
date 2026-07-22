'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { Swiper as SwiperType } from 'swiper';

import {
  setSliderDragBlocked,
  setSliderSwiperAllowClick,
} from '@/lib/shop/slider-drag-state';

type SliderDragGuardContextValue = {
  registerSwiper: (swiper: SwiperType) => void;
  stopAutoplay: () => void;
  isClickBlocked: () => boolean;
  handleTouchStart: () => void;
  handleSliderMove: () => void;
  handleSliderFirstMove: () => void;
  handleTouchEnd: () => void;
};

const SliderDragGuardContext = createContext<SliderDragGuardContextValue | null>(
  null,
);

function syncDragState(dragged: boolean, allowClick: boolean) {
  setSliderDragBlocked(dragged);
  setSliderSwiperAllowClick(allowClick);
}

export function SliderDragGuardProvider({ children }: { children: ReactNode }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const draggedRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const updateDragState = useCallback(() => {
    syncDragState(
      draggedRef.current,
      swiperRef.current?.allowClick ?? true,
    );
  }, []);

  const stopAutoplay = useCallback(() => {
    const swiper = swiperRef.current;
    if (swiper?.autoplay?.running) {
      swiper.autoplay.stop();
    }
  }, []);

  const registerSwiper = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      updateDragState();
    },
    [updateDragState],
  );

  const isClickBlocked = useCallback(() => {
    if (draggedRef.current) {
      return true;
    }

    return swiperRef.current?.allowClick === false;
  }, []);

  const handleTouchStart = useCallback(() => {
    clearResetTimer();
    draggedRef.current = false;
    stopAutoplay();
    updateDragState();
  }, [clearResetTimer, stopAutoplay, updateDragState]);

  const handleSliderMove = useCallback(() => {
    draggedRef.current = true;
    stopAutoplay();
    updateDragState();
  }, [stopAutoplay, updateDragState]);

  const handleSliderFirstMove = handleSliderMove;

  const handleTouchEnd = useCallback(() => {
    updateDragState();

    if (!draggedRef.current) {
      return;
    }

    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      draggedRef.current = false;
      resetTimerRef.current = null;
      updateDragState();
    }, 350);
  }, [clearResetTimer, updateDragState]);

  const value = useMemo(
    () => ({
      registerSwiper,
      stopAutoplay,
      isClickBlocked,
      handleTouchStart,
      handleSliderMove,
      handleSliderFirstMove,
      handleTouchEnd,
    }),
    [
      registerSwiper,
      stopAutoplay,
      isClickBlocked,
      handleTouchStart,
      handleSliderMove,
      handleSliderFirstMove,
      handleTouchEnd,
    ],
  );

  return (
    <SliderDragGuardContext.Provider value={value}>
      {children}
    </SliderDragGuardContext.Provider>
  );
}

export function useSliderDragGuard() {
  const context = useContext(SliderDragGuardContext);

  if (!context) {
    return {
      registerSwiper: () => undefined,
      stopAutoplay: () => undefined,
      isClickBlocked: () => false,
      handleTouchStart: () => undefined,
      handleSliderMove: () => undefined,
      handleSliderFirstMove: () => undefined,
      handleTouchEnd: () => undefined,
    };
  }

  return context;
}

export function useStopSliderAutoplay() {
  return useSliderDragGuard().stopAutoplay;
}

export function useSliderClickCaptureHandler() {
  const { isClickBlocked } = useSliderDragGuard();

  return useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!isClickBlocked()) {
        return;
      }

      const anchor = (event.target as Element).closest('a');
      if (!anchor) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [isClickBlocked],
  );
}

export function useSliderSwiperProps() {
  const {
    registerSwiper,
    handleTouchStart,
    handleSliderMove,
    handleSliderFirstMove,
    handleTouchEnd,
  } = useSliderDragGuard();

  return useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onSliderMove: handleSliderMove,
      onSliderFirstMove: handleSliderFirstMove,
      onTouchEnd: handleTouchEnd,
      onSwiper: registerSwiper,
    }),
    [
      registerSwiper,
      handleTouchStart,
      handleSliderMove,
      handleSliderFirstMove,
      handleTouchEnd,
    ],
  );
}
