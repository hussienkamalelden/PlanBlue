import type { Locale } from "@/lib/i18n/config";
import type { StrapiMedia, StrapiShopItem } from "@/lib/types/strapi";

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/** Resolve display price — uses controller `discount_price` or computes from `price`. */
export function getShopItemPrices(item: StrapiShopItem) {
  const basePrice = Number(item.price);

  if (!item.has_sale) {
    return { basePrice, salePrice: null as number | null };
  }

  const salePrice =
    item.discount_price ??
    Number(
      (basePrice - basePrice * (Number(item.discount_percentage) / 100)).toFixed(
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

/** Whole-number price display (no decimal fraction). */
export function formatPriceWhole(amount: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return locale === "ar" ? `${formatted} جنيه` : `${formatted} EGP`;
}

/** Like formatPrice, but drops ".00" when the amount is a whole number. */
export function formatPriceDisplay(amount: number, locale: Locale): string {
  return formatCommission(amount, locale);
}

export function formatCommission(amount: number, locale: Locale): string {
  const value = Number(amount);
  const isWhole = Math.abs(value - Math.round(value)) < 0.001;

  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

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

export function getMediaThumbnailUrl(
  media: StrapiMedia,
  fallbackMedia?: StrapiMedia[],
): string | null {
  if (!isVideoMedia(media.mime)) {
    return getMediaUrl(media.url);
  }

  if (media.previewUrl) {
    return getMediaUrl(media.previewUrl);
  }

  const thumbnailUrl = media.formats?.thumbnail?.url ?? media.formats?.small?.url;
  if (thumbnailUrl) {
    return getMediaUrl(thumbnailUrl);
  }

  const fallbackImage = fallbackMedia?.find((item) => !isVideoMedia(item.mime));
  return fallbackImage ? getMediaUrl(fallbackImage.url) : null;
}

export function getFirstShopItemImage(
  media: StrapiShopItem["media"],
): StrapiMedia | null {
  if (!media?.length) {
    return null;
  }

  return media.find((item) => !isVideoMedia(item.mime)) ?? null;
}

export type { StrapiShopItem };
