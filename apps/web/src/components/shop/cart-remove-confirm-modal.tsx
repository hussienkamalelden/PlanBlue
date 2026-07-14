'use client';

import { useEffect, useId } from 'react';
import { X } from 'lucide-react';

import { interpolate } from '@/lib/i18n/dictionary';
import { useTranslations } from '@/lib/i18n/use-translations';

type CartRemoveConfirmModalProps = {
  open: boolean;
  productTitle: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function CartRemoveConfirmModal({
  open,
  productTitle,
  onClose,
  onConfirm,
}: CartRemoveConfirmModalProps) {
  const t = useTranslations();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="pb-cart-remove-modal" role="presentation">
      <button
        type="button"
        className="pb-checkout-modal__backdrop"
        aria-label={t.cart.removeCancel}
        onClick={onClose}
      />

      <div
        className="pb-cart-remove-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="pb-cart-remove-modal__header">
          <h2 id={titleId} className="pb-cart-remove-modal__title">
            {t.cart.removeConfirmTitle}
          </h2>
          <button
            type="button"
            className="pb-checkout-modal__close"
            onClick={onClose}
            aria-label={t.cart.removeCancel}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p id={descriptionId} className="pb-cart-remove-modal__message">
          {interpolate(t.cart.removeConfirmMessage, { title: productTitle })}
        </p>

        <div className="pb-cart-remove-modal__footer">
          <button
            type="button"
            className="pb-cart-summary__btn pb-cart-summary__btn--secondary"
            onClick={onClose}
          >
            {t.cart.removeCancel}
          </button>
          <button
            type="button"
            className="pb-cart-summary__btn pb-cart-summary__btn--danger"
            onClick={onConfirm}
          >
            {t.cart.removeConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
