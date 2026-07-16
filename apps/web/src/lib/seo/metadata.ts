import type { Metadata } from 'next';

import {
  formatPriceWhole,
  getFirstShopItemImage,
  getMediaUrl,
  getShopItemPrices,
} from '@/lib/api/strapi';
import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/config';
import type { StrapiShopItem } from '@/lib/types/strapi';

const DEFAULT_OG_IMAGE =
  'https://pub-eb8249647a93431092ad3c6652a821b0.r2.dev/full_logo_68ca0dff54.png';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
}

export function getSiteOgImageUrl(): string {
  return process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? DEFAULT_OG_IMAGE;
}

export function resolveAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

function truncate(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) {
    return cleaned;
  }

  return `${cleaned.slice(0, max - 1).trim()}…`;
}

export function getProductTitle(item: StrapiShopItem, locale: Locale): string {
  return locale === 'ar' && item.title_ar ? item.title_ar : item.title;
}

export function getProductDescriptionText(
  item: StrapiShopItem,
  locale: Locale,
): string {
  const raw =
    locale === 'ar' && item.description_ar
      ? item.description_ar
      : item.description;

  return truncate(raw);
}

export function getProductImageUrl(item: StrapiShopItem): string | null {
  const image = getFirstShopItemImage(item.media);
  if (!image) {
    return null;
  }

  const imagePath =
    image.formats?.large?.url ??
    image.formats?.medium?.url ??
    image.formats?.small?.url ??
    image.url;

  return getMediaUrl(imagePath);
}

export function buildRootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  const siteName = t.common.brand;
  const siteDescription = t.home.hero.title;
  const siteUrl = getSiteUrl();
  const ogImage = getSiteOgImageUrl();
  const defaultTitle = `${siteName} — ${t.common.tagline}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_EG',
      url: siteUrl,
      siteName,
      title: defaultTitle,
      description: siteDescription,
      images: [
        {
          url: ogImage,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: siteDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export function buildProductMetadata(
  item: StrapiShopItem,
  locale: Locale,
): Metadata {
  const t = getDictionary(locale);
  const siteName = t.common.brand;
  const title = getProductTitle(item, locale);
  const { basePrice, salePrice } = getShopItemPrices(item);
  const displayPrice = salePrice ?? basePrice;
  const priceLabel = formatPriceWhole(displayPrice, locale);
  const descriptionText = getProductDescriptionText(item, locale);
  const description = `${priceLabel} — ${descriptionText}`;
  const pageUrl = `${getSiteUrl()}/shop/${item.slug}`;
  const ogImage = getProductImageUrl(item) ?? getSiteOgImageUrl();

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_EG',
      url: pageUrl,
      siteName,
      title: `${title} — ${priceLabel}`,
      description: descriptionText,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${priceLabel}`,
      description: descriptionText,
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'product:price:amount': String(displayPrice),
      'product:price:currency': 'EGP',
    },
  };
}

export function buildProductJsonLd(item: StrapiShopItem, locale: Locale) {
  const title = getProductTitle(item, locale);
  const { basePrice, salePrice } = getShopItemPrices(item);
  const displayPrice = salePrice ?? basePrice;
  const imageUrl = getProductImageUrl(item);
  const inStock = item.available && item.available_stock > 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: getProductDescriptionText(item, locale),
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      url: `${getSiteUrl()}/shop/${item.slug}`,
      priceCurrency: 'EGP',
      price: displayPrice.toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function buildWebsiteJsonLd(locale: Locale) {
  const t = getDictionary(locale);
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t.common.brand,
    description: t.home.hero.title,
    url: siteUrl,
    image: getSiteOgImageUrl(),
  };
}
