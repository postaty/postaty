"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UtensilsCrossed,
  ShoppingCart,
  Store,
  Wrench,
  Shirt,
  Upload,
  Palette,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { ImageUpload } from "../components/image-upload";
import { extractDominantColors } from "@/lib/color-extraction";

const CATEGORIES: { id: Category; label: string; icon: typeof UtensilsCrossed; color: string; bg: string }[] = [
  { id: "restaurant", label: "مطاعم وكافيهات", icon: UtensilsCrossed, color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "supermarket", label: "سوبر ماركت", icon: ShoppingCart, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "ecommerce", label: "متاجر إلكترونية", icon: Store, color: "text-violet-400", bg: "bg-violet-500/10" },
  { id: "services", label: "خدمات", icon: Wrench, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "fashion", label: "أزياء وموضة", icon: Shirt, color: "text-pink-400", bg: "bg-pink-500/10" },
  { id: "beauty", label: "تجميل وعناية", icon: Sparkles, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
];

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleBusinessNameNext = () => {
    if (businessName.trim()) {
      setStep(3);
    }
  };

  const handleLogoChange = async (dataUrl: string | null) => {
    setLogo(dataUrl);
    if (dataUrl) {
      setIsExtracting(true);
      try {
        const colors = await extractDominantColors(dataUrl, 5);
        setExtractedColors(colors);
      } catch {
        setExtractedColors([]);
      } finally {
        setIsExtracting(false);
      }
    } else {
      setExtractedColors([]);
    }
  };

  const handleLogoNext = () => {
    if (logo) {
      setStep(4);
    }
  };

  const handleColorsNext = () => {
    setStep(5);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await completeOnboarding({
        businessName: businessName.trim(),
        businessCategory: selectedCategory!,
        brandColors: extractedColors,
      });
      router.push("/create");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Still redirect even if save fails
      router.push("/create");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-surface-1/80 backdrop-blur-xl border border-card-border shadow-xl rounded-3xl p-8 md:p-10 animate-fade-in-up">

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step > i ? "w-8 bg-primary" : step === i + 1 ? "w-6 bg-primary/50" : "w-2 bg-surface-2"
                }`}
              />
            ))}
          </div>

          {/* Back button */}
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6 transition-colors"
            >
              <ArrowRight size={16} />
              <span>رجوع</span>
            </button>
          )}

          {/* Step 1: Welcome + Category Selection */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Sparkles size={32} className="text-primary animate-pulse" />
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                مرحباً بك في <span className="text-gradient-primary">Postaty AI</span>
              </h1>

              <p className="text-muted text-lg leading-relaxed">
                ما هو نوع نشاطك التجاري؟
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`group flex flex-col items-center gap-3 p-4 rounded-xl border border-card-border hover:border-primary/30 hover:bg-surface-2 transition-all ${
                        selectedCategory === cat.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${cat.bg} group-hover:scale-110 transition-transform`}>
                        <Icon size={24} className={cat.color} />
                      </div>
                      <span className="font-bold text-sm text-foreground">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Business Name */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Store size={32} className="text-primary" />
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                ما اسم نشاطك التجاري؟
              </h1>

              <p className="text-muted leading-relaxed">
                سنستخدم هذا الاسم تلقائياً في تصاميمك
              </p>

              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="مثال: مطعم الشام، متجر نون..."
                className="w-full px-5 py-4 bg-surface-2 border border-card-border rounded-xl text-foreground text-center text-lg font-bold placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleBusinessNameNext()}
              />

              <button
                onClick={handleBusinessNameNext}
                disabled={!businessName.trim()}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                التالي
              </button>
            </div>
          )}

          {/* Step 3: Logo Upload */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Upload size={32} className="text-primary" />
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                ارفع لوجو نشاطك
              </h1>

              <p className="text-muted leading-relaxed">
                سنستخرج ألوان علامتك التجارية تلقائياً
              </p>

              <div className="max-w-xs mx-auto">
                <ImageUpload label="لوجو النشاط" value={logo} onChange={handleLogoChange} />
              </div>

              {isExtracting && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>جاري استخراج الألوان...</span>
                </div>
              )}

              <button
                onClick={handleLogoNext}
                disabled={!logo || isExtracting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                التالي
              </button>
            </div>
          )}

          {/* Step 4: Color Palette Preview */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Palette size={32} className="text-primary" />
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                ألوان علامتك التجارية
              </h1>

              <p className="text-muted leading-relaxed">
                هذه الألوان تم استخراجها من اللوجو وسنستخدمها في تصاميمك
              </p>

              {extractedColors.length > 0 ? (
                <div className="flex items-center justify-center gap-3 py-6">
                  {extractedColors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-14 h-14 rounded-xl shadow-md border border-card-border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-muted text-sm">
                  لم يتم استخراج ألوان. يمكنك المتابعة بدون ألوان.
                </div>
              )}

              <button
                onClick={handleColorsNext}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
              >
                التالي
              </button>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
                <CheckCircle2 size={40} className="text-success" />
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                أنت جاهز للبدء!
              </h1>

              <div className="bg-surface-2 rounded-xl p-6 text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">النشاط</span>
                  <span className="font-bold text-foreground">
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                  </span>
                </div>
                <div className="border-t border-card-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">الاسم</span>
                  <span className="font-bold text-foreground">{businessName}</span>
                </div>
                {extractedColors.length > 0 && (
                  <>
                    <div className="border-t border-card-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-muted text-sm">الألوان</span>
                      <div className="flex gap-1">
                        {extractedColors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-md border border-card-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <p className="text-muted text-lg leading-relaxed max-w-sm mx-auto">
                سنملأ هذه البيانات تلقائياً في كل تصميم جديد.
              </p>

              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <span>ابدأ التصميم الآن</span>
                    <ArrowLeft size={20} />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          Postaty AI
        </p>
      </div>
    </main>
  );
}
