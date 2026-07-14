import type { Locale } from "./config";

import ar from "./dictionaries/ar.json";
import en from "./dictionaries/en.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

type InterpolationParams = Record<string, string | number>;

/** Replace `{key}` placeholders in a translation string. */
export function interpolate(
  template: string,
  params?: InterpolationParams,
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`),
  );
}
