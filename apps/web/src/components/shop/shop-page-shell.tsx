import type { ReactNode } from 'react';

import { ShopPageBanner } from '@/components/shop/shop-page-banner';

type ShopPageShellProps = {
  children: ReactNode;
  mainClassName?: string;
  bannerSrc?: string;
};

export function ShopPageShell({
  children,
  mainClassName = 'relative pb-medium-container py-10',
  bannerSrc,
}: ShopPageShellProps) {
  return (
    <>
      <ShopPageBanner bannerSrc={bannerSrc} darkOverlay />
      <main className={mainClassName}>
        <div className="pb-shop-page" />
        {children}
      </main>
    </>
  );
}
