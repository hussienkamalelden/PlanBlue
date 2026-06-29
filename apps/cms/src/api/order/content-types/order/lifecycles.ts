import { render } from '@react-email/components';
import ClientOrderEmail from '../../../../emails/ClientOrderEmail';
import AdminOrderEmail from '../../../../emails/AdminOrderEmail';
import React from 'react';

function parseOrderItems(raw: unknown): Array<{ documentId?: string; title: string; quantity: number; unitPrice: number }> {
  if (typeof raw === 'string') return JSON.parse(raw);
  if (Array.isArray(raw)) return raw;
  return [];
}

function formatOrderItemsForEmail(items: Array<{ title: string; quantity: number; unitPrice: number }>): string {
  return items
    .map((item) => `• ${item.title} × ${item.quantity} — ${item.unitPrice} EGP`)
    .join('\n');
}

export default {
  async afterCreate(event: any) {
    const { result } = event;

    // Only process published entries to avoid running twice (draft + publish)
    if (!result.publishedAt) return;

    // Decrease product stock based on ordered quantities
    try {
      const orderItems = parseOrderItems(result.order_items);

      for (const item of orderItems) {
        if (!item.documentId || !item.quantity) continue;

        const product = await strapi.documents('api::product.product').findOne({
          documentId: item.documentId,
          fields: ['available_stock'],
          status: 'published',
        });

        if (!product) continue;

        const newStock = Math.max(0, (product.available_stock ?? 0) - item.quantity);

        await strapi.documents('api::product.product').update({
          documentId: item.documentId,
          data: {
            available_stock: newStock,
            available: newStock > 0,
          },
          status: 'published',
        });
      }
    } catch (error) {
      strapi.log.error('Failed to decrease product stock:', error);
    }

    // Send order confirmation emails
    try {
      const orderItems = parseOrderItems(result.order_items);
      const formattedItems = formatOrderItemsForEmail(orderItems);

      const emailHtml = await render(
        React.createElement(ClientOrderEmail, {
          name: result.name,
          order_id: result.order_id,
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
  },
};
