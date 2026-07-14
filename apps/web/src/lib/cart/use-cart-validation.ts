'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCartStore } from '@/lib/cart/cart-store';
import { requestCartValidation } from '@/lib/cart/request-cart-validation';
import type { CartValidationResult } from '@/lib/cart/validate-cart';
import { hasBlockingCartIssues } from '@/lib/cart/validate-cart';

type ValidationStatus = 'idle' | 'loading' | 'ready' | 'error';

type UseCartValidationResult = {
  status: ValidationStatus;
  validation: CartValidationResult | null;
  isBlocked: boolean;
  refresh: () => void;
  validateNow: () => Promise<CartValidationResult | null>;
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

  const validateNow = useCallback(async (): Promise<CartValidationResult | null> => {
    const currentItems = useCartStore.getState().items;

    if (currentItems.length === 0) {
      setValidation(null);
      setStatus('idle');
      return null;
    }

    setStatus('loading');

    try {
      const result = await requestCartValidation(currentItems);
      setValidation(result);
      setStatus('ready');
      return result;
    } catch {
      setValidation(null);
      setStatus('error');
      return null;
    }
  }, []);

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
        const result = await requestCartValidation(currentItems);

        if (cancelled) {
          return;
        }

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
    validateNow,
  };
}
