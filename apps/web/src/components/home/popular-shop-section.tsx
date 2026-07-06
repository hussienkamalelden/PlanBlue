import { PopularShopCarousel } from '@/components/home/popular-shop-carousel';
import { HOME_ASSETS } from '@/lib/assets/home';
import { fetchShopItems } from '@/lib/api/strapi.server';
import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';
import { sortShopItems } from '@/lib/shop/filters';

export async function PopularShopSection() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const allItems = await fetchShopItems();
  const topItems = sortShopItems(allItems, 'top_sellers').slice(0, 12);

  if (topItems.length === 0) {
    return null;
  }

  const shapes = HOME_ASSETS.shapes;

  return (
    <section className="relative overflow-hidden py-16 text-center md:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-x-0 top-0 h-32 bg-contain bg-top bg-no-repeat opacity-60"
          style={{ backgroundImage: `url(${shapes.carouselPattern1})` }}
        />
        <div
          className="absolute end-0 top-10 h-24 w-24 bg-contain bg-no-repeat opacity-70"
          style={{ backgroundImage: `url(${shapes.carouselPattern2})` }}
        />
      </div>

      <div className="pb-large-container relative z-10">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl">
            {t.home.popular.title}{' '}
            <span className="text-[#4389F7]">{t.home.popular.highlight}</span>
          </h2>
        </div>

        <PopularShopCarousel items={topItems} />
      </div>
    </section>
  );
}
