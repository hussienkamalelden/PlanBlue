'use client';

import { HOME_ASSETS } from '@/lib/assets/home';
import { useTranslations } from '@/lib/i18n/use-translations';

export function HomeOffersSection() {
  const t = useTranslations();
  const labels = t.home.offers.labels;
  const trackItems = [...labels, ...labels];

  return (
    <section
      className="pb-offers group relative py-14 md:py-20"
      aria-label="Offers"
    >
      <div
        className="pb-float-bob-y pointer-events-none absolute bottom-14 left-[110px] hidden h-[266px] w-[158px] bg-contain bg-no-repeat md:block"
        style={{ backgroundImage: `url(${HOME_ASSETS.shapes.offersShape})` }}
        dir="ltr"
        aria-hidden="true"
      />

      <div className="pb-offers__inner bg-white">
        <ul className="pb-offers__list">
          {trackItems.map((label, index) => (
            <li key={`${label}-${index}`} className="pb-offers__item">
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
