import { CheckoutForm } from "@/components/shop/checkout-form";
import { fetchShipping } from "@/lib/api/strapi.server";
import type { StrapiShipping } from "@/lib/types/strapi";

export default async function CheckoutPage() {
  let shippingOptions: StrapiShipping[] = [];

  try {
    shippingOptions = await fetchShipping();
  } catch {
    shippingOptions = [];
  }

  return <CheckoutForm shippingOptions={shippingOptions} />;
}
