import type { ReactNode } from 'react';

const DEFAULT_BANNER_SRC = '/images/shop/shop_banner.png';

type ShopPageBannerProps = {
  bannerSrc?: string;
  children?: ReactNode;
  className?: string;
  darkOverlay?: boolean;
};

export function ShopPageBanner({
  bannerSrc = DEFAULT_BANNER_SRC,
  children,
  className,
  darkOverlay = false,
}: ShopPageBannerProps) {
  return (
    <div
      className={`pb-shop-banner relative h-20 w-full overflow-hidden md:h-40${className ? ` ${className}` : ''}`}
    >
      <div
        className="pb-shop-banner__bg absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${bannerSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 29%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className={`pb-shop-banner__overlay absolute inset-0 z-[1]${
          darkOverlay
            ? ' pb-shop-banner__overlay--dark'
            : ' pb-shop-banner__overlay--brand'
        }`}
        aria-hidden="true"
      />

      {children ? (
        <div className="pb-large-container relative z-10 flex h-full items-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
