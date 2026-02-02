"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Palette,
  ImageIcon,
  Wand2,
  Type,
  LayoutGrid,
} from "lucide-react";
import type { GenerationResult } from "@/lib/types";
import { PosterPreview } from "./poster-preview";

interface GenerationViewProps {
  step: "crafting-prompt" | "generating-images" | "complete" | "error";
  results: GenerationResult[];
  error?: string;
}

const GENERATION_STEPS = [
  { icon: Wand2, label: "تحليل بيانات العرض", sublabel: "فهم تفاصيل المنتج والعرض" },
  { icon: Palette, label: "اختيار الألوان والتصميم", sublabel: "تصميم هوية بصرية جذابة" },
  { icon: Type, label: "كتابة النصوص الإبداعية", sublabel: "صياغة نص تسويقي مؤثر" },
  { icon: ImageIcon, label: "معالجة الصور", sublabel: "تحسين جودة صور المنتج" },
  { icon: LayoutGrid, label: "تنسيق البوستر", sublabel: "ترتيب العناصر بشكل احترافي" },
  { icon: Sparkles, label: "اللمسات النهائية", sublabel: "إضافة تأثيرات بصرية مميزة" },
];

const TIPS = [
  "البوسترات المصممة باحترافية تزيد التفاعل بنسبة 80%",
  "الألوان الدافئة تجذب انتباه المتسوقين أكثر",
  "العروض المحدودة الوقت تحقق مبيعات أعلى بـ 3 أضعاف",
  "صور المنتجات عالية الجودة تزيد الثقة لدى العملاء",
  "إضافة السعر القديم مع الجديد يبرز قيمة العرض",
];

function SkeletonLoader() {
  const [activeStep, setActiveStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 3000);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Animated poster skeleton */}
      <div className="max-w-sm mx-auto">
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-lg">
          {/* Skeleton header */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-primary/10 rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-primary/5 rounded-lg w-1/2 animate-pulse" style={{ animationDelay: "150ms" }} />
              </div>
            </div>
          </div>

          {/* Skeleton image area */}
          <div className="relative mx-4">
            <div className="aspect-square bg-gradient-to-br from-primary/5 via-accent/10 to-success/5 rounded-xl animate-pulse overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              {/* Shimmer effect */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>

          {/* Skeleton price area */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-accent/20 rounded-xl w-24 animate-pulse" />
              <div className="h-5 bg-danger/10 rounded-lg w-16 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
            <div className="h-12 bg-success/15 rounded-xl animate-pulse" style={{ animationDelay: "200ms" }} />
            <div className="flex gap-2">
              <div className="h-8 bg-primary/10 rounded-lg flex-1 animate-pulse" style={{ animationDelay: "100ms" }} />
              <div className="h-8 bg-success/10 rounded-lg w-20 animate-pulse" style={{ animationDelay: "250ms" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div className="max-w-md mx-auto space-y-3">
        {GENERATION_STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500
                ${isActive ? "bg-primary/10 border border-primary/30 scale-[1.02]" : ""}
                ${isDone ? "opacity-50" : ""}
                ${!isActive && !isDone ? "opacity-30" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500
                  ${isActive ? "bg-primary text-white" : isDone ? "bg-success/20 text-success" : "bg-card-border/50 text-muted"}`}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : isActive ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                  {s.label}
                </p>
                {isActive && (
                  <p className="text-xs text-muted mt-0.5 animate-in fade-in duration-300">
                    {s.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="text-center">
        <p className="text-sm text-muted transition-all duration-500" key={tipIndex}>
          <span className="text-accent">*</span> {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}

export function GenerationView({ step, results, error }: GenerationViewProps) {
  const isLoading = step === "crafting-prompt" || step === "generating-images";

  return (
    <div className="space-y-8">
      {isLoading && <SkeletonLoader />}

      {step === "complete" && (
        <div className="flex items-center justify-center gap-3 py-4">
          <CheckCircle2 size={24} className="text-success" />
          <span className="text-lg font-medium">تم إنشاء البوسترات بنجاح!</span>
        </div>
      )}

      {step === "error" && (
        <>
          <div className="flex items-center justify-center gap-3 py-4">
            <XCircle size={24} className="text-danger" />
            <span className="text-lg font-medium">حدث خطأ</span>
          </div>
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 text-center text-danger">
              {error}
            </div>
          )}
        </>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <PosterPreview key={result.format} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
