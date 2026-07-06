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

export type StrapiMedia = {
  url: string;
  name: string;
  mime: string;
};

export type StrapiCategory = {
  id: number;
  documentId: string;
  title: string;
  title_ar: string;
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
