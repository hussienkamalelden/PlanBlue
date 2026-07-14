import { OFFER_ICONS } from '@/lib/home/offer-icons';

export function buildOfferTrackItems(labels: string[]) {
  return labels.map((label, index) => ({
    label,
    Icon: OFFER_ICONS[index % OFFER_ICONS.length],
  }));
}
