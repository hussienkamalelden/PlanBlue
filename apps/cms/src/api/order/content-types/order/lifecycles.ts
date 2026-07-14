import { render } from '@react-email/components';
import AffiliateCommissionEmail from '../../../../emails/AffiliateCommissionEmail';
import React from 'react';

import {
  formatOrderItemsForEmail,
  getPopulatedOrderItems,
  sendOrderNotificationEmails,
} from '../../utils/order-emails';

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
  } | null;
};

function getStrapiMediaUrl(media: { url?: string } | null | undefined): string {
  if (!media?.url) return '';

  if (media.url.startsWith('http')) {
    return media.url;
  }

  const baseUrl =
    process.env.STRAPI_PUBLIC_URL ||
    strapi.config.get('server.url') ||
    'http://localhost:1337';

  return `${String(baseUrl).replace(/\/$/, '')}${media.url}`;
}

async function resolveProductFromItem(item: any): Promise<any | null> {
  if (!item.product) return null;

  // Already a full product object (from populate)
  if (typeof item.product === 'object' && item.product.title && item.product.price !== undefined) {
    return item.product;
  }

  // Numeric ID reference
  if (typeof item.product === 'number') {
    return strapi.db.query('api::product.product').findOne({ where: { id: item.product } });
  }

  // String documentId
  if (typeof item.product === 'string') {
    const results = await strapi.db.query('api::product.product').findMany({
      where: { documentId: item.product, publishedAt: { $ne: null } },
    });
    return results[0] ?? null;
  }

  // Object with connect/set arrays (admin panel format)
  if (typeof item.product === 'object') {
    const connectArray = item.product.connect ?? item.product.set;
    if (Array.isArray(connectArray) && connectArray.length > 0) {
      const first = connectArray[0];
      if (typeof first === 'string') {
        const results = await strapi.db.query('api::product.product').findMany({
          where: { documentId: first, publishedAt: { $ne: null } },
        });
        return results[0] ?? null;
      }
      if (first?.documentId) {
        const results = await strapi.db.query('api::product.product').findMany({
          where: { documentId: first.documentId, publishedAt: { $ne: null } },
        });
        return results[0] ?? null;
      }
      if (first?.id) {
        return strapi.db.query('api::product.product').findOne({ where: { id: first.id } });
      }
    }

    // Object with documentId or id
    if (item.product.documentId) {
      const results = await strapi.db.query('api::product.product').findMany({
        where: { documentId: item.product.documentId, publishedAt: { $ne: null } },
      });
      return results[0] ?? null;
    }
    if (item.product.id) {
      return strapi.db.query('api::product.product').findOne({ where: { id: item.product.id } });
    }
  }

  return null;
}

type EnrichedItemData = {
  product_title: string;
  price_at_purchase: number;
  quantity: number;
};

async function validateAndEnrichOrderData(data: any) {
  const orderItems = data.order_items;

  strapi.log.info(`[ORDER-ENRICH] Called. items count: ${orderItems?.length ?? 0}`);

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return;
  }

  const enrichedItems: EnrichedItemData[] = [];

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    let product: any = null;
    let quantity: number = 0;
    let priceAtPurchase: number = 0;

    if (item.id && !item.product && !item.quantity) {
      // Existing item sent as just {id} — load from DB
      const existing = await strapi.db.query('orders.order-item').findOne({
        where: { id: item.id },
        populate: ['product'],
      });
      if (existing?.product) {
        product = existing.product;
        quantity = Number(existing.quantity ?? 0);
        priceAtPurchase = Number(existing.price_at_purchase ?? 0);
      }
    } else {
      // Item has inline data (new or admin modified fields)
      product = await resolveProductFromItem(item);
      quantity = Number(item.quantity ?? 0);
      priceAtPurchase = Number(item.price_at_purchase ?? 0);

      // If product couldn't be resolved from inline data but item exists in DB,
      // load the product from the persisted record
      if (!product && item.id) {
        const existing = await strapi.db.query('orders.order-item').findOne({
          where: { id: item.id },
          populate: ['product'],
        });
        if (existing?.product) {
          product = existing.product;
        }
      }
    }

    if (!product) {
      strapi.log.warn(`[ORDER-ENRICH] Could not resolve product for item index ${i}`);
      enrichedItems.push({
        product_title: item.product_title ?? '',
        price_at_purchase: priceAtPurchase,
        quantity,
      });
      continue;
    }

    // Auto-fill product_title
    const productTitle = product.title ?? '';

    // Auto-fill price from product if missing/zero
    if (!priceAtPurchase || priceAtPurchase === 0) {
      let effectivePrice = Number(product.price ?? 0);
      if (product.has_sale && Number(product.discount_percentage ?? 0) > 0) {
        effectivePrice = effectivePrice - (effectivePrice * Number(product.discount_percentage)) / 100;
      }
      priceAtPurchase = Number(effectivePrice.toFixed(2));
    }

    // Stock validation:
    // - New items: check full quantity against available stock
    // - Existing items: only check the additional quantity (increase) against stock
    const isExistingItem = Boolean(item.id);
    const availableStock = Number(product.available_stock ?? 0);

    if (!isExistingItem) {
      if (quantity > availableStock) {
        throw new Error(
          `Insufficient stock for "${productTitle}". Requested: ${quantity}, Available: ${availableStock}`,
        );
      }
    } else {
      const existingRecord = await strapi.db.query('orders.order-item').findOne({
        where: { id: item.id },
      });
      const previousQuantity = Number(existingRecord?.quantity ?? 0);
      const addedQuantity = quantity - previousQuantity;

      if (addedQuantity > 0 && addedQuantity > availableStock) {
        throw new Error(
          `Insufficient stock for "${productTitle}". Additional requested: ${addedQuantity}, Available: ${availableStock}`,
        );
      }
    }

    // Set fields on the actual item for Strapi to persist
    item.product_title = productTitle;
    item.price_at_purchase = priceAtPurchase;

    strapi.log.info(`[ORDER-ENRICH] Enriched: "${productTitle}" price=${priceAtPurchase} qty=${quantity}`);

    enrichedItems.push({
      product_title: productTitle,
      price_at_purchase: priceAtPurchase,
      quantity,
    });
  }

  // Calculate subtotal from enriched data
  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0,
  );
  data.subtotal = Number(subtotal.toFixed(2));

  // Validate and apply promo code
  let discountAmount = 0;
  let promoDiscountPercentage = 0;

  const promoCode = data.promo_code?.trim();
  if (promoCode) {
    const affiliates = await strapi.documents('api::affiliate.affiliate').findMany({
      populate: { promocodes: true },
      status: 'published',
    });

    let matchedPromo: any = null;

    for (const affiliate of affiliates) {
      const promo = (affiliate.promocodes ?? []).find(
        (p: any) => p.code?.toLowerCase() === promoCode.toLowerCase(),
      );
      if (promo) {
        matchedPromo = promo;
        break;
      }
    }

    if (!matchedPromo) {
      throw new Error(
        `Promo code "${promoCode}" is invalid or does not exist.`,
      );
    }

    promoDiscountPercentage = Number(matchedPromo.discount_percentage ?? 0);
    discountAmount = Number(((subtotal * promoDiscountPercentage) / 100).toFixed(2));
  }

  data.promo_discount_percentage = promoDiscountPercentage;
  data.discount_amount = discountAmount;

  // Calculate total
  const shippingCost = Number(data.shipping_cost ?? 0);
  const giftWrappingCost = Number(data.gift_wrapping_cost ?? 0);
  data.total = Number((subtotal - discountAmount + shippingCost + giftWrappingCost).toFixed(2));

  strapi.log.info(`[ORDER-ENRICH] Final: subtotal=${data.subtotal} discount=${data.discount_amount} total=${data.total}`);
}

async function processAffiliateCommission(result: any) {
  const promoCode = result.promo_code?.trim();
  if (!promoCode) return;

  if (!result.publishedAt) return;

  if (result.status_type !== 'delivered') return;

  if (result.is_commission_credited) return;

  try {
    const affiliates = await strapi.documents('api::affiliate.affiliate').findMany({
      populate: {
        promocodes: true,
        avatar: true,
      },
      status: 'published',
    });

    let matchedAffiliate: any = null;
    let matchedPromo: any = null;

    for (const affiliate of affiliates) {
      const promo = (affiliate.promocodes ?? []).find(
        (p: any) => p.code?.toLowerCase() === promoCode.toLowerCase(),
      );
      if (promo) {
        matchedAffiliate = affiliate;
        matchedPromo = promo;
        break;
      }
    }

    if (!matchedAffiliate || !matchedPromo) return;

    const orderSubtotal = Number(result.subtotal ?? 0);
    const commissionPercentage = Number(matchedAffiliate.commission_percentage ?? 0);
    const earnedCommission = Number(
      ((orderSubtotal * commissionPercentage) / 100).toFixed(2),
    );

    if (earnedCommission <= 0) return;

    const currentPending = Number(matchedAffiliate.current_pending_commission ?? 0);
    const totalPaid = Number(matchedAffiliate.total_paid_commission ?? 0);
    const newPendingCommission = Number((currentPending + earnedCommission).toFixed(2));

    await strapi.db.query('api::affiliate.affiliate').updateMany({
      where: { documentId: matchedAffiliate.documentId },
      data: {
        current_pending_commission: newPendingCommission,
      },
    });

    await strapi.db.query('api::order.order').updateMany({
      where: { documentId: result.documentId },
      data: { is_commission_credited: true },
    });

    strapi.log.info(
      `[AFFILIATE] Credited ${earnedCommission} EGP to ${matchedAffiliate.name} on delivery (code: ${promoCode}, order: ${result.order_id})`,
    );

    try {
      const orderItems = await getPopulatedOrderItems(strapi, result.documentId);
      const formattedItems = formatOrderItemsForEmail(orderItems);
      const avatarUrl = getStrapiMediaUrl(matchedAffiliate.avatar);

      const emailHtml = await render(
        React.createElement(AffiliateCommissionEmail, {
          name: matchedAffiliate.name,
          avatar_url: avatarUrl || undefined,
          earned_commission: earnedCommission,
          current_pending_commission: newPendingCommission,
          total_paid_commission: totalPaid,
          commission_percentage: commissionPercentage,
          order_id: result.order_id,
          promo_code: promoCode,
          order_subtotal: orderSubtotal,
          order_items: formattedItems,
        }),
      );

      await strapi.plugins['email'].services.email.send({
        to: matchedAffiliate.email,
        from: process.env.RESEND_DEFAULT_FROM,
        subject: `PlanBlue — You earned ${earnedCommission} EGP commission! 🎉`,
        html: emailHtml,
      });
    } catch (emailError) {
      strapi.log.error('Failed to send affiliate commission email:', emailError);
    }
  } catch (error) {
    strapi.log.error('Failed to process affiliate commission:', error);
  }
}

async function processNewOrder(result: any) {
  const orderItems = await getPopulatedOrderItems(strapi, result.documentId);

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
    await sendOrderNotificationEmails(strapi, result.documentId);
  } catch (error) {
    strapi.log.error('Failed to send order emails:', error);
  }
}

async function handleCancellation(result: any) {
  const orderItems = await getPopulatedOrderItems(strapi, result.documentId);

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
  async beforeCreate(event: any) {
    const { data } = event.params;
    try {
      await validateAndEnrichOrderData(data);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;

    strapi.log.info(`[ORDER-ENRICH] beforeUpdate triggered. Keys: ${Object.keys(data).join(', ')}`);
    if (data.order_items) {
      try {
        await validateAndEnrichOrderData(data);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  },

  async afterUpdate(event: any) {
    const { result } = event;
    if (!result?.documentId) return;

    // After save, directly update component items that need enrichment
    try {
      const fullOrder = await strapi.documents('api::order.order').findOne({
        documentId: result.documentId,
        populate: {
          order_items: {
            populate: {
              product: {
                fields: [
                  'documentId',
                  'title',
                  'price',
                  'has_sale',
                  'discount_percentage',
                ],
              },
            },
          },
        },
        status: 'draft',
      });

      if (fullOrder?.order_items) {
        for (const item of fullOrder.order_items as any[]) {
          if (!item.product) continue;

          let needsUpdate = false;
          const updateData: any = {};

          if (!item.product_title || item.product_title !== item.product.title) {
            updateData.product_title = item.product.title;
            needsUpdate = true;
          }

          if (!item.price_at_purchase || item.price_at_purchase === 0) {
            let effectivePrice = Number(item.product.price ?? 0);
            if (item.product.has_sale && Number(item.product.discount_percentage ?? 0) > 0) {
              effectivePrice -= (effectivePrice * Number(item.product.discount_percentage)) / 100;
            }
            updateData.price_at_purchase = Number(effectivePrice.toFixed(2));
            needsUpdate = true;
          }

          if (needsUpdate) {
            await strapi.db.query('orders.order-item').update({
              where: { id: item.id },
              data: updateData,
            });
            strapi.log.info(`[ORDER-ENRICH] afterUpdate: updated item ${item.id} → ${JSON.stringify(updateData)}`);
          }
        }

        // Recalculate totals based on actual persisted data
        const items = fullOrder.order_items as any[];
        let subtotal = 0;
        for (const item of items) {
          let price = Number(item.price_at_purchase ?? 0);
          if (price === 0 && item.product) {
            price = Number(item.product.price ?? 0);
            if (item.product.has_sale && Number(item.product.discount_percentage ?? 0) > 0) {
              price -= (price * Number(item.product.discount_percentage)) / 100;
            }
          }
          subtotal += price * Number(item.quantity ?? 0);
        }

        const shippingCost = Number(result.shipping_cost ?? 0);
        const giftWrappingCost = Number(result.gift_wrapping_cost ?? 0);
        const discountAmount = Number(result.discount_amount ?? 0);
        const total = Number((subtotal - discountAmount + shippingCost + giftWrappingCost).toFixed(2));

        if (subtotal !== Number(result.subtotal ?? 0) || total !== Number(result.total ?? 0)) {
          await strapi.db.query('api::order.order').updateMany({
            where: { documentId: result.documentId },
            data: {
              subtotal: Number(subtotal.toFixed(2)),
              total,
            },
          });
          strapi.log.info(`[ORDER-ENRICH] afterUpdate: recalculated subtotal=${subtotal.toFixed(2)} total=${total}`);
        }
      }
    } catch (error) {
      strapi.log.error('[ORDER-ENRICH] afterUpdate enrichment failed:', error);
    }

    const publishedOrder = await strapi.documents('api::order.order').findOne({
      documentId: result.documentId,
      status: 'published',
    });

    if (
      publishedOrder?.is_processed &&
      publishedOrder.status_type === 'cancelled' &&
      !publishedOrder.is_stock_reversed
    ) {
      strapi.log.info(
        `[ORDER] Cancelling order ${result.documentId} on update — restoring stock`,
      );
      await handleCancellation(result);

      try {
        await strapi.db.query('api::order.order').updateMany({
          where: { documentId: result.documentId },
          data: { is_stock_reversed: true },
        });
      } catch (error) {
        strapi.log.error('Failed to mark stock reversal:', error);
      }
    }

    if (result.status_type === 'delivered' && !result.is_commission_credited) {
      await processAffiliateCommission(result);
    }
  },

  async afterCreate(event: any) {
    const { result } = event;

    if (!result.publishedAt) return;

    // First-time processing: decrease stock, send emails
    if (!result.is_processed) {
      await processNewOrder(result);

      if (result.status_type === 'delivered' && !result.is_commission_credited) {
        await processAffiliateCommission(result);
      }
      return;
    }

    if (result.status_type === 'delivered' && !result.is_commission_credited) {
      await processAffiliateCommission(result);
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
