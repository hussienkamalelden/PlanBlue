import { LocaleProvider } from '@/components/locale/locale-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { getLocaleDirection } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/get-locale';

import type { Metadata } from 'next';
import './globals.css';

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
        className="min-h-screen bg-neutral-50 text-neutral-900 antialiased"
      >
        <LocaleProvider>
          <SiteHeader />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
