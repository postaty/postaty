"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2, Scissors, Trash2 } from "lucide-react";
import { compressImage } from "@/lib/image-compression";
import { useLocale } from "@/hooks/use-locale";

interface OverlayUploadControlProps {
  value: string | null;
  onChange: (base64: string | null) => void;
  onRemoveBackground: (base64: string) => Promise<void>;
  removeBgLoading: boolean;
}

export function OverlayUploadControl({
  value,
  onChange,
  onRemoveBackground,
  removeBgLoading,
}: OverlayUploadControlProps) {
  const { t } = useLocale();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setUploadError(null);
      try {
        const compressed = await compressImage(file, 2, 1600);
        onChange(compressed);
      } catch {
        setUploadError(t("فشل رفع الصورة، حاول مرة أخرى.", "Image upload failed, please try again."));
      }
    },
    [onChange, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="space-y-2">
      {!value ? (
        <div
          {...getRootProps()}
          className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-card-border hover:border-primary/40"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted">
            <ImagePlus size={22} />
            <p className="text-sm">{t("ارفع صورة لإضافتها فوق الهدية", "Upload an image to place over the gift")}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-card-border">
            <img src={value} alt="Overlay preview" className="w-full h-32 object-cover bg-surface-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void onRemoveBackground(value)}
              disabled={removeBgLoading}
              className="flex items-center justify-center gap-2 rounded-lg border border-card-border py-2 text-sm hover:bg-surface-2 disabled:opacity-60"
            >
              {removeBgLoading ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
              {t("إزالة الخلفية", "Remove background")}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center justify-center gap-2 rounded-lg border border-card-border py-2 text-sm hover:bg-surface-2"
            >
              <Trash2 size={14} />
              {t("حذف الصورة", "Delete image")}
            </button>
          </div>
          <div
            {...getRootProps()}
            className="rounded-lg border border-card-border py-2 text-center text-sm cursor-pointer hover:bg-surface-2"
          >
            <input {...getInputProps()} />
            {t("استبدال الصورة", "Replace image")}
          </div>
        </div>
      )}

      {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
    </div>
  );
}
