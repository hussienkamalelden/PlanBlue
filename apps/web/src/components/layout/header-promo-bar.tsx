'use client';

import { Battery, type LucideIcon } from 'lucide-react';

import { buildOfferTrackItems } from '@/lib/home/offers';
import { useTranslations } from '@/lib/i18n/use-translations';

type PromoTrackItem = {
  label: string;
  Icon: LucideIcon;
};

function PromoTrackGroup({
  items,
  groupId,
  ariaHidden = false,
}: {
  items: PromoTrackItem[];
  groupId: string;
  ariaHidden?: boolean;
}) {
  return (
    <ul
      className="pb-header-promo__group"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map(({ label, Icon }, index) => (
        <li
          key={`${groupId}-${label}-${index}`}
          className="pb-header-promo__item"
        >
          <Icon
            className={`pb-header-promo__icon${
              Icon === Battery ? ' pb-header-promo__icon--battery' : ''
            }`}
            size={16}
            strokeWidth={2.25}
            aria-hidden="true"
          />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export function HeaderPromoBar() {
  const t = useTranslations();
  const trackItems = buildOfferTrackItems(t.home.offers.labels);

  return (
    <div
      className="pb-header-promo"
      role="note"
      aria-label={t.home.offers.ariaLabel}
    >
      <div className="pb-header-promo__viewport">
        <div className="pb-header-promo__marquee">
          <PromoTrackGroup items={trackItems} groupId="primary" />
          <PromoTrackGroup items={trackItems} groupId="clone" ariaHidden />
          <PromoTrackGroup items={trackItems} groupId="clone" ariaHidden />
          <PromoTrackGroup items={trackItems} groupId="clone" ariaHidden />
        </div>
      </div>
    </div>
  );
}
