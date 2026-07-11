'use client';

import { useEffect, useId } from 'react';
import { X } from 'lucide-react';

import { formatPrice } from '@/lib/api/strapi';
import type { CartLineItem } from '@/lib/cart/cart-store';
import type { Dictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/config';

type CheckoutConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
  locale: Locale;
  t: Dictionary;
  customer: {
    name: string;
    email: string;
    phone: string;
    governorate: string;
    address: string;
    extraNotes: string;
  };
  items: CartLineItem[];
  promoCode: string;
  promoDiscount: number;
  discountAmount: number;
  shippingCost: number;
  shippingName: string;
  giftWrapping: boolean;
  giftWrappingCost: number;
  subtotal: number;
  total: number;
};

function formatDisplayValue(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function CheckoutConfirmModal({
  open,
  onClose,
  onConfirm,
  isConfirming,
  locale,
  t,
  customer,
  items,
  promoCode,
  promoDiscount,
  discountAmount,
  shippingCost,
  shippingName,
  giftWrapping,
  giftWrappingCost,
  subtotal,
  total,
}: CheckoutConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isConfirming) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isConfirming, onClose]);

  if (!open) {
    return null;
  }

  const noneLabel = t.checkout.confirmModal.none;

  return (
    <div className="pb-checkout-modal" role="presentation">
      <button
        type="button"
        className="pb-checkout-modal__backdrop"
        aria-label={t.checkout.confirmModal.close}
        onClick={() => {
          if (!isConfirming) {
            onClose();
          }
        }}
      />

      <div
        className="pb-checkout-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="pb-checkout-modal__header">
          <div>
            <h2 id={titleId} className="pb-checkout-modal__title">
              {t.checkout.confirmModal.title}
            </h2>
            <p id={descriptionId} className="pb-checkout-modal__subtitle">
              {t.checkout.confirmModal.subtitle}
            </p>
          </div>
          <button
            type="button"
            className="pb-checkout-modal__close"
            onClick={onClose}
            disabled={isConfirming}
            aria-label={t.checkout.confirmModal.close}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="pb-checkout-modal__body">
          <section className="pb-checkout-modal__card pb-checkout-modal__card--details">
            <div className="pb-checkout-modal__section">
              <h3 className="pb-checkout-modal__card-title">
                {t.checkout.confirmModal.customerDetails}
              </h3>
              <dl className="pb-checkout-modal__rows">
                <div className="pb-checkout-modal__row">
                  <dt>{t.checkout.form.name}</dt>
                  <dd>{customer.name}</dd>
                </div>
                <div className="pb-checkout-modal__row">
                  <dt>{t.checkout.form.email}</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div className="pb-checkout-modal__row">
                  <dt>{t.checkout.form.phone}</dt>
                  <dd>{customer.phone}</dd>
                </div>
              </dl>
            </div>

            <div className="pb-checkout-modal__section">
              <h3 className="pb-checkout-modal__card-title">
                {t.checkout.confirmModal.deliveryDetails}
              </h3>
              <dl className="pb-checkout-modal__rows">
                <div className="pb-checkout-modal__row">
                  <dt>{t.checkout.form.governorate}</dt>
                  <dd>{customer.governorate}</dd>
                </div>
                <div className="pb-checkout-modal__row pb-checkout-modal__row--stack">
                  <dt>{t.checkout.form.address}</dt>
                  <dd>{customer.address}</dd>
                </div>
                <div className="pb-checkout-modal__row pb-checkout-modal__row--stack">
                  <dt>{t.checkout.form.extraNotes}</dt>
                  <dd>
                    {formatDisplayValue(customer.extraNotes, noneLabel)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="pb-checkout-modal__section pb-checkout-modal__section--last">
              <h3 className="pb-checkout-modal__card-title">
                {t.checkout.confirmModal.orderItems}
              </h3>
              <ul className="pb-checkout-modal__items">
                {items.map((item) => {
                  const unitPrice =
                    item.has_sale && item.discountPrice !== null
                      ? item.discountPrice
                      : item.price;

                  return (
                    <li key={item.documentId} className="pb-checkout-modal__item">
                      <span className="pb-checkout-modal__item-name">
                        {item.title}
                      </span>
                      <span className="pb-checkout-modal__item-meta">
                        {item.quantity} × {formatPrice(unitPrice, locale)}
                      </span>
                      <span className="pb-checkout-modal__item-total">
                        {formatPrice(unitPrice * item.quantity, locale)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className="pb-checkout-modal__card pb-checkout-modal__card--totals">
            <dl className="pb-checkout-modal__rows">
              <div className="pb-checkout-modal__row">
                <dt>{t.checkout.form.promoCode}</dt>
                <dd>{formatDisplayValue(promoCode, noneLabel)}</dd>
              </div>
              <div className="pb-checkout-modal__row">
                <dt>
                  {t.checkout.subtotal} ({items.length} {t.checkout.items})
                </dt>
                <dd>{formatPrice(subtotal, locale)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="pb-checkout-modal__row pb-checkout-modal__row--discount">
                  <dt>
                    {t.checkout.discount} ({promoDiscount}%)
                  </dt>
                  <dd>-{formatPrice(discountAmount, locale)}</dd>
                </div>
              )}
              <div className="pb-checkout-modal__row">
                <dt>
                  {t.checkout.shipping} ({shippingName})
                </dt>
                <dd>{formatPrice(shippingCost, locale)}</dd>
              </div>
              {giftWrapping && (
                <div className="pb-checkout-modal__row">
                  <dt>{t.checkout.giftWrapping}</dt>
                  <dd>{formatPrice(giftWrappingCost, locale)}</dd>
                </div>
              )}
            </dl>
            <div className="pb-checkout-modal__grand-total">
              <span>{t.checkout.total}</span>
              <span>{formatPrice(total, locale)}</span>
            </div>
          </section>
        </div>

        <div className="pb-checkout-modal__footer">
          <button
            type="button"
            className="pb-cart-summary__btn pb-cart-summary__btn--secondary"
            onClick={onClose}
            disabled={isConfirming}
          >
            {t.checkout.confirmModal.close}
          </button>
          <button
            type="button"
            className={`pb-cart-summary__btn pb-cart-summary__btn--primary${
              isConfirming ? ' pb-cart-summary__btn--disabled' : ''
            }`}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <span className="pb-checkout-btn-spinner" aria-hidden="true" />
            ) : (
              t.checkout.placeOrder
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
