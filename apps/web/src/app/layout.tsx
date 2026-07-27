import { Cairo, Nunito } from 'next/font/google';

import { Suspense } from 'react';

import { LocaleProvider } from '@/components/locale/locale-provider';
import { CrispChat } from '@/components/layout/crisp-chat';
import { FloatingCartButton } from '@/components/layout/floating-cart-button';
import { FloatingWhatsAppButton } from '@/components/layout/floating-whatsapp-button';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { PlanBlueHeader } from '@/components/layout/planblue-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { InitialPageLoader } from '@/components/ui/initial-page-loader';
import { NavigationLoader } from '@/components/ui/navigation-loader';
import { RouteReadyNotifier } from '@/components/ui/route-ready-notifier';
import { getLocaleDirection } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/get-locale';
import { buildRootMetadata, buildSiteJsonLd } from '@/lib/seo/metadata';

import type { Metadata } from 'next';
import './globals.css';
import '@/styles/home-layout.css';
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const arabicFont = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildRootMetadata(locale);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const siteJsonLd = buildSiteJsonLd(locale);

  return (
    <html lang={locale} dir={getLocaleDirection(locale)} className="planblue-loading">
      <body
        suppressHydrationWarning
        className={`${nunito.variable} ${arabicFont.variable} planblue-site min-h-screen bg-white text-neutral-900 antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <InitialPageLoader />
        <CrispChat />
        <LocaleProvider>
          <NavigationLoader />
          <div className="planblue-site-shell flex min-h-screen flex-col">
            <PlanBlueHeader />
            <div className="flex-1">
              <Suspense fallback={null}>
                <RouteReadyNotifier />
              </Suspense>
              {children}
            </div>
            <SiteFooter />
            <FloatingCartButton />
            <FloatingWhatsAppButton />
            <MobileBottomNav />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
