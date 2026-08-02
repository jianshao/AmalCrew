import "server-only";

import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, type Locale, localeCookieName } from "@/lib/i18n/config";
import { translate, type TranslationValues } from "@/lib/i18n/translations";

export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(localeCookieName)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const accepted = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  const browserLocale = accepted
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim().split("-")[0])
    .find(isLocale);
  return browserLocale ?? defaultLocale;
}

export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: string, values?: TranslationValues) => translate(locale, key, values),
  };
}
