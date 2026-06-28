import { ProductsView } from "@/components/shop/products-view";
import { fetchCategories, fetchProducts } from "@/lib/api/strapi.server";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ProductsPage() {
  const locale = await getLocale();

  const [categories, products] = await Promise.all([
    fetchCategories(locale),
    fetchProducts(locale),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ProductsView categories={categories} products={products} />
    </main>
  );
}
