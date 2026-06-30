"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CART_STORAGE_KEY } from "./types";

export type CartLineItem = {
  documentId: string;
  slug: string;
  title: string;
  quantity: number;
  price: number;
  discountPrice: number | null;
  has_sale: boolean;
  stockQuantity: number;
};

type CartState = {
  items: CartLineItem[];
  addItem: (item: CartLineItem) => void;
  setItemQuantity: (documentId: string, quantity: number) => void;
  removeItem: (documentId: string) => void;
  clearCart: () => void;
  isInCart: (documentId: string) => boolean;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(
          (line) => line.documentId === item.documentId,
        );

        if (existing) {
          set({
            items: get().items.map((line) =>
              line.documentId === item.documentId
                ? {
                    ...line,
                    quantity: line.quantity + item.quantity,
                    stockQuantity: item.stockQuantity,
                  }
                : line,
            ),
          });
          return;
        }

        set({ items: [...get().items, item] });
      },

      setItemQuantity: (documentId, quantity) => {
        set({
          items: get().items.map((line) =>
            line.documentId === documentId ? { ...line, quantity } : line,
          ),
        });
      },

      removeItem: (documentId) => {
        set({
          items: get().items.filter((line) => line.documentId !== documentId),
        });
      },

      clearCart: () => set({ items: [] }),

      isInCart: (documentId) => {
        return get().items.some((line) => line.documentId === documentId);
      },
    }),
    { name: CART_STORAGE_KEY },
  ),
);
