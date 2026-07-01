'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { AGE_FILTER_OPTIONS, type AgeFilter } from '@/lib/product/filters';

type ProductAgeNavProps = {
  selectedAgeFilter: AgeFilter;
  onSelectAgeFilter: (filter: AgeFilter) => void;
};

export function ProductAgeNav({
  selectedAgeFilter,
  onSelectAgeFilter,
}: ProductAgeNavProps) {
  const t = useTranslations();

  function getLabel(filter: Exclude<AgeFilter, null>): string {
    const labels: Record<Exclude<AgeFilter, null>, string> = {
      '0-1': t.products.age0to1,
      '1-2': t.products.age1to2,
      '2-3': t.products.age2to3,
      '3-4': t.products.age3to4,
      '4-6': t.products.age4to6,
      '6+': t.products.ageAbove6,
    };

    return labels[filter];
  }

  return (
    <section aria-label={t.products.ageTitle}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {t.products.ageTitle}
      </h2>

      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            type="button"
            onClick={() => onSelectAgeFilter(null)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selectedAgeFilter === null
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
            }`}
          >
            {t.products.allAges}
          </button>
        </li>

        {AGE_FILTER_OPTIONS.map((filter) => (
          <li key={filter}>
            <button
              type="button"
              onClick={() => onSelectAgeFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedAgeFilter === filter
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {getLabel(filter)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
