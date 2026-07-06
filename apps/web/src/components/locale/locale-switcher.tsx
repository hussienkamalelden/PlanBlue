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

type LocaleSwitcherProps = {
  variant?: "default" | "compact";
};

export function LocaleSwitcher({ variant = "default" }: LocaleSwitcherProps) {
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
      className={
        variant === "compact" ? "kiddex-locale-toggle" : "kiddex-locale-toggle kiddex-locale-toggle--nav"
      }
      aria-label={SWITCH_LABELS[locale]}
    >
      {LABELS[locale]}
    </button>
  );
}
