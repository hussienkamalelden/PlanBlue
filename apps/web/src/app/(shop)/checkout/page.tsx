import { CheckoutForm } from '@/components/shop/checkout-form';
import type { Metadata } from 'next';
import {
  fetchExtras,
  fetchShipping,
  findGiftWrappingExtra,
} from '@/lib/api/strapi.server';
import type { StrapiExtra, StrapiShipping } from '@/lib/types/strapi';

export const metadata: Metadata = {
  title: 'Checkout',
};

export default async function CheckoutPage() {
  let shippingOptions: StrapiShipping[] = [];
  let giftWrapping: StrapiExtra | null = null;

  try {
    shippingOptions = await fetchShipping();
  } catch {
    shippingOptions = [];
  }

  try {
    const extras = await fetchExtras();
    giftWrapping = findGiftWrappingExtra(extras);
  } catch {
    giftWrapping = null;
  }

  return (
    <CheckoutForm
      shippingOptions={shippingOptions}
      giftWrapping={giftWrapping}
    />
  );
}
