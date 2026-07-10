'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

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
      <Link href="/" className="pb-shop-breadcrumb__link inline-flex items-center gap-1">
        <Home className="h-4 w-4" aria-hidden="true" />
        <span>{t.header.nav.home}</span>
      </Link>

      <ChevronRight className="pb-shop-breadcrumb__sep h-4 w-4 shrink-0" aria-hidden="true" />

      <Link href="/shop" className="pb-shop-breadcrumb__link">
        {t.header.nav.shop}
      </Link>

      <ChevronRight className="pb-shop-breadcrumb__sep h-4 w-4 shrink-0" aria-hidden="true" />

      <span className="pb-shop-breadcrumb__current line-clamp-1" aria-current="page">
        {productTitle}
      </span>
    </nav>
  );
}
