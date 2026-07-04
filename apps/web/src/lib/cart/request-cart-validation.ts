import type { CartLineItem } from '@/lib/cart/cart-store';
import { useCartStore } from '@/lib/cart/cart-store';
import type { CartValidationResult } from '@/lib/cart/validate-cart';

export async function requestCartValidation(
  items: CartLineItem[],
): Promise<CartValidationResult> {
  const response = await fetch('/api/cart/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        documentId: item.documentId,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice,
        has_sale: item.has_sale,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('Cart validation failed');
  }

  const result = (await response.json()) as CartValidationResult;

  useCartStore.getState().syncItemSnapshots(
    result.items
      .filter((item) => item.stockQuantity !== null)
      .map((item) => ({
        documentId: item.documentId,
        stockQuantity: item.stockQuantity as number,
      })),
  );

  return result;
}
