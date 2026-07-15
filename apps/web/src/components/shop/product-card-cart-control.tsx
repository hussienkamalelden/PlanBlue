'use client';

import type { MouseEvent } from 'react';
import { ShoppingCart } from 'lucide-react';

import { buildCartLineFromShopItem } from '@/lib/cart/build-cart-line';
import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';
import {
  getStockQuantity,
  isShopItemOutOfStock,
} from '@/lib/shop/stock';
import type { StrapiShopItem } from '@/lib/types/strapi';

type ProductCardCartControlProps = {
  item: StrapiShopItem;
};

function stopCardNavigation(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function ProductCardCartControl({ item }: ProductCardCartControlProps) {
  const t = useTranslations();
  const cartLine = useCartStore((state) =>
    state.items.find((line) => line.documentId === item.documentId),
  );
  const addItem = useCartStore((state) => state.addItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const quantity = cartLine?.quantity ?? 0;
  const stockQuantity = getStockQuantity(item);
  const outOfStock = isShopItemOutOfStock(item);

  if (outOfStock) {
    return null;
  }

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    stopCardNavigation(event);
    addItem(buildCartLineFromShopItem(item, 1));
  }

  function handleIncrement(event: MouseEvent<HTMLButtonElement>) {
    stopCardNavigation(event);
    if (quantity >= stockQuantity) {
      return;
    }

    setItemQuantity(item.documentId, quantity + 1);
  }

  function handleDecrement(event: MouseEvent<HTMLButtonElement>) {
    stopCardNavigation(event);

    if (quantity <= 1) {
      removeItem(item.documentId);
      return;
    }

    setItemQuantity(item.documentId, quantity - 1);
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        className="pb-product-card-cart__add"
        onClick={handleAdd}
        aria-label={t.shopItemDetail.addToCart}
      >
        <ShoppingCart className="pb-product-card-cart__icon" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      className="pb-product-card-cart__qty"
      role="group"
      aria-label={t.shopItemDetail.addToCart}
      onClick={stopCardNavigation}
    >
      <button
        type="button"
        className="pb-product-card-cart__btn"
        onClick={handleDecrement}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="pb-product-card-cart__value" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className="pb-product-card-cart__btn"
        onClick={handleIncrement}
        disabled={quantity >= stockQuantity}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
