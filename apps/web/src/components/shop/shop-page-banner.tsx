import type { ReactNode } from 'react';

const DEFAULT_BANNER_SRC = '/images/shop/shop_banner.png';

type ShopPageBannerProps = {
  bannerSrc?: string;
  children?: ReactNode;
};

export function ShopPageBanner({
  bannerSrc = DEFAULT_BANNER_SRC,
  children,
}: ShopPageBannerProps) {
  return (
    <div className="pb-shop-banner relative h-20 w-full md:h-40">
      <div
        className="absolute inset-0 bg-brand-primary opacity-80"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${bannerSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 29%',
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
