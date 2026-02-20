"use client";

import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();
  void error;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-surface-1 border border-card-border rounded-2xl p-8 max-w-md w-full text-center">
        <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("حدث خطأ غير متوقع", "Unexpected error")}</h1>
        <p className="text-muted mb-6">
          {t("نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.", "Sorry, something went wrong. Please try again.")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl font-bold"
          >
            <RotateCcw size={16} />
            {t("إعادة المحاولة", "Try again")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-surface-2 border border-card-border text-foreground rounded-xl font-bold"
          >
            <Home size={16} />
            {t("الرئيسية", "Home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
