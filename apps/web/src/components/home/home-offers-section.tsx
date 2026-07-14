'use client';

import { HOME_ASSETS } from '@/lib/assets/home';
import { buildOfferTrackItems } from '@/lib/home/offers';
import { useTranslations } from '@/lib/i18n/use-translations';

export function HomeOffersSection() {
  const t = useTranslations();
  const trackItems = buildOfferTrackItems(t.home.offers.labels);
  const duplicatedItems = [...trackItems, ...trackItems];

  return (
    <section
      className="pb-offers group relative py-14 md:py-20"
      aria-label={t.home.offers.ariaLabel}
    >
      <div
        className="pb-float-bob-y pointer-events-none absolute bottom-14 left-[110px] hidden h-[266px] w-[158px] bg-contain bg-no-repeat md:block"
        style={{ backgroundImage: `url(${HOME_ASSETS.shapes.offersShape})` }}
        dir="ltr"
        aria-hidden="true"
      />

      <div className="pb-offers__inner bg-white">
        <ul className="pb-offers__list">
          {duplicatedItems.map(({ label, Icon }, index) => (
            <li
              key={`${label}-${index}`}
              className="pb-offers__item select-none"
            >
              <Icon
                className="pb-offers__icon"
                size={34}
                strokeWidth={2.25}
                aria-hidden="true"
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
