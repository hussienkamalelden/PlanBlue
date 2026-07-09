import { PopularShopCarousel } from '@/components/home/popular-shop-carousel';
import { PopularShopHeading } from '@/components/home/popular-shop-heading';
import { HOME_ASSETS } from '@/lib/assets/home';
import { fetchShopItems } from '@/lib/api/strapi.server';

export async function PopularShopSection() {
  const { data: allItems } = await fetchShopItems({
    pageSize: 12,
    sort: 'views:desc',
  });
  const topItems = allItems;

  if (topItems.length === 0) {
    return null;
  }

  const shapes = HOME_ASSETS.shapes;

  return (
    <section className="relative overflow-hidden py-16 text-center md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        dir="ltr"
        aria-hidden="true"
      >
        <div
          className="absolute inset-x-0 top-0 h-32 bg-contain bg-top bg-no-repeat opacity-60"
          style={{ backgroundImage: `url(${shapes.carouselPattern1})` }}
        />
        <div
          className="absolute right-0 top-10 h-24 w-24 bg-contain bg-no-repeat opacity-70"
          style={{ backgroundImage: `url(${shapes.carouselPattern2})` }}
        />
      </div>

      <div className="pb-large-container relative z-10">
        <PopularShopHeading />

        <div className="popular-shop-carousel-wrap relative xl:px-10">
          <PopularShopCarousel items={topItems} />
        </div>
      </div>
    </section>
  );
}
