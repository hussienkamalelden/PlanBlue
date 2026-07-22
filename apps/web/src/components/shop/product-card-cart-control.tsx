'use client';

import type { MouseEvent } from 'react';
import { ShoppingCart } from 'lucide-react';

import { buildCartLineFromShopItem } from '@/lib/cart/build-cart-line';
import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';
import {
  getRemainingAddableQuantity,
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
  const stockCap = getStockQuantity(item);
  const remainingAddable = getRemainingAddableQuantity(item, quantity);
  const outOfStock = isShopItemOutOfStock(item);
  const atIncrementLimit = remainingAddable <= 0;

  if (outOfStock) {
    return null;
  }

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    stopCardNavigation(event);
    if (getRemainingAddableQuantity(item, quantity) < 1) {
      return;
    }
    addItem(buildCartLineFromShopItem(item, 1));
  }

  function handleIncrement(event: MouseEvent<HTMLButtonElement>) {
    stopCardNavigation(event);
    if (remainingAddable <= 0) {
      return;
    }
    setItemQuantity(item.documentId, Math.min(quantity + 1, stockCap));
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
        disabled={atIncrementLimit}
        aria-label={t.shopItemDetail.addToCart}
      >
        <ShoppingCart
          className="pb-product-card-cart__icon"
          aria-hidden="true"
        />
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
        disabled={atIncrementLimit}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
