"use client";

import type { TemplateFormValues } from "@/lib/template-bindings";
import { SUPERMARKET_HEADLINE_OPTIONS, SUPERMARKET_CTA_OPTIONS } from "@/lib/constants";
import { ImageUpload } from "../image-upload";
import { useLocale } from "@/hooks/use-locale";

interface Props {
  values: TemplateFormValues;
  onChange: (partial: Partial<TemplateFormValues>) => void;
}

export function TemplateFormSupermarket({ values, onChange }: Props) {
  const { locale, t } = useLocale();
  const headlineOptions = locale === "ar"
    ? SUPERMARKET_HEADLINE_OPTIONS
    : ["Save on your daily shopping", "Offer of the week", "Discount on essentials"];
  const ctaOptions = locale === "ar"
    ? SUPERMARKET_CTA_OPTIONS
    : ["Order now", "Add to cart on WhatsApp", "Offer valid today"];
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t("نص العرض", "Headline")}</label>
        <div className="relative">
          <select
            value={values.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            className="w-full px-5 py-3.5 rounded-xl border border-card-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
          >
            <option value="">{t("اختر...", "Select...")}</option>
            {headlineOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t("اسم المنتج", "Product name")}</label>
        <input
          value={values.productName}
          onChange={(e) => onChange({ productName: e.target.value })}
          className="w-full px-5 py-3.5 rounded-xl border border-card-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted/50"
          placeholder={t("مثال: زيت زيتون", "Example: Olive oil")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t("السعر / الوزن", "Price / weight")}</label>
        <input
          value={values.price}
          onChange={(e) => onChange({ price: e.target.value })}
          className="w-full px-5 py-3.5 rounded-xl border border-card-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted/50"
          placeholder={t("مثال: 15 ر.س / كيلو", "Example: $15 / kg")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t("نص الزر (CTA)", "CTA text")}</label>
        <div className="relative">
          <select
            value={values.cta}
            onChange={(e) => onChange({ cta: e.target.value })}
            className="w-full px-5 py-3.5 rounded-xl border border-card-border bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
          >
            <option value="">{t("اختر...", "Select...")}</option>
            {ctaOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
      <ImageUpload label={t("لوجو المحل", "Store logo")} value={values.logo} onChange={(v) => onChange({ logo: v })} />
      <ImageUpload label={t("صورة المنتج", "Product image")} value={values.productImage} onChange={(v) => onChange({ productImage: v })} />
    </div>
  );
}
