import type {
  StrapiCategory,
  StrapiListResponse,
  StrapiProduct,
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

export async function fetchCategories(): Promise<StrapiCategory[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiCategory>>(
    '/categories',
    {
      'fields[0]': 'title',
      'fields[1]': 'title_ar',
      'fields[2]': 'documentId',
      sort: 'title:asc',
    },
  );

  return json.data;
}

export async function fetchProducts(): Promise<StrapiProduct[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiProduct>>(
    '/products',
    {
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

/** findOne by documentId */
export async function fetchProductByDocumentId(
  documentId: string,
): Promise<StrapiProduct | null> {
  try {
    const json = await strapiFetch<StrapiSingleResponse<StrapiProduct>>(
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

/** Find product by slug, then hit findOne to increment views */
export async function fetchProductBySlug(
  slug: string,
): Promise<StrapiProduct | null> {
  try {
    const json = await strapiFetch<StrapiListResponse<StrapiProduct>>(
      '/products',
      {
        'filters[slug][$eq]': slug,
        'fields[0]': 'documentId',
      },
    );

    const match = json.data?.[0];
    if (!match) return null;

    // Call findOne to trigger view increment and get full product data
    return await fetchProductByDocumentId(match.documentId);
  } catch {
    return null;
  }
}
