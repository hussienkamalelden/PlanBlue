let dragBlocked = false;
let swiperAllowClick = true;

export function setSliderDragBlocked(value: boolean) {
  dragBlocked = value;
}

export function setSliderSwiperAllowClick(value: boolean) {
  swiperAllowClick = value;
}

export function isSliderNavigationBlocked(): boolean {
  return dragBlocked || !swiperAllowClick;
}

export function isInsideSliderCarousel(element: Element): boolean {
  return element.closest('[data-slider-carousel]') !== null;
}
