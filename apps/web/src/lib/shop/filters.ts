import { getShopItemPrices } from '@/lib/api/strapi';
import type { StrapiShopItem } from '@/lib/types/strapi';

export type ShopSort = 'top_sellers' | 'most_viewed' | 'price_high' | 'price_low' | null;
/** Age bucket filter — null means no age filter (show all items). */
export type AgeFilter =
  | '0-1'
  | '1-2'
  | '2-3'
  | '3-4'
  | '4-6'
  | '6+'
  | null;

export type ActiveFilterTag =
  | {
      key: string;
      type: 'category';
      categoryId: string;
      label: string;
    }
  | {
      key: string;
      type: 'age';
      ageFilter: Exclude<AgeFilter, null>;
      label: string;
    }
  | {
      key: string;
      type: 'sort';
      sort: Exclude<ShopSort, null>;
      label: string;
    }
  | {
      key: string;
      type: 'price';
      min: number;
      max: number;
      label: string;
    };

export const AGE_FILTER_OPTIONS: Exclude<AgeFilter, null>[] = [
  '0-1',
  '1-2',
  '2-3',
  '3-4',
  '4-6',
  '6+',
];

/** Map a shop item's age integer to its filter bucket. */
export function getShopItemAgeBucket(age: number): Exclude<AgeFilter, null> {
  if (age <= 0) return '0-1';
  if (age === 1) return '1-2';
  if (age === 2) return '2-3';
  if (age === 3) return '3-4';
  if (age === 4 || age === 5) return '4-6';
  return '6+';
}

export function getShopItemDisplayPrice(item: StrapiShopItem): number {
  const { basePrice, salePrice } = getShopItemPrices(item);
  return salePrice ?? basePrice;
}

export function getShopItemPriceBounds(items: StrapiShopItem[]): {
  min: number;
  max: number;
} {
  if (items.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = items.map(getShopItemDisplayPrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function isPriceFilterActive(
  min: number,
  max: number,
  bounds: { min: number; max: number },
): boolean {
  return min > bounds.min || max < bounds.max;
}

export function filterShopItemsByPrice(
  items: StrapiShopItem[],
  min: number,
  max: number,
): StrapiShopItem[] {
  return items.filter((item) => {
    const price = getShopItemDisplayPrice(item);
    return price >= min && price <= max;
  });
}

export function filterShopItemsByCategory(
  items: StrapiShopItem[],
  categoryId: string | null,
): StrapiShopItem[] {
  if (!categoryId) {
    return items;
  }

  return items.filter((item) =>
    item.categories?.some((category) => category.documentId === categoryId),
  );
}

export function filterShopItemsByAge(
  items: StrapiShopItem[],
  ageFilter: AgeFilter,
): StrapiShopItem[] {
  if (!ageFilter) {
    return items;
  }

  return items.filter((item) => {
    if (item.all_ages) {
      return true;
    }

    const age = Number(item.age ?? 0);
    return getShopItemAgeBucket(age) === ageFilter;
  });
}

export function sortShopItems(
  items: StrapiShopItem[],
  sort: ShopSort,
): StrapiShopItem[] {
  if (!sort) {
    return items;
  }

  const sorted = [...items];

  if (sort === 'top_sellers') {
    return sorted.sort(
      (a, b) => Number(b.total_sold ?? 0) - Number(a.total_sold ?? 0),
    );
  }

  return sorted.sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0));
}

export function getMostViewedShopItems(
  items: StrapiShopItem[],
  limit = 12,
): StrapiShopItem[] {
  return sortShopItems(items, 'most_viewed').slice(0, limit);
}

export function getTopSellingShopItems(
  items: StrapiShopItem[],
  limit = 12,
): StrapiShopItem[] {
  return sortShopItems(items, 'top_sellers').slice(0, limit);
}
