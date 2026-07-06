import type { StrapiShopItem } from "@/lib/types/strapi";

/** Strapi field is `available_stock`; exposed as stock quantity for UI logic. */
export function getStockQuantity(item: StrapiShopItem): number {
  return item.available_stock;
}

export function isShopItemOutOfStock(item: StrapiShopItem): boolean {
  return !item.available || getStockQuantity(item) === 0;
}

export function isQuantityExceedsStock(
  quantity: number,
  item: StrapiShopItem,
): boolean {
  return quantity > getStockQuantity(item);
}

export function arePurchaseActionsDisabled(
  quantity: number,
  item: StrapiShopItem,
): boolean {
  return isShopItemOutOfStock(item) || isQuantityExceedsStock(quantity, item);
}
