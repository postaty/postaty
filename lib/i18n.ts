export const LOCALE_COOKIE = "pst_locale";

export const SUPPORTED_LOCALES = ["ar", "en"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(value?: string | null): AppLocale {
  return value === "en" ? "en" : "ar";
}

export function isRtlLocale(locale: AppLocale): boolean {
  return locale === "ar";
}
