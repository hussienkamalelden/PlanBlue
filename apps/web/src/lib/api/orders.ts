"use client";

import type { CartLineItem } from "@/lib/cart/cart-store";
import { STRAPI_URL } from "./strapi";

export type OrderItemPayload = {
  quantity: number;
  price_at_purchase: number;
  product_title: string;
  product: {
    connect: string[];
  };
};

export type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  governorate: string;
  shipping_cost: number;
  address: string;
  promo_code?: string;
  extra_notes?: string;
  order_items: OrderItemPayload[];
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

function buildOrderItems(items: CartLineItem[]): OrderItemPayload[] {
  return items.map((item) => {
    const unitPrice =
      item.has_sale && item.discountPrice !== null
        ? item.discountPrice
        : item.price;

    return {
      quantity: item.quantity,
      price_at_purchase: Number(unitPrice.toFixed(2)),
      product_title: item.title,
      product: {
        connect: [item.documentId],
      },
    };
  });
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
    shipping_cost: number;
    address: string;
    promo_code: string;
    extra_notes: string;
  },
  items: CartLineItem[],
): Promise<OrderResponse> {
  const subtotal = calculateTotal(items);
  const total = subtotal + formData.shipping_cost;
  const order_id = generateOrderId();

  const payload: OrderPayload = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    governorate: formData.governorate,
    shipping_cost: Number(formData.shipping_cost.toFixed(2)),
    address: formData.address,
    promo_code: formData.promo_code || undefined,
    extra_notes: formData.extra_notes || undefined,
    order_items: buildOrderItems(items),
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
