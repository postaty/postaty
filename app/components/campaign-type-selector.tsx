"use client";

import type { CampaignType } from "@/lib/types";
import { Sparkles, MoonStar, Star } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

const CAMPAIGN_ICONS: Record<CampaignType, typeof Sparkles> = {
  standard: Sparkles,
  ramadan: MoonStar,
  eid: Star,
};

const CAMPAIGN_COPY: Record<CampaignType, { ar: { label: string; description: string }; en: { label: string; description: string } }> = {
  standard: {
    ar: { label: "عادي", description: "ستايل حديث عام" },
    en: { label: "Standard", description: "General modern style" },
  },
  ramadan: {
    ar: { label: "رمضان", description: "لمسات روحانية هادئة" },
    en: { label: "Ramadan", description: "Calm spiritual style" },
  },
  eid: {
    ar: { label: "العيد", description: "ستايل احتفالي مبهج" },
    en: { label: "Eid", description: "Festive celebration style" },
  },
};

interface CampaignTypeSelectorProps {
  value: CampaignType;
  onChange: (value: CampaignType) => void;
}

export function CampaignTypeSelector({ value, onChange }: CampaignTypeSelectorProps) {
  const { locale, t } = useLocale();
  const options: CampaignType[] = ["standard", "ramadan", "eid"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground/80">{t("نوع الحملة", "Campaign type")}</label>
        <span className="text-[11px] text-muted">{t("اختياري - يغير الطابع البصري", "Optional - changes visual style")}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = CAMPAIGN_ICONS[opt];
          const isActive = value === opt;
          const copy = CAMPAIGN_COPY[opt][locale];
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`group text-center rounded-xl border px-2 py-1 transition-all shadow-sm hover:shadow-md ${
                isActive
                  ? "border-primary/60 bg-primary/10"
                  : "border-card-border bg-surface-1 hover:border-primary/30"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{copy.label}</div>
                  <div className="text-[11px] text-muted mt-1">{copy.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
