export const locales = ["en", "ar", "ur", "hi"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "amalcrew-locale";

export const localeOptions: ReadonlyArray<{ code: Locale; label: string; shortLabel: string }> = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "ar", label: "العربية", shortLabel: "AR" },
  { code: "ur", label: "اردو", shortLabel: "UR" },
  { code: "hi", label: "हिन्दी", shortLabel: "HI" },
];

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function isRtl(locale: Locale) {
  return locale === "ar" || locale === "ur";
}

export function localeToIntl(locale: Locale) {
  return { en: "en-GB", ar: "ar-AE", ur: "ur-PK", hi: "hi-IN" }[locale];
}
