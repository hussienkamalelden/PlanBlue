'use client';

import { formatPrice } from '@/lib/api/strapi';
import type { CartLineItem } from '@/lib/cart/cart-store';
import {
  getCartLineUnitPrice,
  getItemValidation,
  type CartItemIssue,
  type CartValidationResult,
} from '@/lib/cart/validate-cart';
import { interpolate } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/config';
import { useTranslations } from '@/lib/i18n/use-translations';

type CartValidationBannerProps = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  validation: CartValidationResult | null;
};

export function CartValidationBanner({
  status,
  validation,
}: CartValidationBannerProps) {
  const t = useTranslations();

  if (status === 'loading') {
    return (
      <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        {t.cart.validation.checking}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {t.cart.validation.failed}
      </div>
    );
  }

  if (!validation || validation.valid) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
      <p className="text-sm font-semibold text-amber-900">
        {t.cart.validation.blockedTitle}
      </p>
      <p className="mt-1 text-sm text-amber-800">
        {t.cart.validation.blockedMessage}
      </p>
    </div>
  );
}

type CartItemValidationMessagesProps = {
  documentId: string;
  item: CartLineItem;
  validation: CartValidationResult | null;
  locale: Locale;
};

export function CartItemValidationMessages({
  documentId,
  item,
  validation,
  locale,
}: CartItemValidationMessagesProps) {
  const t = useTranslations();
  const itemValidation = getItemValidation(validation, documentId);

  if (!itemValidation || itemValidation.valid) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {itemValidation.issues.map((issue, index) => (
        <p
          key={`${issue.type}-${index}`}
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
        >
          {renderIssueMessage(issue, item, locale, t)}
        </p>
      ))}
    </div>
  );
}

function renderIssueMessage(
  issue: CartItemIssue,
  item: CartLineItem,
  locale: Locale,
  t: ReturnType<typeof useTranslations>,
): string {
  switch (issue.type) {
    case 'not_found':
      return t.cart.validation.notFound;
    case 'unavailable':
      return t.cart.validation.unavailable;
    case 'insufficient_stock':
      return interpolate(t.cart.validation.insufficientStock, {
        stock: issue.available,
        quantity: item.quantity,
      });
    case 'price_changed': {
      const oldPrice = formatPrice(getCartLineUnitPrice(item), locale);
      const newPrice = formatPrice(
        issue.currentHasSale && issue.currentDiscountPrice !== null
          ? issue.currentDiscountPrice
          : issue.currentPrice,
        locale,
      );

      return interpolate(t.cart.validation.priceChanged, {
        oldPrice,
        newPrice,
      });
    }
  }
}

export function CheckoutBlockedNotice({
  status,
  validation,
}: CartValidationBannerProps) {
  const t = useTranslations();

  if (status === 'loading') {
    return (
      <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        {t.checkout.cartValidation.checking}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {t.checkout.cartValidation.failed}
      </div>
    );
  }

  if (!validation || validation.valid) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
      <p className="text-sm font-semibold text-amber-900">
        {t.checkout.cartValidation.blockedTitle}
      </p>
      <p className="mt-1 text-sm text-amber-800">
        {t.checkout.cartValidation.blockedMessage}
      </p>
    </div>
  );
}
