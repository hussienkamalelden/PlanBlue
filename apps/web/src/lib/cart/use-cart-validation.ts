'use client';

import { useEffect, useMemo, useState } from 'react';

import { useCartStore } from '@/lib/cart/cart-store';
import type { CartValidationResult } from '@/lib/cart/validate-cart';
import { hasBlockingCartIssues } from '@/lib/cart/validate-cart';

type ValidationStatus = 'idle' | 'loading' | 'ready' | 'error';

type UseCartValidationResult = {
  status: ValidationStatus;
  validation: CartValidationResult | null;
  isBlocked: boolean;
  refresh: () => void;
};

export function useCartValidation(): UseCartValidationResult {
  const items = useCartStore((state) => state.items);
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [validation, setValidation] = useState<CartValidationResult | null>(
    null,
  );
  const [refreshToken, setRefreshToken] = useState(0);

  const cartFingerprint = useMemo(
    () =>
      items
        .map(
          (item) =>
            `${item.documentId}:${item.quantity}:${item.price}:${item.has_sale}:${item.discountPrice ?? 'null'}`,
        )
        .join('|'),
    [items],
  );

  useEffect(() => {
    const currentItems = useCartStore.getState().items;

    if (currentItems.length === 0) {
      setValidation(null);
      setStatus('idle');
      return;
    }

    let cancelled = false;

    async function validateCart() {
      setStatus('loading');

      try {
        const response = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: currentItems.map((item) => ({
              documentId: item.documentId,
              quantity: item.quantity,
              price: item.price,
              discountPrice: item.discountPrice,
              has_sale: item.has_sale,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Cart validation failed');
        }

        const result = (await response.json()) as CartValidationResult;

        if (cancelled) {
          return;
        }

        useCartStore.getState().syncItemSnapshots(
          result.items
            .filter((item) => item.stockQuantity !== null)
            .map((item) => ({
              documentId: item.documentId,
              stockQuantity: item.stockQuantity as number,
            })),
        );

        setValidation(result);
        setStatus('ready');
      } catch {
        if (!cancelled) {
          setValidation(null);
          setStatus('error');
        }
      }
    }

    void validateCart();

    return () => {
      cancelled = true;
    };
  }, [cartFingerprint, refreshToken]);

  return {
    status,
    validation,
    isBlocked:
      status === 'loading' ||
      status === 'error' ||
      hasBlockingCartIssues(validation),
    refresh: () => setRefreshToken((value) => value + 1),
  };
}
