"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export function AIBanner() {
  const { t } = useLocale();
  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground">{t("هل تريد نتائج أكثر احترافية؟", "Want more professional results?")}</p>
          <p className="text-sm text-muted">{t("جرّب التوليد بالذكاء الاصطناعي للحصول على تصاميم فريدة", "Try AI generation to get unique designs")}</p>
        </div>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
      >
        {t("جرّب الان", "Try now")}
        <ArrowLeft size={14} />
      </Link>
    </div>
  );
}
