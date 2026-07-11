'use client';

import { useEffect } from 'react';

import { useCartStore } from '@/lib/cart/cart-store';

export function useCartItemImages() {
  const items = useCartStore((state) => state.items);
  const syncItemImages = useCartStore((state) => state.syncItemImages);

  const missingImageKey = items
    .filter((item) => !item.imageUrl)
    .map((item) => item.documentId)
    .join('|');

  useEffect(() => {
    const missingIds = items
      .filter((item) => !item.imageUrl)
      .map((item) => item.documentId);

    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadImages() {
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
          images?: Record<string, string | null>;
        };

        if (cancelled || !data.images) {
          return;
        }

        syncItemImages(
          Object.entries(data.images).map(([documentId, imageUrl]) => ({
            documentId,
            imageUrl,
          })),
        );
      } catch {
        // Images are optional — keep placeholders on failure.
      }
    }

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [missingImageKey, syncItemImages]);
}
