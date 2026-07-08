'use client';

import Link from 'next/link';
import { useRef, type ComponentProps, type MouseEvent } from 'react';

import { useSliderDragGuard } from '@/lib/shop/slider-drag-guard';

const DRAG_THRESHOLD_PX = 8;

type SliderLinkProps = ComponentProps<typeof Link>;

function shouldBlockNavigation(
  moved: boolean,
  swiperBlocked: boolean,
): boolean {
  return moved || swiperBlocked;
}

export function SliderLink({
  onPointerDown,
  onPointerMove,
  onMouseDown,
  onMouseMove,
  onClick,
  onClickCapture,
  ...props
}: SliderLinkProps) {
  const pointerRef = useRef({ x: 0, y: 0, moved: false });
  const { isClickBlocked } = useSliderDragGuard();

  function markMoved(clientX: number, clientY: number) {
    const deltaX = Math.abs(clientX - pointerRef.current.x);
    const deltaY = Math.abs(clientY - pointerRef.current.y);

    if (deltaX > DRAG_THRESHOLD_PX || deltaY > DRAG_THRESHOLD_PX) {
      pointerRef.current.moved = true;
    }
  }

  function blockIfDragged(event: MouseEvent<HTMLAnchorElement>) {
    if (shouldBlockNavigation(pointerRef.current.moved, isClickBlocked())) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    return false;
  }

  return (
    <Link
      {...props}
      draggable={false}
      onPointerDown={(event) => {
        pointerRef.current = {
          x: event.clientX,
          y: event.clientY,
          moved: false,
        };
        onPointerDown?.(event);
      }}
      onPointerMove={(event) => {
        markMoved(event.clientX, event.clientY);
        onPointerMove?.(event);
      }}
      onMouseDown={(event) => {
        pointerRef.current = {
          x: event.clientX,
          y: event.clientY,
          moved: false,
        };
        onMouseDown?.(event);
      }}
      onMouseMove={(event) => {
        markMoved(event.clientX, event.clientY);
        onMouseMove?.(event);
      }}
      onClickCapture={(event) => {
        blockIfDragged(event);
        onClickCapture?.(event);
      }}
      onClick={(event) => {
        if (blockIfDragged(event)) {
          pointerRef.current.moved = false;
          return;
        }

        pointerRef.current.moved = false;
        onClick?.(event);
      }}
    />
  );
}
