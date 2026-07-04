'use client';

import { formatPrice } from '@/lib/api/strapi';
import type { Locale } from '@/lib/i18n/config';
import { isPriceFilterActive } from '@/lib/product/filters';

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
  if (max <= min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
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
  const step = isSinglePrice
    ? 1
    : Math.max(1, Math.round((boundMax - boundMin) / 50));

  const left = toPercent(min, boundMin, boundMax);
  const right = toPercent(max, boundMin, boundMax);

  if (isSinglePrice) {
    return (
      <p className="px-1 text-sm font-medium text-neutral-700">
        {formatPrice(boundMin, locale)}
      </p>
    );
  }

  return (
    <div className="px-1">
      {/* Keep slider + values LTR so thumbs match the fill bar in Arabic layout */}
      <div dir="ltr" className="price-range-ltr">
        <div className="mb-3 flex items-center justify-between gap-2 text-sm font-medium text-neutral-800">
          <span>{formatPrice(min, locale)}</span>
          <span className="text-neutral-300">–</span>
          <span>{formatPrice(max, locale)}</span>
        </div>

        <div className="relative mx-1 h-6">
          <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-neutral-200" />
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-brand-primary"
            style={{
              left: `${left}%`,
              width: `${Math.max(right - left, 0)}%`,
            }}
          />

          <input
            type="range"
            min={boundMin}
            max={boundMax}
            step={step}
            value={min}
            aria-label={fromLabel}
            onChange={(event) => {
              const next = Number(event.target.value);
              onMinChange(Math.min(next, max));
            }}
            className="price-range-thumb absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent"
          />
          <input
            type="range"
            min={boundMin}
            max={boundMax}
            step={step}
            value={max}
            aria-label={toLabel}
            onChange={(event) => {
              const next = Number(event.target.value);
              onMaxChange(Math.max(next, min));
            }}
            className="price-range-thumb absolute inset-0 z-30 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-neutral-400">
          <span>{fromLabel}</span>
          <span>{toLabel}</span>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={!isActive}
            className="text-xs font-medium text-brand-primary transition-opacity hover:underline disabled:cursor-not-allowed disabled:text-neutral-300 disabled:no-underline"
          >
            {resetLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
