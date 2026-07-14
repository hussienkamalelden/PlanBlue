'use client';

import { useMemo } from 'react';

import { getLocaleDirection } from '@/lib/i18n/config';
import { useLocaleStore } from '@/stores/locale-store';

export function useSliderDirection(): 'ltr' | 'rtl' {
  const locale = useLocaleStore((state) => state.locale);

  return useMemo(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
    }

    return getLocaleDirection(locale);
  }, [locale]);
}
