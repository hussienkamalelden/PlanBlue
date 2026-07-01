import { notFound } from 'next/navigation';

import { ProductDetailView } from '@/components/shop/product-detail-view';
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from '@/lib/api/strapi.server';

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(product);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </main>
  );
}
