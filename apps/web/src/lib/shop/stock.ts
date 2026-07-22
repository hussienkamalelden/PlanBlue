import type { StrapiShopItem } from "@/lib/types/strapi";

/** Strapi field is `available_stock`; exposed as stock quantity for UI logic. */
export function getStockQuantity(item: StrapiShopItem): number {
  return item.available_stock;
}

/** How many more units can be added from product details (total stock minus already in cart). */
export function getRemainingAddableQuantity(
  item: StrapiShopItem,
  quantityAlreadyInCart: number,
): number {
  return Math.max(0, getStockQuantity(item) - quantityAlreadyInCart);
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

export function isDetailAddQuantityExceedsAvailable(
  addQuantity: number,
  item: StrapiShopItem,
  quantityAlreadyInCart: number,
): boolean {
  return addQuantity > getRemainingAddableQuantity(item, quantityAlreadyInCart);
}

export function areDetailPurchaseActionsDisabled(
  addQuantity: number,
  item: StrapiShopItem,
  quantityAlreadyInCart: number,
): boolean {
  if (isShopItemOutOfStock(item)) {
    return true;
  }

  const remaining = getRemainingAddableQuantity(item, quantityAlreadyInCart);
  return remaining === 0 || addQuantity > remaining;
}
