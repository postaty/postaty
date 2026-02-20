"use client";

import { useMemo } from "react";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";
import { useLocaleContext } from "@/app/components/locale-provider";

export function useLocale() {
  const contextLocale = useLocaleContext();
  const locale = useMemo<AppLocale>(
    () =>
      contextLocale
        ? normalizeLocale(contextLocale)
        : normalizeLocale(
            typeof document === "undefined" ? "ar" : document.documentElement.lang
          ),
    [contextLocale]
  );

  const isArabic = locale === "ar";
  const t = (ar: string, en: string) => (isArabic ? ar : en);

  return { locale, isArabic, t };
}
