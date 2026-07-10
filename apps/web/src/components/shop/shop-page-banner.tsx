export function ShopPageBanner() {
  return (
    <div
      className="h-20 w-full bg-brand-primary opacity-80 md:h-40"
      aria-hidden="true"
      style={{
        backgroundImage: 'url(/images/shop/shop_banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
