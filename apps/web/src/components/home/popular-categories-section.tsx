import { PopularCategoriesCarousel } from '@/components/home/popular-categories-carousel';
import { PopularCategoriesHeading } from '@/components/home/popular-categories-heading';
import { fetchCategories } from '@/lib/api/strapi.server';

export async function PopularCategoriesSection() {
  const categories = await fetchCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="pb-popular-categories pb-home-section relative overflow-hidden text-center">
      <div className="pb-large-container relative z-10">
        <PopularCategoriesHeading />
        <PopularCategoriesCarousel categories={categories} />
      </div>
    </section>
  );
}
