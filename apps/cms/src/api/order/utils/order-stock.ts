import type { Core } from '@strapi/strapi';

type StockOrderItem = {
  quantity: number;
  product?: {
    documentId: string;
    available_stock?: number;
    total_sold?: number;
  } | null;
};

function buildProductQuantityMap(items: StockOrderItem[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const item of items) {
    const documentId = item.product?.documentId;
    const quantity = Number(item.quantity ?? 0);

    if (!documentId || quantity <= 0) {
      continue;
    }

    map.set(documentId, (map.get(documentId) ?? 0) + quantity);
  }

  return map;
}

function buildStockDeltas(
  previousItems: StockOrderItem[],
  currentItems: StockOrderItem[],
): Map<string, number> {
  const previousMap = buildProductQuantityMap(previousItems);
  const currentMap = buildProductQuantityMap(currentItems);
  const deltas = new Map<string, number>();

  for (const [productId, currentQty] of currentMap) {
    const previousQty = previousMap.get(productId) ?? 0;
    const delta = currentQty - previousQty;

    if (delta !== 0) {
      deltas.set(productId, delta);
    }

    previousMap.delete(productId);
  }

  for (const [productId, previousQty] of previousMap) {
    deltas.set(productId, -previousQty);
  }

  return deltas;
}

async function applyProductStockDelta(
  strapi: Core.Strapi,
  productDocumentId: string,
  quantityDelta: number,
): Promise<void> {
  if (quantityDelta === 0) {
    return;
  }

  const product = await strapi.db.query('api::product.product').findOne({
    where: { documentId: productDocumentId },
  });

  if (!product) {
    strapi.log.warn(
      `[ORDER-STOCK] Product ${productDocumentId} not found while applying delta ${quantityDelta}`,
    );
    return;
  }

  const currentStock = Number(product.available_stock ?? 0);
  const currentSold = Number(product.total_sold ?? 0);

  if (quantityDelta > 0) {
    const newStock = Math.max(0, currentStock - quantityDelta);

    await strapi.db.query('api::product.product').updateMany({
      where: { documentId: productDocumentId },
      data: {
        available_stock: newStock,
        available: newStock > 0,
        total_sold: currentSold + quantityDelta,
      },
    });

    strapi.log.info(
      `[ORDER-STOCK] Deducted ${quantityDelta} from ${productDocumentId} (${currentStock} → ${newStock})`,
    );
    return;
  }

  const restoreQty = Math.abs(quantityDelta);
  const newStock = currentStock + restoreQty;

  await strapi.db.query('api::product.product').updateMany({
    where: { documentId: productDocumentId },
    data: {
      available_stock: newStock,
      available: true,
      total_sold: Math.max(0, currentSold - restoreQty),
    },
  });

  strapi.log.info(
    `[ORDER-STOCK] Restored ${restoreQty} to ${productDocumentId} (${currentStock} → ${newStock})`,
  );
}

export async function syncOrderStockChanges(
  strapi: Core.Strapi,
  previousItems: StockOrderItem[],
  currentItems: StockOrderItem[],
): Promise<void> {
  const deltas = buildStockDeltas(previousItems, currentItems);

  if (deltas.size === 0) {
    return;
  }

  for (const [productDocumentId, quantityDelta] of deltas) {
    try {
      await applyProductStockDelta(strapi, productDocumentId, quantityDelta);
    } catch (error) {
      strapi.log.error(
        `[ORDER-STOCK] Failed to apply delta ${quantityDelta} for ${productDocumentId}:`,
        error,
      );
    }
  }
}

export { buildProductQuantityMap, buildStockDeltas };
