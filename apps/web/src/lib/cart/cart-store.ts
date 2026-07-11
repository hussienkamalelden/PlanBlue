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
  imageUrl?: string | null;
};

type CartState = {
  items: CartLineItem[];
  addItem: (item: CartLineItem) => void;
  setItemQuantity: (documentId: string, quantity: number) => void;
  removeItem: (documentId: string) => void;
  clearCart: () => void;
  isInCart: (documentId: string) => boolean;
  syncItemSnapshots: (
    snapshots: Array<{ documentId: string; stockQuantity: number }>,
  ) => void;
  syncItemImages: (
    images: Array<{ documentId: string; imageUrl: string | null }>,
  ) => void;
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
                    imageUrl: item.imageUrl ?? line.imageUrl ?? null,
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

      syncItemSnapshots: (snapshots) => {
        if (snapshots.length === 0) {
          return;
        }

        const snapshotMap = new Map(
          snapshots.map((snapshot) => [snapshot.documentId, snapshot.stockQuantity]),
        );

        set({
          items: get().items.map((line) => {
            const stockQuantity = snapshotMap.get(line.documentId);
            return stockQuantity === undefined
              ? line
              : { ...line, stockQuantity };
          }),
        });
      },

      syncItemImages: (images) => {
        if (images.length === 0) {
          return;
        }

        const imageMap = new Map(
          images.map((entry) => [entry.documentId, entry.imageUrl]),
        );

        set({
          items: get().items.map((line) => {
            const imageUrl = imageMap.get(line.documentId);
            return imageUrl === undefined
              ? line
              : { ...line, imageUrl };
          }),
        });
      },
    }),
    { name: CART_STORAGE_KEY },
  ),
);
