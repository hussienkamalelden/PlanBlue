import { render } from '@react-email/components';
import React from 'react';
import type { Core } from '@strapi/strapi';

import AdminOrderEmail from '../../../emails/AdminOrderEmail';
import ClientOrderEmail from '../../../emails/ClientOrderEmail';

type OrderItem = {
  id: number;
  quantity: number;
  price_at_purchase: number;
  product_title?: string;
  product?: {
    documentId: string;
    title: string;
    sku: string;
    available_stock: number;
    total_sold: number;
    price: number;
    has_sale: boolean;
    discount_percentage: number;
    need_batteries: boolean;
    batteries_size: string | null;
    batteries_quantity: string | null;
  };
};

type BatterySummaryItem = {
  size: string;
  quantity: number;
};

function buildBatteriesSummary(items: OrderItem[]): BatterySummaryItem[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const product = item.product;
    if (!product?.need_batteries || !product.batteries_size) continue;

    const perUnit = Number(product.batteries_quantity ?? 0);
    if (perUnit <= 0) continue;

    const totalQty = perUnit * item.quantity;
    const size = product.batteries_size;
    map.set(size, (map.get(size) ?? 0) + totalQty);
  }

  return Array.from(map.entries()).map(([size, quantity]) => ({ size, quantity }));
}

function formatBatteriesSummaryText(batteries: BatterySummaryItem[]): string {
  if (batteries.length === 0) return '';
  return batteries.map((b) => `${b.size} × ${b.quantity}`).join('\n');
}

type SendOrderEmailsOptions = {
  isUpdate?: boolean;
};

const ADMIN_ORDER_EMAIL =
  process.env.ADMIN_ORDER_EMAIL ?? 'planbluestore@gmail.com';

function formatOrderItemsForEmail(items: OrderItem[]): string {
  return items
    .map((item) => {
      const title = item.product?.title ?? item.product_title ?? 'Product';
      const sku = item.product?.sku ? ` (${item.product.sku})` : '';
      return `• ${title}${sku} × ${item.quantity} — ${item.price_at_purchase} EGP`;
    })
    .join('\n');
}

function formatOrderItemsListForClientEmail(items: OrderItem[]) {
  return items.map((item) => {
    const title = item.product?.title ?? item.product_title ?? 'Product';
    const sku = item.product?.sku ? ` (${item.product.sku})` : '';

    return {
      title: `${title}${sku}`,
      quantity: item.quantity,
      lineTotal: Number((item.price_at_purchase * item.quantity).toFixed(2)),
    };
  });
}

async function getPopulatedOrderItems(
  strapi: Core.Strapi,
  documentId: string,
  status: 'draft' | 'published' = 'published',
): Promise<OrderItem[]> {
  try {
    const fullOrder = await strapi.documents('api::order.order').findOne({
      documentId,
      populate: {
        order_items: {
          populate: {
            product: {
              fields: [
                'documentId',
                'title',
                'sku',
                'available_stock',
                'total_sold',
                'price',
                'has_sale',
                'discount_percentage',
                'need_batteries',
                'batteries_size',
                'batteries_quantity',
              ],
            },
          },
        },
      },
      status,
    });

    return (fullOrder?.order_items ?? []) as OrderItem[];
  } catch (error) {
    strapi.log.error(`Failed to fetch ${status} order items:`, error);
    return [];
  }
}

async function getLatestOrderItemsForStock(
  strapi: Core.Strapi,
  documentId: string,
): Promise<OrderItem[]> {
  const draftItems = await getPopulatedOrderItems(strapi, documentId, 'draft');

  if (draftItems.length > 0) {
    return draftItems;
  }

  return getPopulatedOrderItems(strapi, documentId, 'published');
}

function calculateOrderSubtotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0,
  );
}

export async function sendOrderNotificationEmails(
  strapi: Core.Strapi,
  documentId: string,
  options: SendOrderEmailsOptions = {},
): Promise<{ clientEmail: string; adminEmail: string }> {
  const isUpdate = options.isUpdate ?? false;

  const order = await strapi.documents('api::order.order').findOne({
    documentId,
    status: 'published',
  });

  if (!order) {
    throw new Error('Order not found.');
  }

  if (!order.email) {
    throw new Error('Order has no client email address.');
  }

  const orderItems = await getPopulatedOrderItems(strapi, documentId);

  if (orderItems.length === 0) {
    throw new Error('Order has no items to include in the email.');
  }

  const formattedItems = formatOrderItemsForEmail(orderItems);
  const orderItemsList = formatOrderItemsListForClientEmail(orderItems);
  const batteriesSummary = buildBatteriesSummary(orderItems);
  const batteriesText = formatBatteriesSummaryText(batteriesSummary);
  const subtotal = Number(
    (order.subtotal ?? calculateOrderSubtotal(orderItems)).toFixed(2),
  );
  const shippingCost = Number(order.shipping_cost ?? 0);
  const giftWrapping = Boolean(order.gift_wrapping);
  const giftWrappingCost = Number(order.gift_wrapping_cost ?? 0);
  const discountAmount = Number(order.discount_amount ?? 0);
  const promoDiscountPercentage = Number(order.promo_discount_percentage ?? 0);

  const emailProps = {
    name: String(order.name ?? ''),
    order_id: order.order_id ?? documentId,
    subtotal,
    discount_amount: discountAmount,
    promo_discount_percentage: promoDiscountPercentage,
    shipping_cost: Number(shippingCost.toFixed(2)),
    gift_wrapping: giftWrapping,
    gift_wrapping_cost: Number(giftWrappingCost.toFixed(2)),
    total: Number(order.total ?? 0),
    address: String(order.address ?? ''),
    phone: String(order.phone ?? ''),
    extra_notes: order.extra_notes || '',
    order_items: formattedItems,
    order_items_list: orderItemsList,
    governorate: String(order.governorate ?? ''),
    promo_code: order.promo_code || '',
    is_update: isUpdate,
    batteries_summary: batteriesText,
    batteries_list: batteriesSummary,
  };

  const clientSubject = isUpdate
    ? `PlanBlue - Updated Order #${order.order_id}`
    : `PlanBlue - Order Confirmation #${order.order_id}`;

  const adminSubject = isUpdate
    ? `Updated Order Details — Order #${order.order_id}`
    : `New Order Received! Order #${order.order_id}`;

  const clientEmailHtml = await render(
    React.createElement(ClientOrderEmail, emailProps),
  );

  const adminEmailHtml = await render(
    React.createElement(AdminOrderEmail, emailProps),
  );

  await strapi.plugins['email'].services.email.send({
    to: order.email,
    from: process.env.RESEND_DEFAULT_FROM,
    subject: clientSubject,
    html: clientEmailHtml,
  });

  await strapi.plugins['email'].services.email.send({
    to: ADMIN_ORDER_EMAIL,
    from: process.env.RESEND_DEFAULT_FROM,
    subject: adminSubject,
    html: adminEmailHtml,
  });

  strapi.log.info(
    `[ORDER-EMAIL] Sent ${isUpdate ? 'updated' : 'confirmation'} emails for order ${order.order_id}`,
  );

  return {
    clientEmail: order.email,
    adminEmail: ADMIN_ORDER_EMAIL,
  };
}

export {
  calculateOrderSubtotal,
  formatOrderItemsForEmail,
  formatOrderItemsListForClientEmail,
  getLatestOrderItemsForStock,
  getPopulatedOrderItems,
};
