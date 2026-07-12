'use client';

import { useEffect } from 'react';

import { useCartStore } from '@/lib/cart/cart-store';

function itemNeedsEnrichment(item: {
  imageUrl?: string | null;
  description?: string;
  description_ar?: string;
  sku?: string | null;
}): boolean {
  return (
    !item.imageUrl ||
    item.description === undefined ||
    item.description_ar === undefined ||
    item.sku === undefined
  );
}

export function useCartItemImages() {
  const items = useCartStore((state) => state.items);
  const syncItemDetails = useCartStore((state) => state.syncItemDetails);

  const enrichmentKey = items
    .filter(itemNeedsEnrichment)
    .map((item) => item.documentId)
    .join('|');

  useEffect(() => {
    const missingIds = items
      .filter(itemNeedsEnrichment)
      .map((item) => item.documentId);

    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadDetails() {
      try {
        const response = await fetch('/api/cart/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds: missingIds }),
        });

        if (!response.ok || cancelled) {
          return;
        }

        const data = (await response.json()) as {
          details?: Record<
            string,
            {
              imageUrl: string | null;
              description: string;
              description_ar: string;
              sku: string | null;
              discount_percentage: number;
            }
          >;
        };

        if (cancelled || !data.details) {
          return;
        }

        syncItemDetails(
          Object.entries(data.details).map(([documentId, detail]) => ({
            documentId,
            imageUrl: detail.imageUrl,
            description: detail.description,
            description_ar: detail.description_ar,
            sku: detail.sku,
            discount_percentage: detail.discount_percentage,
          })),
        );
      } catch {
        // Optional metadata — keep placeholders on failure.
      }
    }

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [enrichmentKey, syncItemDetails]);
}
