'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Home, ShoppingCart, ToyBrick } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  showBadge?: boolean;
};

export function MobileBottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const navItems: NavItem[] = [
    {
      href: '/',
      label: t.header.nav.home,
      icon: Home,
      isActive: (path) => path === '/',
    },
    {
      href: '/shop',
      label: t.header.nav.shop,
      icon: ToyBrick,
      isActive: (path) => path === '/shop' || path.startsWith('/shop/'),
    },
    {
      href: '/cart',
      label: t.header.cart,
      icon: ShoppingCart,
      isActive: (path) => path === '/cart',
      showBadge: true,
    },
  ];

  return (
    <nav className="pb-mobile-bottom-nav" aria-label="Mobile navigation">
      <ul className="pb-mobile-bottom-nav__list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);

          return (
            <li key={item.href} className="pb-mobile-bottom-nav__item">
              <Link
                href={item.href}
                className={`pb-mobile-bottom-nav__link${active ? ' pb-mobile-bottom-nav__link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="pb-mobile-bottom-nav__icon-wrap">
                  <Icon className="pb-mobile-bottom-nav__icon" aria-hidden="true" />
                  {item.showBadge && cartItemCount > 0 && (
                    <span className="pb-mobile-bottom-nav__badge">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </span>
                <span className="pb-mobile-bottom-nav__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
