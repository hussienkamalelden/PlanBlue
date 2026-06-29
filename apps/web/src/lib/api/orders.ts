"use client";

import type { CartLineItem } from "@/lib/cart/cart-store";
import { STRAPI_URL } from "./strapi";

export type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  governorate: string;
  address: string;
  promo_code?: string;
  extra_notes?: string;
  order_items: string;
  total: number;
  order_id: string;
  status_type: "pending";
};

export type OrderResponse = {
  data: {
    id: number;
    documentId: string;
    order_id: string;
  };
};

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PB-${timestamp}-${random}`;
}

function serializeCartItems(items: CartLineItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      documentId: item.documentId,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.has_sale && item.discountPrice !== null
        ? item.discountPrice
        : item.price,
    })),
  );
}

function calculateTotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => {
    const unitPrice =
      item.has_sale && item.discountPrice !== null
        ? item.discountPrice
        : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);
}

export async function createOrder(
  formData: {
    name: string;
    email: string;
    phone: string;
    governorate: string;
    address: string;
    promo_code: string;
    extra_notes: string;
  },
  items: CartLineItem[],
): Promise<OrderResponse> {
  const total = calculateTotal(items);
  const order_id = generateOrderId();

  const payload: OrderPayload = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    governorate: formData.governorate,
    address: formData.address,
    promo_code: formData.promo_code || undefined,
    extra_notes: formData.extra_notes || undefined,
    order_items: serializeCartItems(items),
    total: Number(total.toFixed(2)),
    order_id,
    status_type: "pending",
  };

  const response = await fetch(`${STRAPI_URL}/api/orders?status=published`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error?.message ?? `Order failed (${response.status})`,
    );
  }

  return response.json() as Promise<OrderResponse>;
}

export { calculateTotal, generateOrderId };
