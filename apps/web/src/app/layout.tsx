import { Nunito } from 'next/font/google';

import { LocaleProvider } from '@/components/locale/locale-provider';
import { KiddexHeader } from '@/components/kiddex/kiddex-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { NavigationLoader } from '@/components/ui/navigation-loader';
import { getLocaleDirection } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/get-locale';

import type { Metadata } from 'next';
import './globals.css';
import '@/styles/kiddex-home.css';
import '@/styles/page-loader.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PlanBlue',
    template: '%s | PlanBlue',
  },
  description: 'Online toy store powered by PlanBlue',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body
        suppressHydrationWarning
        className={`${nunito.variable} kiddex-home min-h-screen bg-white text-neutral-900 antialiased`}
      >
        <LocaleProvider>
          <NavigationLoader />
          <div className="flex min-h-screen flex-col">
            <KiddexHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
