export type StrapiAffiliate = {
  id: number;
  documentId: string;
  name: string;
  email: string;
  current_pending_commission: number;
  avatar?: StrapiMedia | null;
};

export type StrapiShipping = {
  id: number;
  documentId: string;
  name: string;
  cost: number;
};

export type StrapiExtra = {
  id: number;
  documentId: string;
  title: string;
  cost: number;
};

export type StrapiMediaFormat = {
  url: string;
  width?: number;
  height?: number;
};

export type StrapiMediaFormats = {
  thumbnail?: StrapiMediaFormat;
  small?: StrapiMediaFormat;
  medium?: StrapiMediaFormat;
  large?: StrapiMediaFormat;
};

export type StrapiMedia = {
  url: string;
  name: string;
  mime: string;
  previewUrl?: string | null;
  formats?: StrapiMediaFormats | null;
};

export type StrapiCategory = {
  id: number;
  documentId: string;
  title: string;
  title_ar: string;
  image?: StrapiMedia | null;
};

export type StrapiShopItem = {
  id: number;
  documentId: string;
  title: string;
  title_ar: string;
  slug: string;
  sku?: string;
  description: string;
  description_ar: string;
  price: number;
  /** Added by custom Strapi product controller when on sale */
  discount_price?: number;
  has_sale: boolean;
  discount_percentage: number;
  available: boolean;
  available_stock: number;
  views: number;
  total_sold: number;
  all_ages: boolean;
  age?: number;
  need_batteries: boolean;
  batteries_size?: 'Size AAA' | 'Size AA' | 'Size C' | 'Size D' | 'Others' | null;
  batteries_quantity?: string | null;
  categories?: StrapiCategory[];
  media?: StrapiMedia[];
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
