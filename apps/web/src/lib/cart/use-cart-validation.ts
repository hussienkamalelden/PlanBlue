'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCartStore } from '@/lib/cart/cart-store';
import { requestCartValidation } from '@/lib/cart/request-cart-validation';
import type { CartValidationResult } from '@/lib/cart/validate-cart';
import { hasBlockingCartIssues } from '@/lib/cart/validate-cart';

type ValidationStatus = 'idle' | 'loading' | 'ready' | 'error';

type UseCartValidationResult = {
  status: ValidationStatus;
  validation: CartValidationResult | null;
  validatingDocumentIds: string[];
  isBlocked: boolean;
  refresh: () => void;
  validateNow: () => Promise<CartValidationResult | null>;
};

function getChangedDocumentIds(
  previousItems: ReturnType<typeof useCartStore.getState>['items'],
  currentItems: ReturnType<typeof useCartStore.getState>['items'],
): string[] {
  const changedIds = new Set<string>();

  for (const item of currentItems) {
    const previousItem = previousItems.find(
      (entry) => entry.documentId === item.documentId,
    );

    if (
      !previousItem ||
      previousItem.quantity !== item.quantity ||
      previousItem.price !== item.price ||
      previousItem.has_sale !== item.has_sale ||
      previousItem.discountPrice !== item.discountPrice ||
      previousItem.stockQuantity !== item.stockQuantity
    ) {
      changedIds.add(item.documentId);
    }
  }

  return [...changedIds];
}

export function useCartValidation(): UseCartValidationResult {
  const items = useCartStore((state) => state.items);
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [validation, setValidation] = useState<CartValidationResult | null>(
    null,
  );
  const [validatingDocumentIds, setValidatingDocumentIds] = useState<string[]>(
    [],
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const previousItemsRef = useRef(items);

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
      setValidatingDocumentIds([]);
      return null;
    }

    const pendingIds = getChangedDocumentIds(previousItemsRef.current, currentItems);
    setValidatingDocumentIds(
      pendingIds.length > 0
        ? pendingIds
        : currentItems.map((item) => item.documentId),
    );
    setStatus('loading');

    try {
      const result = await requestCartValidation(currentItems);
      setValidation(result);
      setStatus('ready');
      setValidatingDocumentIds([]);
      previousItemsRef.current = currentItems;
      return result;
    } catch {
      setValidation(null);
      setStatus('error');
      setValidatingDocumentIds([]);
      return null;
    }
  }, []);

  useEffect(() => {
    const currentItems = useCartStore.getState().items;

    if (currentItems.length === 0) {
      setValidation(null);
      setStatus('idle');
      setValidatingDocumentIds([]);
      previousItemsRef.current = [];
      return;
    }

    let cancelled = false;
    const pendingIds = getChangedDocumentIds(previousItemsRef.current, currentItems);

    setValidatingDocumentIds(
      pendingIds.length > 0
        ? pendingIds
        : currentItems.map((item) => item.documentId),
    );

    async function validateCart() {
      setStatus('loading');

      try {
        const result = await requestCartValidation(currentItems);

        if (cancelled) {
          return;
        }

        setValidation(result);
        setStatus('ready');
        setValidatingDocumentIds([]);
        previousItemsRef.current = currentItems;
      } catch {
        if (!cancelled) {
          setValidation(null);
          setStatus('error');
          setValidatingDocumentIds([]);
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
    validatingDocumentIds,
    isBlocked:
      status === 'loading' ||
      status === 'error' ||
      hasBlockingCartIssues(validation),
    refresh: () => setRefreshToken((value) => value + 1),
    validateNow,
  };
}
