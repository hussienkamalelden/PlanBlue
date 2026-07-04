import type { Core } from '@strapi/strapi';

import { getPopulatedOrderItems } from './order-emails';
import { syncOrderStockChanges } from './order-stock';

type StockOrderItem = {
  quantity: number;
  product?: {
    id?: number;
    documentId?: string;
    available_stock?: number;
    total_sold?: number;
  } | null;
};

const publishedOrderStockSnapshots = new Map<string, StockOrderItem[]>();

function hasProductDocumentId(
  item: StockOrderItem,
): item is StockOrderItem & {
  product: { documentId: string; available_stock?: number; total_sold?: number };
} {
  return Boolean(item.product?.documentId);
}

async function normalizeOrderItemsForStock(
  strapi: Core.Strapi,
  items: StockOrderItem[],
): Promise<StockOrderItem[]> {
  const normalized: StockOrderItem[] = [];

  for (const item of items) {
    let product = item.product;

    if (product && !product.documentId) {
      const where = product.id
        ? { id: product.id }
        : null;

      if (where) {
        const row = await strapi.db.query('api::product.product').findOne({
          where,
          select: ['id', 'documentId', 'available_stock', 'total_sold'],
        });

        if (row) {
          product = row;
        }
      }
    }

    normalized.push({
      ...item,
      product,
    });
  }

  return normalized;
}

async function shouldSyncStockForOrder(
  strapi: Core.Strapi,
  documentId: string,
): Promise<boolean> {
  const order = await strapi.documents('api::order.order').findOne({
    documentId,
    status: 'published',
  });

  return Boolean(
    order?.is_processed &&
      order.status_type !== 'cancelled' &&
      !order.is_stock_reversed,
  );
}

export async function capturePublishedOrderStockSnapshot(
  strapi: Core.Strapi,
  documentId: string,
): Promise<void> {
  if (!(await shouldSyncStockForOrder(strapi, documentId))) {
    return;
  }

  const previousItems = await normalizeOrderItemsForStock(
    strapi,
    await getPopulatedOrderItems(strapi, documentId, 'published'),
  );

  publishedOrderStockSnapshots.set(documentId, previousItems);

  strapi.log.info(
    `[ORDER-STOCK] Captured ${previousItems.length} published item(s) for ${documentId}`,
  );
}

export async function applyOrderStockSyncAfterPublish(
  strapi: Core.Strapi,
  documentId: string,
): Promise<void> {
  const previousOrderItems = publishedOrderStockSnapshots.get(documentId);
  publishedOrderStockSnapshots.delete(documentId);

  if (!previousOrderItems) {
    strapi.log.info(
      `[ORDER-STOCK] No pre-publish snapshot for ${documentId} — skip stock sync`,
    );
    return;
  }

  if (!(await shouldSyncStockForOrder(strapi, documentId))) {
    return;
  }

  const currentOrderItems = await normalizeOrderItemsForStock(
    strapi,
    await getPopulatedOrderItems(strapi, documentId, 'published'),
  );

  strapi.log.info(
    `[ORDER-STOCK] Post-publish sync ${documentId}: ${previousOrderItems.length} → ${currentOrderItems.length} item(s)`,
  );

  await syncOrderStockChanges(
    strapi,
    previousOrderItems.filter(hasProductDocumentId),
    currentOrderItems.filter(hasProductDocumentId),
  );
}

export function registerOrderStockDocumentMiddleware(strapi: Core.Strapi): void {
  const ORDER_UID = 'api::order.order';

  strapi.documents.use(async (ctx, next) => {
    if (ctx.uid !== ORDER_UID) {
      return next();
    }

    const documentId = (ctx.params as { documentId?: string } | undefined)
      ?.documentId;

    if (ctx.action === 'publish' && documentId) {
      await capturePublishedOrderStockSnapshot(strapi, documentId);
    }

    const result = await next();

    if (ctx.action === 'publish' && documentId) {
      try {
        await applyOrderStockSyncAfterPublish(strapi, documentId);
      } catch (error) {
        strapi.log.error(
          `[ORDER-STOCK] Failed post-publish stock sync for ${documentId}:`,
          error,
        );
      }
    }

    return result;
  });
}
