'use client';

import Link from 'next/link';

import { getSocialLinks, type SocialLink } from '@/lib/social';
import { useTranslations } from '@/lib/i18n/use-translations';
import { HOME_ASSETS } from '@/lib/assets/home';
import Image from 'next/image';
function SocialIcon({ id }: { id: SocialLink['id'] }) {
  const className = 'h-5 w-5';

  switch (id) {
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      );
  }
}

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const socialLinks = getSocialLinks({
    facebook: t.footer.social.facebook,
    instagram: t.footer.social.instagram,
    twitter: t.footer.social.twitter,
    tiktok: t.footer.social.tiktok,
  });

  return (
    <footer className="mt-10 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-5">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            {/* <Link href="/" className="text-lg font-semibold text-neutral-900">
              {t.common.brand}
            </Link> */}
            <Image
              src={HOME_ASSETS.logoWord}
              alt={t.common.brand}
              height={150}
              width={150}
              className="w-auto h-[40px]"
            />
            <p className="mt-3 w-3/4 text-sm leading-relaxed text-neutral-600">
              {t.home.hero.title}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
              {t.footer.linksTitle}
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-neutral-600 transition-colors hover:text-brand-primary"
                >
                  {t.header.products}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-neutral-600 transition-colors hover:text-brand-primary"
                >
                  {t.header.cart}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-neutral-600 transition-colors hover:text-brand-primary"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
              {t.footer.socialTitle}
            </h2>
            {socialLinks.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
                  >
                    <SocialIcon id={link.id} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                {t.footer.socialEmpty}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-500">
          {t.footer.copyright.replace('{year}', String(year))}
        </div>
      </div>
    </footer>
  );
}
