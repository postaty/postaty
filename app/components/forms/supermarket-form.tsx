"use client";

import { useState } from "react";
import type { SupermarketFormData, OutputFormat } from "@/lib/types";
import {
  SUPERMARKET_CTA_OPTIONS,
  SUPERMARKET_HEADLINE_OPTIONS,
} from "@/lib/constants";
import { ImageUpload } from "../image-upload";
import { MultiImageUpload } from "../multi-image-upload";
import { FormatSelector } from "../format-selector";

interface SupermarketFormProps {
  onSubmit: (data: SupermarketFormData) => void;
  isLoading: boolean;
}

export function SupermarketForm({ onSubmit, isLoading }: SupermarketFormProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [formats, setFormats] = useState<OutputFormat[]>(["instagram-square"]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (!logo || productImages.length === 0) return;

    onSubmit({
      category: "supermarket",
      supermarketName: fd.get("supermarketName") as string,
      logo,
      productName: fd.get("productName") as string,
      productImages,
      weight: (fd.get("weight") as string) || undefined,
      offerDuration: (fd.get("offerDuration") as string) || undefined,
      whatsapp: fd.get("whatsapp") as string,
      headline: fd.get("headline") as string,
      cta: fd.get("cta") as string,
      formats,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم السوبر ماركت</label>
            <input
              name="supermarketName"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: كارفور"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم المنتج</label>
            <input
              name="productName"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: شيبسي ليز"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوزن أو الحجم (اختياري)</label>
            <input
              name="weight"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: 200 جرام"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">مدة العرض (اختياري)</label>
            <input
              name="offerDuration"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: من 1 إلى 7 فبراير"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الواتساب</label>
            <input
              name="whatsapp"
              required
              type="tel"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-left"
              placeholder="+966xxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نص العرض</label>
            <select
              name="headline"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            >
              {SUPERMARKET_HEADLINE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نص الزر (CTA)</label>
            <select
              name="cta"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            >
              {SUPERMARKET_CTA_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <ImageUpload label="لوجو السوبر ماركت" value={logo} onChange={setLogo} />
          <MultiImageUpload
            label="صور المنتج (يمكن رفع أكثر من صورة)"
            values={productImages}
            onChange={setProductImages}
          />
          <FormatSelector selected={formats} onChange={setFormats} />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !logo || productImages.length === 0}
        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {isLoading ? "جاري الإنشاء..." : "إنشاء البوستر"}
      </button>
    </form>
  );
}
