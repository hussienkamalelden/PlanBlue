"use client";

import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useLocaleStore } from "@/stores/locale-store";

const LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
};

const FULL_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

type LocaleSwitcherProps = {
  variant?: "default" | "light";
};

export function LocaleSwitcher({ variant = "default" }: LocaleSwitcherProps) {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const isLight = variant === "light";
  const labels = isLight ? LABELS : FULL_LABELS;

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;

    setLocale(nextLocale);
  }

  return (
    <div
      className={`inline-flex rounded-lg border p-1 text-sm ${
        isLight
          ? "border-white/35 bg-white/10"
          : "border-neutral-200 bg-white"
      }`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => handleChange(code)}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            locale === code
              ? isLight
                ? "bg-white text-[#f76188]"
                : "bg-neutral-900 text-white"
              : isLight
                ? "text-white hover:bg-white/15"
                : "text-neutral-600 hover:bg-neutral-100"
          }`}
          aria-pressed={locale === code}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}
