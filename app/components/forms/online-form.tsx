"use client";

import { useState } from "react";
import type { OnlineFormData, OutputFormat } from "@/lib/types";
import { ONLINE_CTA_OPTIONS, ONLINE_HEADLINE_OPTIONS } from "@/lib/constants";
import { ImageUpload } from "../image-upload";
import { FormatSelector } from "../format-selector";

interface OnlineFormProps {
  onSubmit: (data: OnlineFormData) => void;
  isLoading: boolean;
}

export function OnlineForm({ onSubmit, isLoading }: OnlineFormProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [formats, setFormats] = useState<OutputFormat[]>(["instagram-square"]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (!logo || !productImage) return;

    onSubmit({
      category: "online",
      shopName: fd.get("shopName") as string,
      logo,
      productImage,
      productName: fd.get("productName") as string,
      price: fd.get("price") as string,
      discount: (fd.get("discount") as string) || undefined,
      shipping: fd.get("shipping") as "free" | "paid",
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
            <label className="block text-sm font-medium mb-1">اسم المحل</label>
            <input
              name="shopName"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: متجر نون"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم المنتج</label>
            <input
              name="productName"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: سماعات أيربودز"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السعر</label>
            <input
              name="price"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="199 ر.س"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">خصم (اختياري)</label>
            <input
              name="discount"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="مثال: 30%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الشحن</label>
            <select
              name="shipping"
              required
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            >
              <option value="free">مجاني</option>
              <option value="paid">مدفوع</option>
            </select>
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
              {ONLINE_HEADLINE_OPTIONS.map((opt) => (
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
              {ONLINE_CTA_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <ImageUpload label="لوجو المحل" value={logo} onChange={setLogo} />
          <ImageUpload label="صورة المنتج" value={productImage} onChange={setProductImage} />
          <FormatSelector selected={formats} onChange={setFormats} />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !logo || !productImage}
        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {isLoading ? "جاري الإنشاء..." : "إنشاء البوستر"}
      </button>
    </form>
  );
}
