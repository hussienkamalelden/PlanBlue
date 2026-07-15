import { HomeDealsBackdrop } from '@/components/home/home-deals-backdrop';
import { PopularShopCarousel } from '@/components/home/popular-shop-carousel';
import { TopSellingShopHeading } from '@/components/home/top-selling-shop-heading';
import { fetchShopItems } from '@/lib/api/strapi.server';

export async function TopSellingShopSection() {
  const { data: allItems } = await fetchShopItems({ pageSize: 12, sort: 'total_sold:desc' });
  const topItems = allItems;

  if (topItems.length === 0) {
    return null;
  }

  return (
    <section className="pb-top-selling-section pb-home-section relative overflow-hidden bg-[#4389F7]/10 text-center">
      <HomeDealsBackdrop />

      <div className="pb-large-container relative z-10">
        <TopSellingShopHeading />

        <div className="popular-shop-carousel-wrap">
          <PopularShopCarousel items={topItems} />
        </div>
      </div>
    </section>
  );
}
