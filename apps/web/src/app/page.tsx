import { HomeHero } from '@/components/home/home-hero';
import { PopularCategoriesSection } from '@/components/home/popular-categories-section';
import { PopularShopSection } from '@/components/home/popular-shop-section';
import { TopSellingShopSection } from '@/components/home/top-selling-shop-section';
import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: {
      absolute: t.common.brand,
    },
  };
}

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <PopularCategoriesSection />
      {/* <HomeOffersSection /> */}
      <TopSellingShopSection />
      <PopularShopSection />
    </main>
  );
}
