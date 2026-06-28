"use client";

import { useEffect } from "react";

import { getLocaleDirection, type Locale } from "@/lib/i18n/config";
import { useLocaleStore } from "@/stores/locale-store";

type LocaleProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

export function LocaleProvider({
  initialLocale,
  children,
}: LocaleProviderProps) {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
  }, [locale]);

  return children;
}
