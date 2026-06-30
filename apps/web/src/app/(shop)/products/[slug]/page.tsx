import { notFound } from 'next/navigation';

import { ProductDetailView } from '@/components/shop/product-detail-view';
import { fetchProductBySlug } from '@/lib/api/strapi.server';
import { getLocale } from '@/lib/i18n/get-locale';

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  const product = await fetchProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ProductDetailView product={product} />
    </main>
  );
}
