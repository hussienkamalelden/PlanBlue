'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { CheckoutOrderCelebration } from '@/components/shop/checkout-order-celebration';
import { useTranslations } from '@/lib/i18n/use-translations';

type CheckoutOrderSuccessProps = {
  orderId: string;
};

export function CheckoutOrderSuccess({ orderId }: CheckoutOrderSuccessProps) {
  const t = useTranslations();

  return (
    <>
      <CheckoutOrderCelebration />

      <div className="pb-checkout-success">
        <div className="pb-checkout-success__glow" aria-hidden />

        <div className="pb-checkout-success__icon-wrap">
          <span className="pb-checkout-success__icon-ring" aria-hidden />
          <span className="pb-checkout-success__icon-badge">
            <CheckCircle2 aria-hidden size={34} strokeWidth={2.2} />
          </span>
          <Sparkles
            aria-hidden
            className="pb-checkout-success__sparkle pb-checkout-success__sparkle--left"
            size={18}
          />
          <Sparkles
            aria-hidden
            className="pb-checkout-success__sparkle pb-checkout-success__sparkle--right"
            size={16}
          />
        </div>

        <p className="pb-checkout-success__eyebrow">{t.checkout.success.eyebrow}</p>

        <h1 className="pb-checkout-success__title">{t.checkout.success.title}</h1>
        <p className="pb-checkout-success__subtitle">{t.checkout.success.subtitle}</p>
        <p className="pb-checkout-success__message">{t.checkout.success.message}</p>

        <div className="pb-checkout-success__order">
          <span className="pb-checkout-success__order-label">
            {t.checkout.success.orderId}
          </span>
          <span className="pb-checkout-success__order-id">{orderId}</span>
        </div>

        <Link
          href="/"
          className="pb-cart-summary__btn pb-cart-summary__btn--primary pb-checkout-success__btn"
        >
          {t.checkout.success.backToHome}
        </Link>
      </div>
    </>
  );
}
