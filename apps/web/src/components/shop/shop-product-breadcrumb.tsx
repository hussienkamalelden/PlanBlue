'use client';

import Link from 'next/link';
import { ChevronRight, Home, Package, ShoppingBag } from 'lucide-react';

import { useTranslations } from '@/lib/i18n/use-translations';
import { useLocaleStore } from '@/stores/locale-store';

type ShopProductBreadcrumbProps = {
  title: string;
  titleAr: string;
};

export function ShopProductBreadcrumb({
  title,
  titleAr,
}: ShopProductBreadcrumbProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const productTitle = locale === 'ar' ? titleAr : title;

  return (
    <nav className="pb-shop-breadcrumb" aria-label="Breadcrumb">
      <Link href="/" className="pb-shop-breadcrumb__item">
        <Home className="pb-shop-breadcrumb__icon" aria-hidden="true" />
        <span>{t.header.nav.home}</span>
      </Link>

      <ChevronRight className="pb-shop-breadcrumb__sep" aria-hidden="true" />

      <Link href="/shop" className="pb-shop-breadcrumb__item">
        <ShoppingBag className="pb-shop-breadcrumb__icon" aria-hidden="true" />
        <span>{t.header.nav.shop}</span>
      </Link>

      <ChevronRight className="pb-shop-breadcrumb__sep" aria-hidden="true" />

      <span className="pb-shop-breadcrumb__item pb-shop-breadcrumb__item--current" aria-current="page">
        <Package className="pb-shop-breadcrumb__icon" aria-hidden="true" />
        <span className="line-clamp-1">{productTitle}</span>
      </span>
    </nav>
  );
}
