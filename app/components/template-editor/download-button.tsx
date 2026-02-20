"use client";

import { useState, type RefObject } from "react";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";
import { FORMAT_CONFIGS } from "@/lib/constants";
import type { OutputFormat } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface DownloadButtonProps {
  captureRef: RefObject<HTMLDivElement | null>;
  format: OutputFormat;
}

export function DownloadButton({ captureRef, format }: DownloadButtonProps) {
  const { t } = useLocale();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    const element = captureRef.current;
    if (!element) return;
    
    // Clear previous errors
    setError(null);

    // Validate element dimensions
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      setError(t("تعذر تحديد أبعاد التصميم. يرجى المحاولة مرة أخرى.", "Unable to detect design dimensions. Please try again."));
      return;
    }

    setDownloading(true);
    try {
      await document.fonts.ready;

      const config = FORMAT_CONFIGS[format];
      // Scale up from the preview size to full resolution
      const captureScale = config.width / element.offsetWidth;

      const canvas = await html2canvas(element, {
        scale: captureScale,
        useCORS: true,
        backgroundColor: null,
        logging: process.env.NODE_ENV === "development",
        allowTaint: false,
      });

      const link = document.createElement("a");
      link.download = `poster-${format}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      setError(t("حدث خطأ أثناء تحميل البوستر. يرجى المحاولة مرة أخرى.", "An error occurred while downloading the poster. Please try again."));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-4 bg-gradient-to-r from-primary to-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-lg flex items-center justify-center gap-3"
      >
        {downloading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {t("جاري التحميل...", "Downloading...")}
          </>
        ) : (
          <>
            <Download size={20} />
            {t("تحميل البوستر", "Download poster")}
          </>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
