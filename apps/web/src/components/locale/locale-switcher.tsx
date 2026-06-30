"use client";

import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useLocaleStore } from "@/stores/locale-store";

const LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export function LocaleSwitcher() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;

    setLocale(nextLocale);
  }

  return (
    <div
      className="inline-flex rounded-lg border border-neutral-200 bg-white p-1 text-sm"
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
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
          aria-pressed={locale === code}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
