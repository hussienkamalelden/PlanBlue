'use client';

import { formatPriceWhole } from '@/lib/api/strapi';
import type { Locale } from '@/lib/i18n/config';
import { isPriceFilterActive } from '@/lib/shop/filters';

type PriceRangeSliderProps = {
  bounds: { min: number; max: number };
  min: number;
  max: number;
  locale: Locale;
  fromLabel: string;
  toLabel: string;
  resetLabel: string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onReset: () => void;
};

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function snapToRangeEdge(
  value: number,
  boundMin: number,
  boundMax: number,
  edge: 'min' | 'max',
): number {
  const range = boundMax - boundMin;
  if (range <= 0) return value;

  const pct = (value - boundMin) / range;
  if (edge === 'max' && pct >= 0.985) return boundMax;
  if (edge === 'min' && pct <= 0.015) return boundMin;
  return value;
}

export function PriceRangeSlider({
  bounds,
  min,
  max,
  locale,
  fromLabel,
  toLabel,
  resetLabel,
  onMinChange,
  onMaxChange,
  onReset,
}: PriceRangeSliderProps) {
  const { min: boundMin, max: boundMax } = bounds;
  const isSinglePrice = boundMax <= boundMin;
  const isActive = isPriceFilterActive(min, max, bounds);

  const left = toPercent(min, boundMin, boundMax);
  const right = toPercent(max, boundMin, boundMax);

  if (isSinglePrice) {
    return (
      <p className="px-1 text-sm font-medium text-neutral-700">
        {formatPriceWhole(boundMin, locale)}
      </p>
    );
  }

  return (
    <div className="pb-price-range-slider">
      {/* Slider track (always LTR for correct thumb behavior) */}
      <div dir="ltr" className="price-range-ltr pb-price-range-slider__track">
        <div className="pb-price-range-slider__rail" />
        <div
          className="pb-price-range-slider__fill"
          style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }}
        />
        <input
          type="range"
          dir="ltr"
          min={boundMin}
          max={boundMax}
          step="any"
          value={min}
          aria-label={fromLabel}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const snapped = snapToRangeEdge(raw, boundMin, boundMax, 'min');
            onMinChange(Math.min(snapped, max));
          }}
          className="price-range-thumb absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent"
        />
        <input
          type="range"
          dir="ltr"
          min={boundMin}
          max={boundMax}
          step="any"
          value={max}
          aria-label={toLabel}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const snapped = snapToRangeEdge(raw, boundMin, boundMax, 'max');
            onMaxChange(Math.max(snapped, min));
          }}
          className="price-range-thumb absolute inset-0 z-30 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>

      {/* Price values + labels (respects document direction) */}
      <div className="pb-price-range-slider__values">
        <span className="pb-price-range-slider__value">
          <span className="pb-price-range-slider__label">{fromLabel}</span>
          <span className="pb-price-range-slider__amount">{formatPriceWhole(Math.round(min), locale)}</span>
        </span>
        <span className="pb-price-range-slider__separator">–</span>
        <span className="pb-price-range-slider__value">
          <span className="pb-price-range-slider__label">{toLabel}</span>
          <span className="pb-price-range-slider__amount">{formatPriceWhole(Math.round(max), locale)}</span>
        </span>
      </div>

      {/* Reset link */}
      <div className="pb-price-range-slider__reset">
        <button
          type="button"
          onClick={onReset}
          disabled={!isActive}
          className="pb-price-range-slider__reset-btn"
        >
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
