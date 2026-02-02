import type { Category, FormatConfig, OutputFormat } from "./types";

export const FORMAT_CONFIGS: Record<OutputFormat, FormatConfig> = {
  "instagram-square": {
    label: "انستقرام مربع",
    aspectRatio: "1:1",
    size: "1024x1024",
    width: 1024,
    height: 1024,
  },
  "instagram-story": {
    label: "انستقرام ستوري",
    aspectRatio: "9:16",
    size: "1024x1792",
    width: 1024,
    height: 1792,
  },
  "facebook-post": {
    label: "فيسبوك",
    aspectRatio: "4:5",
    size: "1024x1792",
    width: 1024,
    height: 1792,
  },
};

export const RESTAURANT_CTA_OPTIONS = [
  "اطلب الان واستفيد من العرض",
  "اطلب قبل انتهاء العرض",
  "توصيل سريع",
] as const;

export const SUPERMARKET_HEADLINE_OPTIONS = [
  "وفر في مشترياتك اليومية",
  "عرض الاسبوع",
  "خصم على منتجاتك الأساسية",
] as const;

export const SUPERMARKET_CTA_OPTIONS = [
  "اطلب الان",
  "أضف للسلة عبر الواتساب",
  "العرض ساري اليوم",
] as const;

export const ONLINE_HEADLINE_OPTIONS = [
  "خصم حصري",
  "منتج مطلوب الان",
  "توصيل لجميع المناطق",
] as const;

export const ONLINE_CTA_OPTIONS = [
  "اطلب الان",
  "اشتري بسهولة",
  "تواصل للشراء",
] as const;

export const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: "مطاعم",
  supermarket: "سوبر ماركت",
  online: "منتجات أونلاين",
};
