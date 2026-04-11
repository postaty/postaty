"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { OutputFormat } from "@/lib/types";
import { POSTER_GENERATION_FORMATS } from "@/lib/constants";
import { useLocale } from "@/hooks/use-locale";

interface FormatSelectorProps {
  selected: OutputFormat;
  onChange: (format: OutputFormat) => void;
}

// Visual aspect ratio dimensions (fit inside ~40x34 space)
const RATIO_SHAPES: Record<OutputFormat, { w: number; h: number; label: string }> = {
  "instagram-square":   { w: 26, h: 34, label: "3:4" },
  "instagram-portrait": { w: 27, h: 34, label: "4:5" },
  "instagram-story":    { w: 19, h: 34, label: "9:16" },
  "facebook-post":      { w: 27, h: 34, label: "4:5" },
  "facebook-cover":     { w: 40, h: 22, label: "16:9" },
  "twitter-post":       { w: 40, h: 22, label: "16:9" },
  "whatsapp-status":    { w: 19, h: 34, label: "9:16" },
};


function AspectRatioIcon({ w, h, active }: { w: number; h: number; active: boolean }) {
  const vw = 48;
  const vh = 42;
  const rx = Math.round(Math.min(w, h) * 0.12);
  return (
    <svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`} fill="none">
      <rect
        x={(vw - w) / 2}
        y={(vh - h) / 2}
        width={w}
        height={h}
        rx={rx}
        ry={rx}
        stroke={active ? "white" : "currentColor"}
        strokeWidth={active ? 2.5 : 2}
        fill="none"
        opacity={active ? 1 : 0.55}
      />
    </svg>
  );
}

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  const { t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-foreground/80">
        {t("اختر حجم المنشور", "Select post size")}
      </label>
      <div className="relative flex items-center gap-1">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 border border-card-border text-foreground/60 hover:text-foreground hover:border-primary/40 transition-colors z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth flex-1 py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {POSTER_GENERATION_FORMATS.map((format) => {
            const shape = RATIO_SHAPES[format];
            const isSelected = format === selected;

            return (
              <button
                key={format}
                type="button"
                onClick={() => onChange(format)}
                className={`shrink-0 flex flex-col items-center justify-center gap-1.5 w-[72px] h-[88px] rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? "bg-foreground/15 text-foreground border border-foreground/20"
                    : "text-muted-foreground hover:bg-surface-2 border border-transparent"
                }`}
              >
                <AspectRatioIcon w={shape.w} h={shape.h} active={isSelected} />
                <span className={`text-[11px] font-semibold tracking-wide ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                  {shape.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 border border-card-border text-foreground/60 hover:text-foreground hover:border-primary/40 transition-colors z-10"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
