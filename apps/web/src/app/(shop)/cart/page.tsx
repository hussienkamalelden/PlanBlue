import type { Metadata } from 'next';

import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';

import Cart from './Cart';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.cart.title,
  };
}

export default function CartPage() {
  return <Cart />;
}
