type AgeBounds = { min: number; max: number };

function getAgeBoundsForFilter(ageFilter: string): AgeBounds | null {
  switch (ageFilter) {
    case '0-1':
      return { min: 0, max: 1 };
    case '1-2':
      return { min: 1, max: 2 };
    case '2-3':
      return { min: 2, max: 3 };
    case '3-4':
      return { min: 3, max: 4 };
    case '4-6':
      return { min: 4, max: 6 };
    case '6+':
      return { min: 6, max: 99 };
    default:
      return null;
  }
}

export type ProductSearchFilters = {
  categoryIds?: string[];
  ageFilters?: string[];
  priceMin?: number;
  priceMax?: number;
};

export function buildProductSearchFilters({
  categoryIds,
  ageFilters,
  priceMin,
  priceMax,
}: ProductSearchFilters): Record<string, unknown> {
  const andFilters: Record<string, unknown>[] = [];

  if (categoryIds && categoryIds.length > 0) {
    andFilters.push({
      categories: {
        documentId: { $in: categoryIds },
      },
    });
  }

  if (ageFilters && ageFilters.length > 0) {
    const ageOrFilters: Record<string, unknown>[] = [];

    for (const ageFilter of ageFilters) {
      const bounds = getAgeBoundsForFilter(ageFilter);
      if (bounds) {
        ageOrFilters.push({
          age: { $gte: bounds.min, $lte: bounds.max },
        });
      }
    }

    ageOrFilters.push({ all_ages: { $eq: true } });
    andFilters.push({ $or: ageOrFilters });
  }

  if (priceMin !== undefined && priceMin > 0) {
    andFilters.push({ price: { $gte: priceMin } });
  }

  if (priceMax !== undefined && priceMax > 0) {
    andFilters.push({ price: { $lte: priceMax } });
  }

  if (andFilters.length === 0) {
    return {};
  }

  if (andFilters.length === 1) {
    return andFilters[0] as Record<string, unknown>;
  }

  return { $and: andFilters };
}

export function sortProducts<T extends Record<string, unknown>>(
  products: T[],
  sort = 'createdAt:desc',
): T[] {
  const [field, direction = 'desc'] = sort.split(':');
  const descending = direction === 'desc';

  return [...products].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];

    if (field === 'createdAt' || field === 'updatedAt') {
      const leftTime = new Date(String(leftValue ?? 0)).getTime();
      const rightTime = new Date(String(rightValue ?? 0)).getTime();
      return descending ? rightTime - leftTime : leftTime - rightTime;
    }

    const leftNumber = Number(leftValue ?? 0);
    const rightNumber = Number(rightValue ?? 0);
    return descending ? rightNumber - leftNumber : leftNumber - rightNumber;
  });
}

export function withDiscountPrice<T extends Record<string, unknown>>(product: T) {
  const basePrice = Number(product.price) || 0;
  const discountPercentage = Number(product.discount_percentage ?? 0);
  const discountPrice = basePrice - basePrice * (discountPercentage / 100);

  return {
    ...product,
    discount_price: Number(discountPrice.toFixed(2)),
  };
}
