import { CheckoutForm } from '@/components/shop/checkout-form';
import { fetchShipping } from '@/lib/api/strapi.server';
import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';
import type { StrapiShipping } from '@/lib/types/strapi';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.checkout.title,
  };
}

export default async function CheckoutPage() {
  let shippingOptions: StrapiShipping[] = [];

  try {
    shippingOptions = await fetchShipping();
  } catch {
    shippingOptions = [];
  }

  return <CheckoutForm shippingOptions={shippingOptions} />;
}
