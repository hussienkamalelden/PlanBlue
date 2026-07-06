"use client";

import { LOCALES, type Locale } from "@/lib/i18n/config";
import { showPageLoader } from "@/lib/ui/page-loader";
import { useLocaleStore } from "@/stores/locale-store";

const LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
};

const SWITCH_LABELS: Record<Locale, string> = {
  en: "Switch to Arabic",
  ar: "Switch to English",
};

export function LocaleSwitcher() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const nextLocale = LOCALES.find((code) => code !== locale) ?? LOCALES[0];

  function handleToggle() {
    showPageLoader();
    setLocale(nextLocale);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-[38px] min-w-[48px] items-center justify-center rounded-full border border-dashed border-neutral-300 bg-white px-3.5 text-sm font-bold text-neutral-900 transition-colors hover:border-[#f76188] hover:text-[#f76188]"
      aria-label={SWITCH_LABELS[locale]}
    >
      {LABELS[nextLocale]}
    </button>
  );
}
