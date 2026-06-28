import type { Locale } from '@/lib/i18n/config';
import type {
  StrapiCategory,
  StrapiListResponse,
  StrapiProduct,
  StrapiSingleResponse,
} from '@/lib/types/strapi';

import { STRAPI_URL } from './strapi';

type StrapiFetchOptions = {
  locale: Locale;
};

async function strapiFetch<T>(
  path: string,
  searchParams: Record<string, string>,
  { locale }: StrapiFetchOptions,
): Promise<T> {
  const url = new URL(`${STRAPI_URL}/api${path}`);
  url.searchParams.set('locale', locale);

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

export async function fetchCategories(
  locale: Locale,
): Promise<StrapiCategory[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiCategory>>(
    '/categories',
    {
      'fields[0]': 'title',
      'fields[1]': 'documentId',
      sort: 'title:asc',
    },
    { locale },
  );

  return json.data;
}

export async function fetchProducts(locale: Locale): Promise<StrapiProduct[]> {
  const json = await strapiFetch<StrapiListResponse<StrapiProduct>>(
    '/products',
    {
      'populate[categories][fields][0]': 'title',
      'populate[categories][fields][1]': 'documentId',
      'populate[media][fields][0]': 'url',
      'populate[media][fields][1]': 'name',
      sort: 'createdAt:desc',
    },
    { locale },
  );

  return json.data;
}

/** findOne — increments views via custom Strapi product controller */
export async function fetchProductByDocumentId(
  documentId: string,
  locale: Locale,
): Promise<StrapiProduct | null> {
  try {
    const json = await strapiFetch<StrapiSingleResponse<StrapiProduct>>(
      `/products/${documentId}`,
      {
        'populate[categories][fields][0]': 'title',
        'populate[categories][fields][1]': 'documentId',
        'populate[media][fields][0]': 'url',
        'populate[media][fields][1]': 'name',
      },
      { locale },
    );

    return json.data ?? null;
  } catch {
    return null;
  }
}
