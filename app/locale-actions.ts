"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookieName } from "@/lib/i18n/config";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(localeCookieName, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
