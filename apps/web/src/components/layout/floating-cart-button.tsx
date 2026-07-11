'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';

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

  if (!mounted || itemCount === 0 || pathname === '/cart') {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed bottom-[5.75rem] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#4389F7] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4389F7]"
      aria-label={`${t.header.cart} (${itemCount})`}
    >
      <ShoppingCart className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
      <span className="absolute -right-1 -top-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#e0a31e] px-1.5 text-xs font-bold leading-none text-white rtl:-left-1 rtl:right-auto">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </Link>
  );
}
