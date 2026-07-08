import { HomeHero } from '@/components/home/home-hero';
import { HomeOffersSection } from '@/components/home/home-offers-section';
import { PopularShopSection } from '@/components/home/popular-shop-section';
import { TopSellingShopSection } from '@/components/home/top-selling-shop-section';

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <HomeOffersSection />
      <PopularShopSection />
      <TopSellingShopSection />
    </main>
  );
}
