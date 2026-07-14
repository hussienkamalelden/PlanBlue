"use server";

import { cookies } from "next/headers";

import {
  LOCALE_COOKIE,
  type Locale,
  isValidLocale,
} from "@/lib/i18n/config";

export async function setLocaleCookie(locale: Locale): Promise<void> {
  if (!isValidLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
