import type { Locale } from '@/lib/i18n/config';

export type StrapiCategory = {
  id: number;
  documentId: string;
  title: string;
  locale: Locale;
};

export type StrapiProduct = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  price: number;
  /** Added by custom Strapi product controller when on sale */
  discount_price?: number;
  has_sale: boolean;
  discount_percentage: number;
  available: boolean;
  available_stock: number;
  views: number;
  locale: Locale;
  categories?: StrapiCategory[];
  media?: any[];
};

export type StrapiListResponse<T> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type StrapiSingleResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};
