'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';

const HIDDEN_PATHS = ['/cart', '/checkout', '/affiliates', '/report'];

export function FloatingCartButton() {
  const t = useTranslations();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || itemCount === 0 || HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="pb-floating-cart"
      aria-label={`${t.header.cart} (${itemCount})`}
    >
      <span className="pb-floating-cart__count" aria-hidden="true">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
      <ShoppingCart className="pb-floating-cart__icon" strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}
