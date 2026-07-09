import type {
  StrapiAffiliate,
  StrapiCategory,
  StrapiExtra,
  StrapiListResponse,
  StrapiShopItem,
  StrapiShipping,
  StrapiSingleResponse,
} from '@/lib/types/strapi';

import { STRAPI_URL } from './strapi';

async function strapiFetch<T>(
  path: string,
  searchParams: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${STRAPI_URL}/api${path}`);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  const token = process.env.STRAPI_API_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Strapi request failed (${response.status}): ${url.pathname}${url.search}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchShipping(): Promise<StrapiShipping[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiShipping>>(
    '/shippings',
    {
      'fields[0]': 'name',
      'fields[1]': 'cost',
      'fields[2]': 'documentId',
      sort: 'name:asc',
      status: 'published',
    },
  );

  return json.data;
}

export async function fetchExtras(): Promise<StrapiExtra[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiExtra>>('/extras', {
    'fields[0]': 'title',
    'fields[1]': 'cost',
    'fields[2]': 'documentId',
    sort: 'title:asc',
    status: 'published',
  });

  return json.data;
}

function normalizeExtraTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, '_');
}

export function findGiftWrappingExtra(
  extras: StrapiExtra[],
): StrapiExtra | null {
  return (
    extras.find(
      (extra) => normalizeExtraTitle(extra.title) === 'gift_wrapping',
    ) ?? null
  );
}

export async function fetchCategories(): Promise<StrapiCategory[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiCategory>>(
    '/categories',
    {
      'fields[0]': 'title',
      'fields[1]': 'title_ar',
      'fields[2]': 'documentId',
      'populate[image][fields][0]': 'url',
      'populate[image][fields][1]': 'name',
      'populate[image][fields][2]': 'mime',
      sort: 'title:asc',
    },
  );

  return json.data;
}

export async function fetchShopItems(): Promise<StrapiShopItem[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiShopItem>>(
    '/products',
    {
      'fields[0]': 'title',
      'fields[1]': 'title_ar',
      'fields[2]': 'slug',
      'fields[3]': 'description',
      'fields[4]': 'description_ar',
      'fields[5]': 'price',
      'fields[6]': 'has_sale',
      'fields[7]': 'discount_percentage',
      'fields[8]': 'available',
      'fields[9]': 'available_stock',
      'fields[10]': 'views',
      'fields[11]': 'total_sold',
      'fields[12]': 'all_ages',
      'fields[13]': 'age',
      'fields[14]': 'documentId',
      'fields[15]': 'need_batteries',
      'populate[categories][fields][0]': 'title',
      'populate[categories][fields][1]': 'title_ar',
      'populate[categories][fields][2]': 'documentId',
      'populate[media][fields][0]': 'url',
      'populate[media][fields][1]': 'name',
      'populate[media][fields][2]': 'mime',
      sort: 'createdAt:desc',
    },
  );

  return json.data;
}

export async function fetchAffiliates(): Promise<StrapiAffiliate[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiAffiliate>>(
    '/affiliates',
    {
      'fields[0]': 'name',
      'fields[1]': 'email',
      'fields[2]': 'documentId',
      'fields[3]': 'current_pending_commission',
      'populate[avatar][fields][0]': 'url',
      'populate[avatar][fields][1]': 'name',
      'populate[avatar][fields][2]': 'mime',
      sort: 'current_pending_commission:desc',
      status: 'published',
    },
  );

  return json.data;
}

export async function fetchShopItemsByDocumentIds(
  documentIds: string[],
): Promise<StrapiShopItem[]> {
  if (documentIds.length === 0) {
    return [];
  }

  const params: Record<string, string> = {
    'fields[0]': 'documentId',
    'fields[1]': 'title',
    'fields[2]': 'slug',
    'fields[3]': 'price',
    'fields[4]': 'has_sale',
    'fields[5]': 'discount_percentage',
    'fields[6]': 'available',
    'fields[7]': 'available_stock',
    sort: 'createdAt:desc',
  };

  documentIds.forEach((documentId, index) => {
    params[`filters[documentId][$in][${index}]`] = documentId;
  });

  try {
    const json = await strapiFetch<StrapiListResponse<StrapiShopItem>>(
      '/products',
      params,
    );

    return json.data;
  } catch {
    return [];
  }
}

/** findOne by documentId */
export async function fetchShopItemByDocumentId(
  documentId: string,
): Promise<StrapiShopItem | null> {
  try {
    const json = await strapiFetch<StrapiSingleResponse<StrapiShopItem>>(
      `/products/${documentId}`,
      {
        'populate[categories][fields][0]': 'title',
        'populate[categories][fields][1]': 'title_ar',
        'populate[categories][fields][2]': 'documentId',
        'populate[media][fields][0]': 'url',
        'populate[media][fields][1]': 'name',
        'populate[media][fields][2]': 'mime',
      },
    );

    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Find shop item by slug, then hit findOne to increment views */
export async function fetchShopItemBySlug(
  slug: string,
): Promise<StrapiShopItem | null> {
  try {
    const json = await strapiFetch<StrapiListResponse<StrapiShopItem>>(
      '/products',
      {
        'filters[slug][$eq]': slug,
        'fields[0]': 'documentId',
      },
    );

    const match = json.data?.[0];
    if (!match) return null;

    return await fetchShopItemByDocumentId(match.documentId);
  } catch {
    return null;
  }
}

export async function fetchRelatedShopItems(
  item: StrapiShopItem,
  limit = 4,
): Promise<StrapiShopItem[]> {
  const categoryIds =
    item.categories?.map((category) => category.documentId) ?? [];

  if (categoryIds.length === 0) {
    return [];
  }

  const params: Record<string, string> = {
    'populate[categories][fields][0]': 'title',
    'populate[categories][fields][1]': 'title_ar',
    'populate[categories][fields][2]': 'documentId',
    'populate[media][fields][0]': 'url',
    'populate[media][fields][1]': 'name',
    'populate[media][fields][2]': 'mime',
    'filters[documentId][$ne]': item.documentId,
    'pagination[pageSize]': String(limit),
    sort: 'createdAt:desc',
  };

  categoryIds.forEach((categoryId, index) => {
    params[`filters[categories][documentId][$in][${index}]`] = categoryId;
  });

  try {
    const json = await strapiFetch<StrapiListResponse<StrapiShopItem>>(
      '/products',
      params,
    );

    return json.data;
  } catch {
    return [];
  }
}
