import type { ReactNode } from 'react';

type ShopPageBannerProps = {
  children?: ReactNode;
};

export function ShopPageBanner({ children }: ShopPageBannerProps) {
  return (
    <div className="pb-shop-banner relative h-20 w-full md:h-40">
      <div
        className="absolute inset-0 bg-brand-primary opacity-80"
        aria-hidden="true"
        style={{
          backgroundImage: 'url(/images/shop/shop_banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {children ? (
        <div className="pb-large-container relative z-10 flex h-full items-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
