import type { Locale } from "@/lib/i18n/config";
import type { StrapiMedia, StrapiProduct } from "@/lib/types/strapi";

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

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
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return locale === "ar" ? `${formatted} جنيه` : `${formatted} EGP`;
}

export function getMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${STRAPI_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export function isVideoMedia(mime: string): boolean {
  return mime.startsWith("video/");
}

export function getFirstProductImage(
  media: StrapiProduct["media"],
): StrapiMedia | null {
  if (!media?.length) {
    return null;
  }

  return media.find((item) => !isVideoMedia(item.mime)) ?? null;
}

export type { StrapiProduct };
