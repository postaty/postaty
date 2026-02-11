"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { CATEGORY_LABELS, FORMAT_CONFIGS } from "@/lib/constants";
import type { Category, OutputFormat } from "@/lib/types";

interface GenerationOutput {
  format: string;
  storageId?: string;
  url?: string | null;
  width: number;
  height: number;
}

interface GenerationData {
  _id: string;
  category: string;
  businessName: string;
  productName: string;
  status: string;
  outputs: GenerationOutput[];
  createdAt: number;
  error?: string;
}

interface GenerationCardProps {
  generation: GenerationData;
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  complete: {
    label: "مكتمل",
    classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  partial: {
    label: "جزئي",
    classes: "bg-amber-50 text-amber-600 border-amber-200",
  },
  failed: {
    label: "فشل",
    classes: "bg-red-50 text-red-600 border-red-200",
  },
  processing: {
    label: "جاري المعالجة",
    classes: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse",
  },
  queued: {
    label: "في الانتظار",
    classes: "bg-surface-1 text-muted border-card-border",
  },
};

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function GenerationCard({ generation }: GenerationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusInfo = STATUS_LABELS[generation.status] ?? STATUS_LABELS.queued;
  const categoryLabel =
    CATEGORY_LABELS[generation.category as Category] ?? generation.category;

  const outputsWithUrls = generation.outputs.filter(
    (o) => o.url || o.storageId
  );

  const handleDownload = async (url: string, format: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `poster-${format}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // Download failed silently
    }
  };

  return (
    <div className="bg-surface-1/70 backdrop-blur-md rounded-2xl border border-card-border shadow-sm overflow-hidden transition-all hover:bg-surface-1/90 hover:shadow-md">
      {/* Collapsed Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-surface-2/50 transition-colors"
      >
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted shrink-0">
          <Calendar size={14} />
          <span>{formatDate(generation.createdAt)}</span>
        </div>

        {/* Category Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-1 text-foreground rounded-lg text-xs font-medium shrink-0 border border-card-border shadow-sm">
          <Tag size={12} className="text-primary" />
          {categoryLabel}
        </span>

        {/* Business Name */}
        <span className="text-sm font-bold text-foreground truncate">
          {generation.businessName}
        </span>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 ${statusInfo.classes}`}
        >
          {statusInfo.label}
        </span>

        {/* Thumbnail Strip */}
        <div className="flex gap-1.5 mr-auto">
          {outputsWithUrls.slice(0, 3).map((output, i) =>
            output.url ? (
              <img
                key={i}
                src={output.url}
                alt=""
                className="w-8 h-8 rounded-lg object-cover border border-card-border bg-surface-1"
              />
            ) : (
              <div
                key={i}
                className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center border border-card-border"
              >
                <ImageIcon size={12} className="text-muted-foreground" />
              </div>
            )
          )}
        </div>

        {/* Expand Toggle */}
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-card-border p-4 bg-surface-2/50">
          {generation.error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {generation.error}
            </div>
          )}

          {generation.outputs.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              لا توجد صور متاحة
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generation.outputs.map((output, i) => {
                const formatConfig =
                  FORMAT_CONFIGS[output.format as OutputFormat];
                const label = formatConfig?.label ?? output.format;

                return (
                  <div
                    key={i}
                    className="bg-surface-1 rounded-xl border border-card-border overflow-hidden shadow-sm"
                  >
                    <div className="p-3 border-b border-card-border bg-surface-2/50">
                      <p className="text-xs font-bold text-center text-foreground">
                        {label}
                      </p>
                    </div>
                    <div className="p-4 flex justify-center items-center min-h-[160px] bg-surface-2/30">
                      {output.url ? (
                        <img
                          src={output.url}
                          alt={label}
                          className="max-w-full max-h-[200px] object-contain rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageIcon size={24} />
                          <span className="text-xs">غير متاح</span>
                        </div>
                      )}
                    </div>
                    {output.url && (
                      <div className="p-3 border-t border-card-border bg-surface-1">
                        <button
                          onClick={() =>
                            handleDownload(output.url!, output.format)
                          }
                          className="w-full flex items-center justify-center gap-2 py-2 bg-surface-1 border border-card-border text-foreground rounded-lg text-xs font-bold hover:bg-surface-1 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                        >
                          <Download size={14} />
                          تحميل
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
