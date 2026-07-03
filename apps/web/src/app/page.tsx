import { ProductsView } from '@/components/shop/products-view';
import { fetchCategories, fetchProducts } from '@/lib/api/strapi.server';

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ProductsView categories={categories} products={products} />
    </main>
  );
}
