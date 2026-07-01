import { render } from '@react-email/components';
import ClientOrderEmail from '../../../../emails/ClientOrderEmail';
import AdminOrderEmail from '../../../../emails/AdminOrderEmail';
import React from 'react';

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
  };
};

function formatOrderItemsForEmail(items: OrderItem[]): string {
  return items
    .map((item) => {
      const title = item.product?.title ?? item.product_title ?? 'Product';
      const sku = item.product?.sku ? ` (${item.product.sku})` : '';
      return `• ${title}${sku} × ${item.quantity} — ${item.price_at_purchase} EGP`;
    })
    .join('\n');
}

async function getPopulatedOrderItems(documentId: string): Promise<OrderItem[]> {
  try {
    const fullOrder = await strapi.documents('api::order.order').findOne({
      documentId,
      populate: {
        order_items: {
          populate: {
            product: {
              fields: ['title', 'sku', 'available_stock', 'total_sold'],
            },
          },
        },
      },
      status: 'published',
    });

    return (fullOrder?.order_items ?? []) as OrderItem[];
  } catch (error) {
    strapi.log.error('Failed to fetch order items:', error);
    return [];
  }
}

function calculateOrderSubtotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0,
  );
}

async function processNewOrder(result: any) {
  const orderItems = await getPopulatedOrderItems(result.documentId);

  // Set product_title on each order item for dashboard visibility
  try {
    for (const item of orderItems) {
      if (item.product?.title && !item.product_title) {
        await strapi.db.query('orders.order-item').update({
          where: { id: item.id },
          data: { product_title: item.product.title },
        });
      }
    }
  } catch (error) {
    strapi.log.error('Failed to set product titles:', error);
  }

  // Save or update client data
  try {
    const existingClients = await strapi
      .documents('api::client.client')
      .findMany({
        filters: { email: result.email },
        status: 'published',
      });

    if (existingClients.length === 0) {
      await strapi.documents('api::client.client').create({
        data: {
          name: result.name,
          email: result.email,
          phone: result.phone,
          address: result.address,
          promo_code: result.promo_code || null,
        },
        status: 'published',
      });
    } else {
      await strapi.documents('api::client.client').update({
        documentId: existingClients[0].documentId,
        data: {
          name: result.name,
          phone: result.phone,
          address: result.address,
        },
        status: 'published',
      });
    }
  } catch (error) {
    strapi.log.error('Failed to save client data:', error);
  }

  // Decrease product stock and increase total_sold
  for (const item of orderItems) {
    if (!item.product?.documentId || !item.quantity) continue;

    const currentStock = item.product.available_stock ?? 0;
    const currentSold = item.product.total_sold ?? 0;
    const newStock = Math.max(0, currentStock - item.quantity);

    try {
      await strapi.db.query('api::product.product').updateMany({
        where: { documentId: item.product.documentId },
        data: {
          available_stock: newStock,
          available: newStock > 0,
          total_sold: currentSold + item.quantity,
        },
      });
    } catch (error) {
      strapi.log.error(`Failed to update product ${item.product.documentId}:`, error);
    }
  }

  // Mark order as processed so subsequent publishes won't re-run
  try {
    await strapi.db.query('api::order.order').updateMany({
      where: { documentId: result.documentId },
      data: { is_processed: true },
    });
  } catch (error) {
    strapi.log.error('Failed to mark order as processed:', error);
  }

  // Send order confirmation emails
  try {
    const formattedItems = formatOrderItemsForEmail(orderItems);
    const subtotal = calculateOrderSubtotal(orderItems);
    const shippingCost = Number(result.shipping_cost ?? 0);
    const giftWrapping = Boolean(result.gift_wrapping);
    const giftWrappingCost = Number(result.gift_wrapping_cost ?? 0);

    const emailHtml = await render(
      React.createElement(ClientOrderEmail, {
        name: result.name,
        order_id: result.order_id,
        subtotal: Number(subtotal.toFixed(2)),
        shipping_cost: Number(shippingCost.toFixed(2)),
        gift_wrapping: giftWrapping,
        gift_wrapping_cost: Number(giftWrappingCost.toFixed(2)),
        total: result.total,
        address: result.address,
        phone: result.phone,
        extra_notes: result.extra_notes || '',
        order_items: formattedItems,
        governorate: result.governorate,
        promo_code: result.promo_code || '',
      }),
    );
    await strapi.plugins['email'].services.email.send({
      to: result.email,
      from: process.env.RESEND_DEFAULT_FROM,
      subject: `PlanBlue - Order Confirmation #${result.order_id}`,
      html: emailHtml,
    });

    const adminEmailHtml = await render(
      React.createElement(AdminOrderEmail, {
        name: result.name,
        order_id: result.order_id,
        subtotal: Number(subtotal.toFixed(2)),
        shipping_cost: Number(shippingCost.toFixed(2)),
        gift_wrapping: giftWrapping,
        gift_wrapping_cost: Number(giftWrappingCost.toFixed(2)),
        total: result.total,
        address: result.address,
        phone: result.phone,
        extra_notes: result.extra_notes || '',
        order_items: formattedItems,
        governorate: result.governorate,
        promo_code: result.promo_code || '',
      }),
    );
    await strapi.plugins['email'].services.email.send({
      to: 'planbluestore@gmail.com',
      from: process.env.RESEND_DEFAULT_FROM,
      subject: `New Order Received! Order #${result.order_id}`,
      html: adminEmailHtml,
    });
  } catch (error) {
    strapi.log.error('Failed to send order emails:', error);
  }
}

async function handleCancellation(result: any) {
  const orderItems = await getPopulatedOrderItems(result.documentId);

  for (const item of orderItems) {
    if (!item.product?.documentId || !item.quantity) continue;

    const currentStock = item.product.available_stock ?? 0;
    const currentSold = item.product.total_sold ?? 0;

    try {
      await strapi.db.query('api::product.product').updateMany({
        where: { documentId: item.product.documentId },
        data: {
          available_stock: currentStock + item.quantity,
          available: true,
          total_sold: Math.max(0, currentSold - item.quantity),
        },
      });
    } catch (error) {
      strapi.log.error(`Failed to restore stock for ${item.product.documentId}:`, error);
    }
  }
}

export default {
  async afterCreate(event: any) {
    const { result } = event;

    if (!result.publishedAt) return;

    // First-time processing: decrease stock, send emails
    if (!result.is_processed) {
      await processNewOrder(result);
      return;
    }

    // Already processed — check if cancelled and stock not yet reversed
    if (result.status_type === 'cancelled' && !result.is_stock_reversed) {
      strapi.log.info(`[ORDER] Cancelling order ${result.documentId} — restoring stock`);
      await handleCancellation(result);

      // Prevent double-revert on future publishes
      try {
        await strapi.db.query('api::order.order').updateMany({
          where: { documentId: result.documentId },
          data: { is_stock_reversed: true },
        });
      } catch (error) {
        strapi.log.error('Failed to mark stock reversal:', error);
      }
    }
  },
};
