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
  if (max <= min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
}

function getPriceSliderStep(boundMin: number, boundMax: number): number | 'any' {
  const range = boundMax - boundMin;
  if (range <= 0) {
    return 1;
  }

  // Allow exact catalog min/max regardless of decimal prices.
  return 'any';
}

function snapToRangeEdge(
  value: number,
  boundMin: number,
  boundMax: number,
  edge: 'min' | 'max',
): number {
  const range = boundMax - boundMin;
  if (range <= 0) {
    return value;
  }

  const pct = (value - boundMin) / range;

  if (edge === 'max' && pct >= 0.985) {
    return boundMax;
  }

  if (edge === 'min' && pct <= 0.015) {
    return boundMin;
  }

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
  const step = getPriceSliderStep(boundMin, boundMax);

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
    <div className="px-1">
      <div dir="ltr" className="price-range-ltr isolate">
        <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm font-medium text-neutral-800">
          <span className="text-left">{formatPriceWhole(Math.round(min), locale)}</span>
          <span className="text-center text-neutral-300">–</span>
          <span className="text-right">{formatPriceWhole(Math.round(max), locale)}</span>
        </div>

        <div className="relative mx-1 h-6" dir="ltr">
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
            dir="ltr"
            min={boundMin}
            max={max}
            step={step}
            value={min}
            aria-label={fromLabel}
            onChange={(event) => {
              const raw = Number(event.target.value);
              const next = snapToRangeEdge(raw, boundMin, boundMax, 'min');
              onMinChange(Math.min(next, max));
            }}
            className="price-range-thumb absolute inset-0 z-20 w-full cursor-pointer appearance-none bg-transparent"
          />
          <input
            type="range"
            dir="ltr"
            min={min}
            max={boundMax}
            step={step}
            value={max}
            aria-label={toLabel}
            onChange={(event) => {
              const raw = Number(event.target.value);
              const next = snapToRangeEdge(raw, boundMin, boundMax, 'max');
              onMaxChange(Math.max(next, min));
            }}
            className="price-range-thumb absolute inset-0 z-30 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
          <span className="text-left">{fromLabel}</span>
          <span className="text-right">{toLabel}</span>
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
