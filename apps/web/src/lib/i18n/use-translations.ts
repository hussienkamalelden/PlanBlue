"use client";

import { useLocaleStore } from "@/stores/locale-store";

import { getDictionary, interpolate, type Dictionary } from "./dictionary";

export function useTranslations(): Dictionary {
  const locale = useLocaleStore((state) => state.locale);
  return getDictionary(locale);
}

export function useInterpolate() {
  return interpolate;
}
