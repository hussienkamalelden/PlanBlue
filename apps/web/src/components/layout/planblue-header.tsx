'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Home, ToyBrick } from 'lucide-react';

import { HeaderPromoBar } from '@/components/layout/header-promo-bar';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { HOME_ASSETS } from '@/lib/assets/home';
import { formatPriceWhole } from '@/lib/api/strapi';
import { useCartStore } from '@/lib/cart/cart-store';
import { useTranslations } from '@/lib/i18n/use-translations';
import { showPageLoader } from '@/lib/ui/page-loader';
import { useLocaleStore } from '@/stores/locale-store';

function getCartLineUnitPrice(item: {
  price: number;
  has_sale: boolean;
  discountPrice: number | null;
}) {
  return item.has_sale && item.discountPrice != null
    ? item.discountPrice
    : item.price;
}

export function PlanBlueHeader() {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const router = useRouter();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const unitPrice = getCartLineUnitPrice(item);
        return sum + unitPrice * item.quantity;
      }, 0),
    [cartItems],
  );

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const cartTotalPrice = useMemo(
    () => `(${formatPriceWhole(cartTotal, locale)})`,
    [cartTotal, locale],
  );

  const navItems = [
    { href: '/', label: t.header.nav.home, icon: Home },
    { href: '/shop', label: t.header.nav.shop, icon: ToyBrick },
  ];

  function isNavActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function handleSearch(query: string) {
    showPageLoader();

    if (!query) {
      router.push('/shop');
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(query)}`);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSearch(searchQuery.trim());
    setMobileOpen(false);
  }

  return (
    <header className="pb-main-header">
      <HeaderPromoBar />

      <div className="pb-header-lower">
        <div
          className="pb-header-shape"
          dir="ltr"
          style={{ backgroundImage: `url(${HOME_ASSETS.shapes.headerWave})` }}
        />
        <div className="pb-large-container">
          <div className="pb-outer-box">
            <div className="pb-brand-block">
              <figure className="pb-logo-box">
                <Link href="/">
                  <Image
                    src={HOME_ASSETS.logo}
                    alt={t.common.brand}
                    width={140}
                    height={48}
                    priority
                  />
                </Link>
              </figure>

              <div className="pb-support-box !hidden lg:!flex">
                <div className="pb-support-icon">
                  <i className="icon-2" aria-hidden="true" />
                </div>
                <div>
                  <span className="pb-hotline">{t.header.hotline}</span>
                  <h3>
                    <a href={`tel:${t.header.phone.replace(/\s/g, '')}`}>
                      012-88-739-168
                    </a>
                  </h3>
                </div>
              </div>
            </div>

            <div className="pb-main-menu">
              <nav aria-label="Main">
                <ul className="pb-navigation">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.href}
                        className={
                          isNavActive(item.href) ? 'pb-current' : undefined
                        }
                      >
                        <Link href={item.href} className="pb-nav-link">
                          <Icon className="pb-nav-link__icon" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="me-6 pb-search-box pb-search-desktop hidden lg:block">
              <form className="pb-search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.header.searchPlaceholder}
                  aria-label={t.header.searchPlaceholder}
                />
                <button type="submit" aria-label={t.header.searchPlaceholder}>
                  <i className="icon-4" aria-hidden="true" />
                </button>
              </form>
            </div>

            <div className=" pb-menu-right">
              <div className="hidden lg:block">
                <LocaleSwitcher />
              </div>

              <Link
                href="/cart"
                className="hidden lg:inline-flex items-center gap-2.5 py-1.5 text-neutral-900 transition-colors hover:text-[#4389F7]"
                aria-label={t.header.cart}
              >
                <span className="relative inline-flex shrink-0 items-center justify-center">
                  <ShoppingCart
                    className="size-[24px] text-[#4389F7]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e0a31e] px-1 text-[11px] font-bold leading-none text-white rtl:-left-2 rtl:right-auto">
                      {cartItemCount}
                    </span>
                  )}
                </span>
                <span className="ms-1.5 min-w-0 text-start leading-tight">
                  <span className="block truncate text-sm font-bold sm:max-w-none">
                    {cartTotalPrice}
                  </span>
                </span>
              </Link>

              <button
                type="button"
                className="flex flex-col gap-1.5 p-2 lg:hidden"
                aria-label={t.header.openMenu}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <span className="block h-0.5 w-6 rounded bg-[#4389F7]" />
                <span className="block h-0.5 w-6 rounded bg-[#4389F7]" />
                <span className="block h-0.5 w-6 rounded bg-[#4389F7]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label={t.header.closeMenu}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`fixed top-0 flex h-full w-[min(320px,88vw)] flex-col overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-300 ltr:right-0 rtl:left-0 ${
            mobileOpen
              ? 'translate-x-0'
              : 'ltr:translate-x-full rtl:-translate-x-full'
          }`}
        >
          {/* Close button */}
          <div className="mb-4 flex items-center justify-end">
            <button
              type="button"
              className="text-3xl leading-none text-neutral-900"
              aria-label={t.header.closeMenu}
              onClick={() => setMobileOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Search — full width */}
          <div className="mb-5 w-full">
            <form
              className="relative flex items-center"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t.header.searchPlaceholder}
                aria-label={t.header.searchPlaceholder}
                className="w-full h-[44px] rounded-full border border-dashed border-neutral-300 bg-white px-4 pe-12 text-sm outline-none focus:border-[#4389F7]"
              />
              <button
                type="submit"
                aria-label={t.header.searchPlaceholder}
                className="absolute end-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#4389F7] text-white"
              >
                <i className="icon-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile">
            <ul className="m-0 list-none p-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href} className="border-b border-neutral-100">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 py-3 text-base font-semibold transition-colors ${
                        isNavActive(item.href)
                          ? 'text-[#4389F7]'
                          : 'text-neutral-900'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              <li className="border-b border-neutral-100">
                <Link
                  href="/cart"
                  className={`flex items-center gap-2.5 py-3 text-base font-semibold transition-colors ${
                    isNavActive('/cart') ? 'text-[#4389F7]' : 'text-neutral-900'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingCart
                    className="size-[18px] shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>
                    {t.header.cartTotal} {cartTotalPrice}
                  </span>
                </Link>
              </li>
            </ul>

            <div className="pb-mobile-sidebar-meta">
              <a
                href={`tel:${t.header.phone.replace(/\s/g, '')}`}
                className="pb-mobile-sidebar-meta__hotline"
              >
                <span className="pb-mobile-sidebar-meta__icon">
                  <i className="icon-2" aria-hidden="true" />
                </span>
                <span className="pb-mobile-sidebar-meta__hotline-text">
                  <span className="pb-mobile-sidebar-meta__hotline-label">
                    {t.header.hotline}
                  </span>
                  <span className="pb-mobile-sidebar-meta__hotline-number">
                    {t.header.phone}
                  </span>
                </span>
              </a>

              <span
                className="pb-mobile-sidebar-meta__divider"
                aria-hidden="true"
              />

              <div className="pb-mobile-sidebar-meta__locale">
                <LocaleSwitcher />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
