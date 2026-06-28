import type { StrapiProduct } from "@/lib/types/strapi";

/** Strapi field is `available_stock`; exposed as stock quantity for UI logic. */
export function getStockQuantity(product: StrapiProduct): number {
  return product.available_stock;
}

export function isProductOutOfStock(product: StrapiProduct): boolean {
  return !product.available || getStockQuantity(product) === 0;
}

export function isQuantityExceedsStock(
  quantity: number,
  product: StrapiProduct,
): boolean {
  return quantity > getStockQuantity(product);
}

export function arePurchaseActionsDisabled(
  quantity: number,
  product: StrapiProduct,
): boolean {
  return isProductOutOfStock(product) || isQuantityExceedsStock(quantity, product);
}
