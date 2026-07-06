import { getShopItemPrices } from '@/lib/api/strapi';
import type { CartLineItem } from '@/lib/cart/cart-store';
import {
  getStockQuantity,
  isShopItemOutOfStock,
} from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';

export type CartValidationPayloadItem = Pick<
  CartLineItem,
  'documentId' | 'quantity' | 'price' | 'discountPrice' | 'has_sale'
>;

export type CartItemIssue =
  | { type: 'not_found' }
  | { type: 'unavailable' }
  | { type: 'insufficient_stock'; available: number }
  | {
      type: 'price_changed';
      currentPrice: number;
      currentDiscountPrice: number | null;
      currentHasSale: boolean;
    };

export type CartItemValidation = {
  documentId: string;
  valid: boolean;
  issues: CartItemIssue[];
  stockQuantity: number | null;
};

export type CartValidationResult = {
  valid: boolean;
  items: CartItemValidation[];
};

const PRICE_EPSILON = 0.01;

function pricesEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < PRICE_EPSILON;
}

function nullablePricesEqual(
  a: number | null,
  b: number | null,
): boolean {
  if (a === null && b === null) {
    return true;
  }

  if (a === null || b === null) {
    return false;
  }

  return pricesEqual(a, b);
}

export function getCartLineUnitPrice(item: CartLineItem): number {
  return item.has_sale && item.discountPrice !== null
    ? item.discountPrice
    : item.price;
}

export function validateCartItem(
  cartItem: CartValidationPayloadItem,
  shopItem: StrapiShopItem | null,
): CartItemValidation {
  if (!shopItem) {
    return {
      documentId: cartItem.documentId,
      valid: false,
      issues: [{ type: 'not_found' }],
      stockQuantity: null,
    };
  }

  const stockQuantity = getStockQuantity(shopItem);
  const issues: CartItemIssue[] = [];
  const { basePrice, salePrice } = getShopItemPrices(shopItem);

  if (
    !pricesEqual(cartItem.price, basePrice) ||
    cartItem.has_sale !== shopItem.has_sale ||
    !nullablePricesEqual(cartItem.discountPrice, salePrice)
  ) {
    issues.push({
      type: 'price_changed',
      currentPrice: basePrice,
      currentDiscountPrice: salePrice,
      currentHasSale: shopItem.has_sale,
    });
  }

  if (isShopItemOutOfStock(shopItem)) {
    issues.push({ type: 'unavailable' });
  } else if (cartItem.quantity > stockQuantity) {
    issues.push({
      type: 'insufficient_stock',
      available: stockQuantity,
    });
  }

  return {
    documentId: cartItem.documentId,
    valid: issues.length === 0,
    issues,
    stockQuantity,
  };
}

export function validateCartItems(
  cartItems: CartValidationPayloadItem[],
  shopItems: StrapiShopItem[],
): CartValidationResult {
  const itemMap = new Map(
    shopItems.map((shopItem) => [shopItem.documentId, shopItem]),
  );

  const items = cartItems.map((cartItem) =>
    validateCartItem(cartItem, itemMap.get(cartItem.documentId) ?? null),
  );

  return {
    valid: items.every((item) => item.valid),
    items,
  };
}

export function getItemValidation(
  result: CartValidationResult | null,
  documentId: string,
): CartItemValidation | null {
  return result?.items.find((item) => item.documentId === documentId) ?? null;
}

export function hasBlockingCartIssues(
  result: CartValidationResult | null,
): boolean {
  return result !== null && !result.valid;
}
