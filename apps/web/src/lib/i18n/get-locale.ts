import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  isValidLocale,
} from "./config";

/** Read locale from cookie on the server (no locale segment in the URL). */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;

  if (value && isValidLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
}
