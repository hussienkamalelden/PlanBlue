import type { Locale } from "@/lib/i18n/config";
import type { StrapiProduct } from "@/lib/types/strapi";

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/**
 * Categories — localized list
 *
 * GET /api/categories?locale=en&fields[0]=title&fields[1]=documentId&sort=title:asc
 */
export function getCategoriesUrl(locale: Locale): string {
  const url = new URL(`${STRAPI_URL}/api/categories`);
  url.searchParams.set("locale", locale);
  url.searchParams.set("fields[0]", "title");
  url.searchParams.set("fields[1]", "documentId");
  url.searchParams.set("sort", "title:asc");
  return url.toString();
}

/**
 * Products — localized list with categories populated
 *
 * GET /api/products?locale=en
 *   &populate[categories][fields][0]=title
 *   &populate[categories][fields][1]=documentId
 *   &sort=createdAt:desc
 */
export function getProductsUrl(locale: Locale): string {
  const url = new URL(`${STRAPI_URL}/api/products`);
  url.searchParams.set("locale", locale);
  url.searchParams.set("populate[categories][fields][0]", "title");
  url.searchParams.set("populate[categories][fields][1]", "documentId");
  url.searchParams.set("sort", "createdAt:desc");
  return url.toString();
}

/**
 * Single product — triggers findOne view increment on the backend
 *
 * GET /api/products/{documentId}?locale=en
 *   &populate[categories][fields][0]=title
 *   &populate[categories][fields][1]=documentId
 */
export function getProductUrl(documentId: string, locale: Locale): string {
  const url = new URL(`${STRAPI_URL}/api/products/${documentId}`);
  url.searchParams.set("locale", locale);
  url.searchParams.set("populate[categories][fields][0]", "title");
  url.searchParams.set("populate[categories][fields][1]", "documentId");
  return url.toString();
}

/** Resolve display price — uses controller `discount_price` or computes from `price`. */
export function getProductPrices(product: StrapiProduct) {
  const basePrice = Number(product.price);

  if (!product.has_sale) {
    return { basePrice, salePrice: null as number | null };
  }

  const salePrice =
    product.discount_price ??
    Number(
      (basePrice - basePrice * (Number(product.discount_percentage) / 100)).toFixed(
        2,
      ),
    );

  return { basePrice, salePrice };
}

export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export type { StrapiProduct };
