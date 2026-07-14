"use client";

import { useEffect } from "react";

import {
  getLocaleDirection,
  setClientLocaleCookie,
} from "@/lib/i18n/config";
import { useLocaleStore } from "@/stores/locale-store";

type LocaleProviderProps = {
  children: React.ReactNode;
};

export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
    setClientLocaleCookie(locale);
  }, [locale]);

  return children;
}
